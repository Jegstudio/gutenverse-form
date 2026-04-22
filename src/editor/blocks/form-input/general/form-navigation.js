import { __ } from '@wordpress/i18n';
import { BlockControls, InspectorControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, Button, SelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { cloneBlock, createBlock } from '@wordpress/blocks';
import { useEffect, useState } from '@wordpress/element';

const findFormBuilders = (blocks = [], acc = []) => {
    blocks.forEach((block) => {
        if (block.name === 'gutenverse/form-builder') {
            acc.push(block);
        }

        if (block.innerBlocks?.length) {
            findFormBuilders(block.innerBlocks, acc);
        }
    });

    return acc;
};

const FormBuilderHelper = ({ clientId, currentBlock, formBuilders }) => {
    const { insertBlocks, removeBlocks, replaceBlocks, selectBlock } = useDispatch('core/block-editor');
    const [selectedFormBuilder, setSelectedFormBuilder] = useState(formBuilders[0]?.clientId || '');

    useEffect(() => {
        if (!selectedFormBuilder && formBuilders[0]?.clientId) {
            setSelectedFormBuilder(formBuilders[0].clientId);
        }
    }, [formBuilders, selectedFormBuilder]);

    if (!currentBlock) {
        return null;
    }

    const createNewForm = () => {
        const formBuilderBlock = createBlock(
            'gutenverse/form-builder',
            {},
            [cloneBlock(currentBlock)]
        );

        replaceBlocks(clientId, formBuilderBlock);
    };

    const addToExistingForm = () => {
        if (!selectedFormBuilder) {
            return;
        }

        insertBlocks(cloneBlock(currentBlock), undefined, selectedFormBuilder);
        removeBlocks(clientId, false);
        selectBlock(selectedFormBuilder);
    };

    return (
        <div className="gutenverse-form-builder-helper">
            <div className="gutenverse-form-builder-helper-copy">
                <div className="gutenverse-form-builder-helper-title">
                    {__('This block needs a Form Builder', 'gutenverse-form')}
                </div>
                <div className="gutenverse-form-builder-helper-description">
                    {__('Create a new form, or insert this block into an existing one.', 'gutenverse-form')}
                </div>
            </div>
            <div className="gutenverse-form-builder-helper-actions">
                <div className="gutenverse-form-builder-helper-option is-create">
                    <div className="gutenverse-form-builder-helper-option-title">
                        {__('Create New Form', 'gutenverse-form')}
                    </div>
                    <Button
                        variant="primary"
                        onClick={createNewForm}
                    >
                        {__('Create New Form', 'gutenverse-form')}
                    </Button>
                </div>
                <div className="gutenverse-form-builder-helper-option is-existing">
                    <div className="gutenverse-form-builder-helper-option-title">
                        {__('Add To Existing Form', 'gutenverse-form')}
                    </div>
                    <div className="gutenverse-form-builder-helper-existing">
                        <SelectControl
                            label={__('Choose Existing Form', 'gutenverse-form')}
                            value={selectedFormBuilder}
                            options={formBuilders.length > 0
                                ? formBuilders.map((builder, index) => ({
                                    label: builder.attributes?.formId?.label || builder.attributes?.elementId || `${__('Form Builder', 'gutenverse-form')} ${index + 1}`,
                                    value: builder.clientId
                                }))
                                : [{
                                    label: __('No existing form on this page yet', 'gutenverse-form'),
                                    value: ''
                                }]}
                            onChange={setSelectedFormBuilder}
                            disabled={formBuilders.length === 0}
                        />
                        <Button
                            variant="secondary"
                            onClick={addToExistingForm}
                            disabled={!selectedFormBuilder}
                        >
                            {__('Insert Into Selected Form', 'gutenverse-form')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormNavigation = ({ clientId, helperPlacement = 'outside' }) => {
    const { selectBlock } = useDispatch('core/block-editor');

    const { formBuilderId, currentBlock, formBuilders } = useSelect((select) => {
        const { getBlockRootClientId, getBlockName, getBlock, getBlocks } = select('core/block-editor');
        let currentId = clientId;
        let parentFormBuilderId = null;

        while (currentId) {
            const parentId = getBlockRootClientId(currentId);
            if (!parentId) {
                break;
            }
            if (getBlockName(parentId) === 'gutenverse/form-builder') {
                parentFormBuilderId = parentId;
                break;
            }
            currentId = parentId;
        }

        return {
            formBuilderId: parentFormBuilderId,
            currentBlock: getBlock(clientId),
            formBuilders: findFormBuilders(getBlocks())
        };
    }, [clientId]);

    if (!formBuilderId && helperPlacement === 'inside') {
        return <FormBuilderHelper clientId={clientId} currentBlock={currentBlock} formBuilders={formBuilders} />;
    }

    if (!formBuilderId) {
        return null;
    }

    if (helperPlacement === 'inside') {
        return null;
    }

    return <>
        <BlockControls>
            <ToolbarGroup>
                <ToolbarButton
                    text={__('Select Form Builder', 'gutenverse-form')}
                    label={__('Select Form Builder', 'gutenverse-form')}
                    onClick={() => selectBlock(formBuilderId)}
                />
            </ToolbarGroup>
        </BlockControls>
        <InspectorControls>
            <div style={{ padding: '10px 20px', margin: '10px 0px 20px' }}>
                <Button
                    variant="secondary"
                    onClick={() => selectBlock(formBuilderId)}
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    {__('Select Form Builder', 'gutenverse-form')}
                </Button>
            </div>
        </InspectorControls>
    </>;
};

export default FormNavigation;
