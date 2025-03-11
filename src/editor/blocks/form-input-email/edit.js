import { compose } from '@wordpress/compose';
import { withCustomStyle, withMouseMoveEffect, withPartialRender } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { useRef } from '@wordpress/element';
import { useEffect } from '@wordpress/element';
import { IconLibrary } from 'gutenverse-core/controls';
import { useState } from '@wordpress/element';
import { createPortal } from 'react-dom';
import { gutenverseRoot } from 'gutenverse-core/helper';
import { getImageSrc } from 'gutenverse-core/editor-helper';
import { useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';

const FormInputEmailBlock = compose(
    withMouseMoveEffect
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
        useIcon,
        iconType,
        iconStyleMode,
        icon,
        image,
        imageAlt,
        lazyLoad,
        elementId
    } = attributes;

    const elementRef = useRef();
    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);
    const [openIconLibrary, setOpenIconLibrary] = useState(false);
    const imageAltText = imageAlt || null;

    const inputData = {
        ...props,
        type: 'email',
        panelList: panelList,
        elementRef
    };

    const validation = {
        type: 'email',
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
                return <div className="form-input-email-icon type-icon">
                    <div className={`icon style-${iconStyleMode}`} onClick={() => setOpenIconLibrary(true)}>
                        <i className={icon}></i>
                    </div>
                </div>;
            case 'image':
                return <div className="form-input-email-icon type-image">
                    <div className={`icon style-${iconStyleMode}`}>
                        {imageLazyLoad()}
                    </div>
                </div>;
            default:
                return null;
        }
    };


    return <>
        <CopyElementToolbar {...props}/>
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
                <div className="input-icon-wrapper input-email">
                    {iconContent()}
                    <input data-validation={JSON.stringify(validation)}
                        placeholder={inputPlaceholder}
                        name={inputName}
                        className="gutenverse-input gutenverse-input-email"
                        type="text"
                        ref={elementRef}
                    />
                </div>
                :
                <input data-validation={JSON.stringify(validation)}
                    placeholder={inputPlaceholder}
                    name={inputName}
                    className="gutenverse-input gutenverse-input-email"
                    type="text"
                    ref={elementRef}
                />}
        </InputWrapper>
    </>;
});

export default FormInputEmailBlock;