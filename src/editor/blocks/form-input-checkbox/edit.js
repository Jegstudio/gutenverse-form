import { compose } from '@wordpress/compose';

import { withMouseMoveEffect } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import classnames from 'classnames';
import { useRef } from '@wordpress/element';
import { useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';

const FormInputCheckboxBlock = compose(
    withMouseMoveEffect
)(props => {
    const {
        attributes,
        clientId
    } = props;

    const {
        inputName,
        required,
        validationWarning,
        checkboxOptions,
        displayBlock,
        elementId
    } = attributes;

    const elementRef = useRef();
    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);

    const inputData = {
        ...props,
        type: 'checkbox',
        panelList: panelList,
        elementRef
    };

    const innerClass = classnames(
        'gutenverse-inner-input',
        displayBlock
    );

    const validation = {
        type: 'checkbox',
        required,
        validationWarning
    };

    return <>
        <CopyElementToolbar {...props}/>
        <InputWrapper {...inputData}>
            <div className={innerClass} ref={elementRef}>
                <div hidden
                    name={inputName}
                    className="gutenverse-input"
                    data-validation={JSON.stringify(validation)}
                />
                {checkboxOptions.map(item => {
                    return <label key={item.value}>
                        <input
                            name={inputName} value={item.value}
                            className="gutenverse-input-checkbox"
                            type="checkbox"
                        />
                        <span className="check">
                            {item.label}
                        </span>
                    </label>;
                })}
            </div>
        </InputWrapper>
    </>;
});

export default FormInputCheckboxBlock;