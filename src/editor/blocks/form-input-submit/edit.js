import { compose } from '@wordpress/compose';
import { useRef } from '@wordpress/element';
import { useBlockProps, RichText, BlockControls } from '@wordpress/block-editor';
import classnames from 'classnames';
import { useState } from '@wordpress/element';
import { createPortal } from 'react-dom';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import FormNavigation from '../form-input/general/form-navigation';
import { displayShortcut } from '@wordpress/keycodes';
import { BlockPanelController, IconLibrary } from 'gutenverse-core/controls';
import { withMouseMoveEffect, withPartialRender, withPassRef } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import { __ } from '@wordpress/i18n';
import { LogoCircleColor24SVG } from 'gutenverse-core/icons';
import { useAnimationEditor } from 'gutenverse-core/hooks';
import { useDynamicScript, useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';
import { renderIcon } from 'gutenverse-core/helper';

const FormInputSubmitBlock = compose(
    withMouseMoveEffect,
    withPartialRender,
    withPassRef,
)((props) => {
    const {
        attributes,
        setAttributes,
        displayClass,
        clientId
    } = props;

    const {
        elementId,
        content,
        buttonType,
        buttonSize,
        showIcon,
        icon,
        iconType,
        iconSVG,
        iconPosition = 'before',
    } = attributes;

    const elementRef = useRef();
    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);
    useDynamicScript(elementRef);

    const textRef = useRef();
    const animationClass = useAnimationEditor(attributes);
    const root = document.getElementById('gutenverse-root');
    const [openIconLibrary, setOpenIconLibrary] = useState(false);
    const placeholder = showIcon ? '' : __('Button Text...');

    const blockProps = useBlockProps({
        className: classnames(
            'guten-element',
            'guten-button-wrapper',
            'guten-submit-wrapper',
            elementId,
            displayClass
        ),
        ref: elementRef
    });

    const buttonProps = {
        className: classnames(
            'guten-button',
            'gutenverse-input-submit',
            animationClass,
            {
                [`guten-button-${buttonType}`]: buttonType && buttonType !== 'default',
                [`guten-button-${buttonSize}`]: buttonSize,
            }
        ),
    };

    return <>
        <CopyElementToolbar {...props} />
        <FormNavigation clientId={clientId} />
        <BlockPanelController panelList={panelList} props={props} elementRef={elementRef} />
        {openIconLibrary && createPortal(
            <IconLibrary
                closeLibrary={() => setOpenIconLibrary(false)}
                value={icon}
                onChange={icon => setAttributes({ icon })}
            />,
            root
        )}
        <BlockControls>
            <ToolbarGroup>
                <ToolbarButton
                    name="icon"
                    icon={<LogoCircleColor24SVG />}
                    title={__('Choose Icon', 'gutenverse-form')}
                    shortcut={displayShortcut.primary('i')}
                    onClick={() => setOpenIconLibrary(true)}
                />
            </ToolbarGroup>
        </BlockControls>
        <div  {...blockProps}>
            <button {...buttonProps} onClick={() => { }} onSubmit={() => textRef.current.focus()}>
                {showIcon && iconPosition === 'before' && renderIcon(icon, iconType, iconSVG)}
                <RichText
                    tagName={'span'}
                    value={content}
                    placeholder={placeholder}
                    onChange={(value) => setAttributes({ content: value })}
                    multiline={false}
                    withoutInteractiveFormatting
                    identifier="content"
                    ref={textRef}
                />
                {showIcon && iconPosition === 'after' && renderIcon(icon, iconType, iconSVG)}
            </button>
            <div className="gutenverse-input-submit-loader">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M272 112C272 85.5 293.5 64 320 64C346.5 64 368 85.5 368 112C368 138.5 346.5 160 320 160C293.5 160 272 138.5 272 112zM272 528C272 501.5 293.5 480 320 480C346.5 480 368 501.5 368 528C368 554.5 346.5 576 320 576C293.5 576 272 554.5 272 528zM112 272C138.5 272 160 293.5 160 320C160 346.5 138.5 368 112 368C85.5 368 64 346.5 64 320C64 293.5 85.5 272 112 272zM480 320C480 293.5 501.5 272 528 272C554.5 272 576 293.5 576 320C576 346.5 554.5 368 528 368C501.5 368 480 346.5 480 320zM139 433.1C157.8 414.3 188.1 414.3 206.9 433.1C225.7 451.9 225.7 482.2 206.9 501C188.1 519.8 157.8 519.8 139 501C120.2 482.2 120.2 451.9 139 433.1zM139 139C157.8 120.2 188.1 120.2 206.9 139C225.7 157.8 225.7 188.1 206.9 206.9C188.1 225.7 157.8 225.7 139 206.9C120.2 188.1 120.2 157.8 139 139zM501 433.1C519.8 451.9 519.8 482.2 501 501C482.2 519.8 451.9 519.8 433.1 501C414.3 482.2 414.3 451.9 433.1 433.1C451.9 414.3 482.2 414.3 501 433.1z"/></svg>
            </div>
        </div>
    </>;
});

export default FormInputSubmitBlock;
