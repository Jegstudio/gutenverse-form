import { __ } from '@wordpress/i18n';
import { BlockControls, InspectorControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';

const FormNavigation = ({ clientId }) => {
    const { selectBlock } = useDispatch('core/block-editor');

    const formBuilderId = useSelect((select) => {
        const { getBlockRootClientId, getBlockName } = select('core/block-editor');
        let currentId = clientId;
        while (currentId) {
            const parentId = getBlockRootClientId(currentId);
            if (!parentId) return null;
            if (getBlockName(parentId) === 'gutenverse/form-builder') {
                return parentId;
            }
            currentId = parentId;
        }
        return null;
    }, [clientId]);

    if (!formBuilderId) {
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
