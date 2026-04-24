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
            {},
            [cloneBlock(currentBlock)]
        );

        replaceBlocks(clientId, formBuilderBlock);
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
                <div className="gutenverse-form-builder-notice-copy">
                    <div className="gutenverse-form-builder-notice-title">{__('Input is outside a form container', 'gutenverse-form')}</div>
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
