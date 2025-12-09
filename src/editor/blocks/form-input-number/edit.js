import { compose } from '@wordpress/compose';
import { withMouseMoveEffect, withPartialRender, withPassRef } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { useRef } from '@wordpress/element';
import { IconLibrary } from 'gutenverse-core/controls';
import { useState } from '@wordpress/element';
import { createPortal } from 'react-dom';
import { gutenverseRoot, renderIcon } from 'gutenverse-core/helper';
import { getImageSrc } from 'gutenverse-core/editor-helper';
import { useDynamicScript, useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';

const FormInputNumberBlock = compose(
    withMouseMoveEffect,
    withPartialRender,
    withPassRef,
)(props => {
    const {
        attributes,
        setAttributes,
        clientId
    } = props;

    const {
        inputPlaceholder,
        inputName,
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning,
        inputMin,
        inputMax,
        inputStep,
        useIcon,
        iconType,
        iconStyleMode,
        icon,
        iconSVG,
        image,
        imageAlt,
        lazyLoad,
        elementId
    } = attributes;

    const elementRef = useRef();
    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);
    useDynamicScript(elementRef);

    const [openIconLibrary, setOpenIconLibrary] = useState(false);
    const imageAltText = imageAlt || null;

    const inputData = {
        ...props,
        type: 'number',
        panelList: panelList,
        elementRef
    };

    const validation = {
        type: 'number',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

    const imageLazyLoad = () => {
        if (lazyLoad) {
            return <img src={getImageSrc(image)} alt={imageAltText} loading="lazy" />;
        } else {
            return <img src={getImageSrc(image)} alt={imageAltText} />;
        }
    };
    const iconContent = () => {
        switch (iconType) {
            case 'icon':
            case 'svg':
                return <div className="form-input-number-icon type-icon">
                    <div className={`icon style-${iconStyleMode}`} onClick={() => setOpenIconLibrary(true)}>
                        {renderIcon(icon, iconType, iconSVG)}
                    </div>
                </div>;
            case 'image':
                return <div className="form-input-number-icon type-image">
                    <div className={`icon style-${iconStyleMode}`}>
                        {imageLazyLoad()}
                    </div>
                </div>;
            default:
                return null;
        }
    };

    return <>
        <CopyElementToolbar {...props} />
        <InputWrapper {...inputData}>
            {openIconLibrary && createPortal(
                <IconLibrary
                    closeLibrary={() => setOpenIconLibrary(false)}
                    value={icon}
                    onChange={icon => setAttributes({ icon })}
                />,
                gutenverseRoot
            )}
            {useIcon ?
                <div className="input-icon-wrapper input-number">
                    {iconContent()}
                    <input data-validation={JSON.stringify(validation)}
                        placeholder={inputPlaceholder}
                        name={inputName}
                        className="gutenverse-input gutenverse-input-number"
                        type="number"
                        min={inputMin}
                        max={inputMax}
                        step={inputStep}
                        ref={elementRef}
                    />
                </div>
                :
                <input data-validation={JSON.stringify(validation)}
                    placeholder={inputPlaceholder}
                    name={inputName}
                    className="gutenverse-input gutenverse-input-number"
                    type="number"
                    min={inputMin}
                    max={inputMax}
                    step={inputStep}
                    ref={elementRef}
                />}
        </InputWrapper>
    </>;
});

export default FormInputNumberBlock;