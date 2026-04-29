import { __ } from '@wordpress/i18n';
import { BlockControls, InspectorControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, Button, DropdownMenu } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { cloneBlock, createBlock } from '@wordpress/blocks';

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

    if (!currentBlock) {
        return null;
    }

    const createNewForm = () => {
        const formBuilderBlock = createBlock(
            'gutenverse/form-builder',
            {
                openFormActionOnMount: true,
            },
            [cloneBlock(currentBlock)]
        );

        replaceBlocks(clientId, formBuilderBlock);
        selectBlock(formBuilderBlock.clientId);
    };

    const addToExistingForm = (targetFormBuilderId) => {
        if (!targetFormBuilderId) {
            return;
        }

        insertBlocks(cloneBlock(currentBlock), undefined, targetFormBuilderId);
        removeBlocks(clientId, false);
        selectBlock(targetFormBuilderId);
    };

    const formBuilderOptions = formBuilders.map((builder, index) => ({
        title: builder.attributes?.formId?.label || builder.attributes?.elementId || `${__('Form Builder', 'gutenverse-form')} ${index + 1}`,
        onClick: () => addToExistingForm(builder.clientId),
    }));

    return (
        <div className="gutenverse-form-builder-notice">
            <div className="gutenverse-form-builder-notice-content">
                <span className="gutenverse-form-builder-notice-icon" aria-hidden="true">
                    <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3C3.13428 3 0 6.13541 0 10C0 13.8668 3.13428 17 7 17C10.8657 17 14 13.8668 14 10C14 6.13541 10.8657 3 7 3ZM7 6.10484C7.65473 6.10484 8.18548 6.6356 8.18548 7.29032C8.18548 7.94505 7.65473 8.47581 7 8.47581C6.34527 8.47581 5.81452 7.94505 5.81452 7.29032C5.81452 6.6356 6.34527 6.10484 7 6.10484ZM8.58064 13.2742C8.58064 13.4612 8.42899 13.6129 8.24193 13.6129H5.75806C5.57101 13.6129 5.41935 13.4612 5.41935 13.2742V12.5968C5.41935 12.4097 5.57101 12.2581 5.75806 12.2581H6.09677V10.4516H5.75806C5.57101 10.4516 5.41935 10.3 5.41935 10.1129V9.43548C5.41935 9.24843 5.57101 9.09677 5.75806 9.09677H7.56452C7.75157 9.09677 7.90323 9.24843 7.90323 9.43548V12.2581H8.24193C8.42899 12.2581 8.58064 12.4097 8.58064 12.5968V13.2742Z" fill="#FFC908" />
                    </svg>
                </span>
                <div className="gutenverse-form-builder-notice-copy">
                    <div className="gutenverse-form-builder-notice-title">{__('Input is outside a Form Builder', 'gutenverse-form')}</div>
                    <div className="gutenverse-form-builder-notice-description">{__('Create a new form, or insert this block into an existing one.', 'gutenverse-form')}</div>
                </div>
            </div>
            <div className="gutenverse-form-builder-notice-actions">
                <Button
                    variant="primary"
                    className="gutenverse-form-builder-notice-create"
                    onClick={createNewForm}
                >
                    {__('Create New Form', 'gutenverse-form')}
                </Button>
                <DropdownMenu
                    className="gutenverse-form-builder-notice-dropdown"
                    icon={null}
                    label={__('Connect to Form', 'gutenverse-form')}
                    text={__('Connect to Form', 'gutenverse-form')}
                    controls={formBuilderOptions}
                    popoverProps={{
                        className: 'gutenverse-form-builder-notice-popover',
                    }}
                    toggleProps={{
                        className: 'gutenverse-form-builder-notice-connect',
                        disabled: formBuilderOptions.length === 0,
                    }}
                />
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
