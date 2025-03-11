import { compose } from '@wordpress/compose';
import { useRef } from '@wordpress/element';
import { useBlockProps, RichText, BlockControls } from '@wordpress/block-editor';
import classnames from 'classnames';
import { useState } from '@wordpress/element';
import { createPortal } from 'react-dom';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { displayShortcut } from '@wordpress/keycodes';
import { BlockPanelController, IconLibrary } from 'gutenverse-core/controls';
import { withCustomStyle, withMouseMoveEffect, withPartialRender } from 'gutenverse-core/hoc';
import { PanelController } from 'gutenverse-core/controls';
import { panelList } from './panels/panel-list';
import { __ } from '@wordpress/i18n';
import { LogoCircleColor24SVG } from 'gutenverse-core/icons';
import { useEffect } from '@wordpress/element';
import { useAnimationEditor } from 'gutenverse-core/hooks';
import { useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';

const FormInputSubmitBlock = compose(
    withMouseMoveEffect
)((props) => {
    const {
        attributes,
        setAttributes,
        displayClass,
        setElementRef,
        clientId
    } = props;

    const {
        elementId,
        content,
        buttonType,
        buttonSize,
        showIcon,
        icon,
        iconPosition = 'before',
    } = attributes;

    const elementRef = useRef();
    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);
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
        <CopyElementToolbar {...props}/>
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
                {showIcon && iconPosition === 'before' && <i className={`fa-lg ${icon}`} onClick={() => setOpenIconLibrary(true)} />}
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
                {showIcon && iconPosition === 'after' && <i className={`fa-lg ${icon}`} onClick={() => setOpenIconLibrary(true)} />}
            </button>
            <div className="gutenverse-input-submit-loader">
                <i className="fas fa-spinner fa-spin" />
            </div>
        </div>
    </>;
});

export default FormInputSubmitBlock;
