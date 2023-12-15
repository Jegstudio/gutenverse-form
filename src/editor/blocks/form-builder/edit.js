import { compose } from '@wordpress/compose';

import { withCustomStyle } from 'gutenverse-core/hoc';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import classnames from 'classnames';
import { PanelController } from 'gutenverse-core/controls';
import { panelList } from './panels/panel-list';
import { useRef } from '@wordpress/element';
import { useEffect } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';
import { withAnimationSticky } from 'gutenverse-core/hoc';
import { isSticky } from 'gutenverse-core/helper';
import { useAnimationEditor } from 'gutenverse-core/hooks';
import { useDisplayEditor } from 'gutenverse-core/hooks';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { PanelTutorial } from 'gutenverse-core/controls';

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
    withCustomStyle(panelList),
    withAnimationSticky(),
    withCopyElementToolbar()
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
        setElementRef
    } = props;

    const {
        elementId,
        sticky = {},
        stickyPosition
    } = attributes;

    const formBuilderRef = useRef();
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
        ref: formBuilderRef
    });

    const Component = hasChildBlocks ? FormWrapper : FormPlaceholder;

    useEffect(() => {
        if (formBuilderRef.current) {
            setElementRef(formBuilderRef.current);
        }
    }, [formBuilderRef]);

    return <>
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
                        description: __('In the "Form Setting" below, you can click "Choose Form" and type your form\'s name to search it.', 'gutenverse-form')
                    }
                ]}
            />
        </InspectorControls>
        <PanelController panelList={panelList} {...props} />
        <Component blockProps={blockProps} attributes={attributes} clientId={clientId} />
    </>;
});

export default FormBuilderBlock;