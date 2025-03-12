import { compose } from '@wordpress/compose';
import { withAnimationStickyV2, withMouseMoveEffect, withPassRef } from 'gutenverse-core/hoc';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import classnames from 'classnames';
import { BlockPanelController } from 'gutenverse-core/controls';
import { panelList } from './panels/panel-list';
import { useEffect, useRef } from '@wordpress/element';
import { isSticky } from 'gutenverse-core/helper';
import { useAnimationEditor } from 'gutenverse-core/hooks';
import { useDisplayEditor } from 'gutenverse-core/hooks';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { PanelTutorial } from 'gutenverse-core/controls';
import { useDynamicScript, useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';

const NoticeMessages = ({ successExample = false, errorExample = false }) => {
    return <>
        {successExample && <div className="form-notification"><div className="notification-body guten-success">{__('Thank you! (You can setup this message inside your form setting in Dashboard->Form).')}</div></div>}
        {errorExample && <div className="form-notification"><div className="notification-body guten-error">{__('Something went wrong! (You can setup this message inside your form setting in Dashboard->Form).')}</div></div>}
    </>;
};

const FormWrapper = ({ blockProps, attributes }) => {
    return (
        <div {...blockProps}>
            <NoticeMessages {...attributes} />
            <InnerBlocks />
        </div>
    );
};

const FormPlaceholder = ({ blockProps, attributes, clientId }) => {
    return (
        <div {...blockProps}>
            <NoticeMessages {...attributes} />
            <InnerBlocks
                renderAppender={InnerBlocks.ButtonBlockAppender}
                clientId={clientId}
            />
        </div>
    );
};

const FormBuilderBlock = compose(
    withPassRef,
    withAnimationStickyV2(),
    withMouseMoveEffect
)((props) => {
    const {
        getBlockOrder
    } = useSelect(
        (select) => select('core/block-editor'),
        []
    );

    const {
        clientId,
        attributes,
        setBlockRef,
    } = props;

    const {
        elementId,
        sticky = {},
        stickyPosition
    } = attributes;

    const elementRef = useRef();
    const animationClass = useAnimationEditor(attributes);
    const displayClass = useDisplayEditor(attributes);
    const hasChildBlocks = getBlockOrder(clientId).length > 0;

    const blockProps = useBlockProps({
        className: classnames(
            'guten-element',
            'guten-form-builder',
            'no-margin',
            elementId,
            animationClass,
            displayClass,
            {
                [`sticky-${stickyPosition}`]: isSticky(sticky),
            }
        ),
        ref: elementRef
    });

    const Component = hasChildBlocks ? FormWrapper : FormPlaceholder;

    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);
    useDynamicScript(elementRef);

    useEffect(() => {
        if (elementRef) {
            setBlockRef(elementRef);
        }
    }, [elementRef]);

    return <>
        <CopyElementToolbar {...props}/>
        <InspectorControls>
            <PanelTutorial
                title={__('How to use form builder', 'gutenverse-form')}
                list={[
                    {
                        title: __('Adding inputs', 'gutenverse-form'),
                        description: __('Click the + symbol on form builder block, then search for inputs you need ("checkbox", "text", "email", etc). Also don\'t forget to add "submit button"', 'gutenverse-form')
                    },
                    {
                        title: __('Creating your form setting', 'gutenverse-form'),
                        description: __('You need to create a form first from your "Dashboard -> Form."', 'gutenverse-form')
                    },
                    {
                        title: __('Selecting your form setting', 'gutenverse-form'),
                        description: __('In the "Form Setting" below, you can click "Choose Form Action" and type your form\'s name to search it.', 'gutenverse-form')
                    }
                ]}
            />
        </InspectorControls>
        <BlockPanelController panelList={panelList} props={props} elementRef={elementRef} />
        <Component blockProps={blockProps} attributes={attributes} clientId={clientId} />
    </>;
});

export default FormBuilderBlock;