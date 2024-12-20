import { compose } from '@wordpress/compose';

import { withCustomStyle, withMouseMoveEffect, withPartialRender } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { useRef } from '@wordpress/element';
import { useEffect } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';
import { IconLibrary } from 'gutenverse-core/controls';
import { useState } from '@wordpress/element';
import { createPortal } from 'react-dom';
import { gutenverseRoot } from 'gutenverse-core/helper';
import { getImageSrc } from 'gutenverse-core/editor-helper';

const FormInputTextareaBlock = compose(
    withPartialRender,
    withCustomStyle(panelList),
    withCopyElementToolbar(),
    withMouseMoveEffect
)(props => {
    const {
        attributes,
        setElementRef,
        setAttributes,
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
        lazyLoad
    } = attributes;

    const textareaRef = useRef();
    const [openIconLibrary, setOpenIconLibrary] = useState(false);
    const imageAltText = imageAlt || null;

    const inputData = {
        ...props,
        type: 'textarea',
        panelList: panelList
    };

    const validation = {
        type: 'textarea',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

    const imageLazyLoad = () => {
        if(lazyLoad){
            return <img src={getImageSrc(image)} alt={imageAltText} loading="lazy"/>;
        }else{
            return <img src={getImageSrc(image)} alt={imageAltText}/>;
        }
    };
    const iconContent = () => {
        switch (iconType) {
            case 'icon':
                return <div className="form-input-textarea-icon type-icon">
                    <div className={`icon style-${iconStyleMode}`} onClick={() => setOpenIconLibrary(true)}>
                        <i className={icon}></i>
                    </div>
                </div>;
            case 'image':
                return <div className="form-input-textarea-icon type-image">
                    <div className={`icon style-${iconStyleMode}`}>
                        {imageLazyLoad()}
                    </div>
                </div>;
            default:
                return null;
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            setElementRef(textareaRef.current);
        }
    }, [textareaRef]);


    return <>
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
                <div className="input-icon-wrapper input-textarea">
                    {iconContent()}
                    <textarea data-validation={JSON.stringify(validation)}
                        placeholder={inputPlaceholder}
                        name={inputName}
                        className="gutenverse-input gutenverse-input-textarea"
                        ref={textareaRef}
                    />
                </div>
                :
                <textarea data-validation={JSON.stringify(validation)}
                    placeholder={inputPlaceholder}
                    name={inputName}
                    className="gutenverse-input gutenverse-input-textarea"
                    ref={textareaRef}
                />}
        </InputWrapper>
    </>;
});

export default FormInputTextareaBlock;