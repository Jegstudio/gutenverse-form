import { __, sprintf } from '@wordpress/i18n';
import { Button, Notice, Spinner } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useMemo, useState, useEffect, useRef } from '@wordpress/element';
import { store as noticesStore } from '@wordpress/notices';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
import { cryptoRandomString } from 'gutenverse-core/components';

const LOG_PREFIX = '[Gutenverse Form Bulk Style]';

const flattenBlocks = (blocks = []) => {
    return blocks.reduce((result, block) => {
        result.push(block);

        if (block.innerBlocks?.length) {
            result.push(...flattenBlocks(block.innerBlocks));
        }

        return result;
    }, []);
};

const getCopyableAttributes = (blockAttributes = {}) => {
    return Object.keys(blockAttributes).reduce((result, key) => {
        if (blockAttributes[key]?.copyStyle === true) {
            result[key] = true;
        }

        return result;
    }, {});
};

const isCompatibleBlock = (sourceName, sourceStyleGroup, targetName, targetStyleGroup) => {
    return sourceName === targetName || (!!sourceStyleGroup && sourceStyleGroup === targetStyleGroup);
};

const getBlockDisplayLabel = (block, index) => {
    const blockType = getBlockType(block.name);
    const baseLabel = block.attributes?.inputLabel || blockType?.title || block.name;

    return `${baseLabel} (#${index + 1})`;
};

