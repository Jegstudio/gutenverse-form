import { compose } from '@wordpress/compose';
import { withMouseMoveEffect, withPartialRender, withPassRef } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import classnames from 'classnames';
import { useEffect, useRef } from '@wordpress/element';
import { useDynamicScript, useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';

const FormInputFileBlock = compose(
    withMouseMoveEffect,
    withPartialRender,
    withPassRef,
)(props => {
    const {
        attributes,
        clientId
    } = props;

    const {
        inputName,
        required,
        elementId,
        validationWarning,
        buttonText,
        inputPlaceholder,
        showIcon,
        iconPosition,
        icon
    } = attributes;

    const elementRef = useRef();

    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);
    useDynamicScript(elementRef);

    const inputData = {
        ...props,
        type: 'file',
        panelList: panelList,
        elementRef
    };

    const innerClass = classnames(
        'gutenverse-inner-input',
    );

    const validation = {
        type: 'file',
        required,
        validationWarning
    };

    return <>
        <CopyElementToolbar {...props} />
        <InputWrapper {...inputData}>
            <div className={innerClass}>
                <div hidden
                    ref={elementRef}
                    name={inputName}
                    className="gutenverse-input"
                    data-validation={JSON.stringify(validation)}
                />
                <div className="file-input-wrapper">
                    <input
                        name={inputName}
                        className="gutenverse-input-file"
                        type="file"
                        hidden
                        id={`file-input-${elementId}`}
                    />
                    <div className="input-wrapper">
                        <label className="file-button" >
                            {showIcon && iconPosition === 'before' && <i className={`fa-lg ${icon}`} onClick={() => setOpenIconLibrary(true)} />}
                            <span>{buttonText}</span>
                            {showIcon && iconPosition === 'after' && <i className={`fa-lg ${icon}`} onClick={() => setOpenIconLibrary(true)} />}
                        </label>
                        <span className="file-placeholder">{inputPlaceholder}</span>
                    </div>
                </div>
            </div>
        </InputWrapper>
    </>;
});

export default FormInputFileBlock;