export const BulkInputStylePanel = ({ clientId }) => {
    const { createInfoNotice, createErrorNotice } = useDispatch(noticesStore);
    const { updateBlockAttributes } = useDispatch(blockEditorStore);
    const [selectedSourceId, setSelectedSourceId] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [panelMessage, setPanelMessage] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const panelRef = useRef(null);

    const formInputBlocks = useSelect((select) => {
        const blocks = select('core/block-editor').getBlocks(clientId) || [];

        return flattenBlocks(blocks).filter(block => block.name?.startsWith('gutenverse/form-input-'));
    }, [clientId]);

    const sourceOptions = useMemo(() => {
        return [
            { label: __('Select a form input block', 'gutenverse-form'), value: '' },
            ...formInputBlocks.map((block, index) => ({
                label: getBlockDisplayLabel(block, index),
                value: block.clientId
            }))
        ];
    }, [formInputBlocks]);

    const selectedOption = useMemo(() => {
        return sourceOptions.find(option => option.value === selectedSourceId) || sourceOptions[0];
    }, [selectedSourceId, sourceOptions]);

    useEffect(() => {
        if (!selectedSourceId && formInputBlocks.length) {
            setSelectedSourceId(formInputBlocks[0].clientId);
        }

        if (selectedSourceId && !formInputBlocks.some(block => block.clientId === selectedSourceId)) {
            setSelectedSourceId(formInputBlocks[0]?.clientId || '');
        }
    }, [formInputBlocks, selectedSourceId]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (!panelRef.current?.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);

        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);

    useEffect(() => {
        if (!isApplying) {
            return undefined;
        }

        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = __('Bulk style application is still in progress. Please stay on this page until it finishes.', 'gutenverse-form');
            return event.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isApplying]);

    const applyStyleToCompatibleInputs = async () => {
        if (isApplying) {
            return;
        }

        setPanelMessage(null);

        const sourceBlock = formInputBlocks.find(block => block.clientId === selectedSourceId);

        if (!sourceBlock) {
            const error = __('Please select a source input block first.', 'gutenverse-form');
            console.error(`${LOG_PREFIX} Source block not found for clientId:`, selectedSourceId); // eslint-disable-line no-console
            createErrorNotice(error, { type: 'snackbar', isDismissible: true });
            setPanelMessage({ status: 'error', text: error });
            return;
        }

        const sourceType = getBlockType(sourceBlock.name);
        const sourceBlockAttributes = sourceType?.attributes || {};
        const sourceCopyableAttributes = getCopyableAttributes(sourceBlockAttributes);
        const sourceStyleGroup = sourceType?.styleGroup;
        const sourceAttributes = Object.keys(sourceCopyableAttributes).reduce((result, key) => {
            result[key] = sourceBlock.attributes[key];
            return result;
        }, {});

        const compatibleTargets = formInputBlocks.filter(block => {
            if (block.clientId === sourceBlock.clientId) {
                return false;
            }

            const targetType = getBlockType(block.name);
            return isCompatibleBlock(sourceBlock.name, sourceStyleGroup, block.name, targetType?.styleGroup);
        });

        if (!compatibleTargets.length) {
            const warning = __('No compatible input blocks were found in this form builder.', 'gutenverse-form');
            console.warn(`${LOG_PREFIX} No compatible targets for source block:`, sourceBlock.name, sourceStyleGroup); // eslint-disable-line no-console
            createInfoNotice(warning, { type: 'snackbar', isDismissible: true });
            setPanelMessage({ status: 'warning', text: warning });
            setIsDropdownOpen(false);
            return;
        }

        setIsApplying(true);
        setIsDropdownOpen(false);
        setPanelMessage({
            status: 'warning',
            text: __('Applying styles now. Please do not close or reload this page until the process finishes.', 'gutenverse-form')
        });

        let appliedCount = 0;
        const skippedTargets = [];

        try {
            for (const targetBlock of compatibleTargets) {
                const targetType = getBlockType(targetBlock.name);
                const targetCopyableAttributes = getCopyableAttributes(targetType?.attributes || {});
                const filteredAttributes = Object.keys(sourceAttributes).reduce((result, key) => {
                    if (targetCopyableAttributes[key]) {
                        result[key] = sourceAttributes[key];
                    }
                    return result;
                }, {});

                if (!Object.keys(filteredAttributes).length) {
                    skippedTargets.push(targetBlock.name);
                    console.warn(`${LOG_PREFIX} Skipping target with no shared copyable attributes:`, targetBlock.name, targetBlock.clientId); // eslint-disable-line no-console
                    continue;
                }

                updateBlockAttributes(targetBlock.clientId, {
                    ...filteredAttributes,
                    refreshStyleId: 'refresh-' + cryptoRandomString({ length: 6, type: 'alphanumeric' })
                });

                appliedCount += 1;

                await new Promise(resolve => window.requestAnimationFrame(resolve));
            }

            if (skippedTargets.length) {
                console.warn(`${LOG_PREFIX} Some targets were skipped due to missing shared copyable attributes:`, skippedTargets); // eslint-disable-line no-console
            }

            const success = sprintf(__('Style applied to %d compatible inputs', 'gutenverse-form'), appliedCount);
            createInfoNotice(success, { type: 'snackbar', isDismissible: true });
            setPanelMessage({ status: 'success', text: success });
        } catch (error) {
            console.error(`${LOG_PREFIX} Failed while applying bulk styles:`, error); // eslint-disable-line no-console
            const failure = __('Error applying styles to any compatible inputs', 'gutenverse-form');
            createErrorNotice(failure, { type: 'snackbar', isDismissible: true });
            setPanelMessage({ status: 'error', text: failure });
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="gutenverse-form-bulk-style-panel" ref={panelRef}>
            <div className="components-base-control">
                <div className="components-base-control__field">
                    <label className="components-input-control__label">
                        {__('Source Input Block', 'gutenverse-form')}
                    </label>
                    <div className={`gutenverse-form-bulk-style-select ${isDropdownOpen ? 'is-open' : ''} ${isApplying || sourceOptions.length <= 1 ? 'is-disabled' : ''}`}>
                        <button
                            type="button"
                            className="gutenverse-form-bulk-style-select-trigger"
                            onClick={() => {
                                if (!isApplying && sourceOptions.length > 1) {
                                    setIsDropdownOpen(value => !value);
                                }
                            }}
                            aria-haspopup="listbox"
                            aria-expanded={isDropdownOpen}
                            disabled={isApplying || sourceOptions.length <= 1}
                        >
                            <span className="gutenverse-form-bulk-style-select-trigger-label">
                                {selectedOption?.label}
                            </span>
                            <span className="gutenverse-form-bulk-style-select-trigger-divider"></span>
                            <span className="gutenverse-form-bulk-style-select-trigger-icon" aria-hidden="true">
                                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.3164 0.935547L7.21484 7.5H6.78125L0.682617 0.935547L0.870117 0.733398L6.63281 6.93555L6.99902 7.33008L7.36523 6.93555L13.1279 0.733398L13.3164 0.935547Z" fill="#E6E6EF" stroke="#BDBEBF"/>
                                </svg>
                            </span>
                        </button>
                        <div className={`gutenverse-form-bulk-style-select-dropdown ${isDropdownOpen ? 'is-open' : ''}`}>
                            <div className="gutenverse-form-bulk-style-select-dropdown-inner" role="listbox" aria-label={__('Source Input Block', 'gutenverse-form')}>
                                {sourceOptions.filter(option => option.value).map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="option"
                                        aria-selected={selectedSourceId === option.value}
                                        className={`gutenverse-form-bulk-style-select-option ${selectedSourceId === option.value ? 'is-selected' : ''}`}
                                        onClick={() => {
                                            setSelectedSourceId(option.value);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <p className="components-base-control__help">
                    {__('Choose one input inside this form builder as the style source.', 'gutenverse-form')}
                </p>
            </div>
            <Button
                isPrimary
                isBusy={isApplying}
                disabled={isApplying || !selectedSourceId || sourceOptions.length <= 1}
                onClick={applyStyleToCompatibleInputs}
                className="gutenverse-form-action-button"
            >
                {__('Apply Style to All Compatible Inputs', 'gutenverse-form')}
            </Button>
            {isApplying && (
                <div className="gutenverse-form-bulk-style-progress">
                    <Spinner />
                    <span>{__('Applying styles now. Please do not close or reload this page until the process finishes.', 'gutenverse-form')}</span>
                </div>
            )}
            {panelMessage && (
                <Notice
                    status={panelMessage.status}
                    className={`gutenverse-form-bulk-style-notice is-${panelMessage.status}`}
                    isDismissible={!isApplying}
                    onRemove={() => !isApplying && setPanelMessage(null)}
                >
                    {panelMessage.text}
                </Notice>
            )}
        </div>
    );
};

export const bulkInputStylePanel = () => {
    return [
        {
            id: 'bulkInputStyleManager',
            component: BulkInputStylePanel,
        }
    ];
};
