import { compose } from '@wordpress/compose';

import { withMouseMoveEffect } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import classnames from 'classnames';
import { useRef } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';
import { useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';

const FormInputRadioBlock = compose(
    withCopyElementToolbar(),
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
        radioOptions,
        displayBlock,
        elementId
    } = attributes;

    const elementRef = useRef();

    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);

    const inputData = {
        ...props,
        type: 'radio',
        panelList: panelList,
        elementRef
    };

    const innerClass = classnames(
        'gutenverse-inner-input',
        displayBlock
    );

    const validation = {
        type: 'radio',
        required,
        validationWarning
    };

    return <>
        <InputWrapper {...inputData}>
            <div className={innerClass}>
                <div hidden
                    ref={elementRef}
                    name={inputName}
                    className="gutenverse-input"
                    data-validation={JSON.stringify(validation)}
                />
                {radioOptions.map(item => {
                    return <label key={item.value}>
                        <input
                            name={inputName} value={item.value}
                            className="gutenverse-input-radio"
                            type="radio"
                        />
                        <span className="radio">
                            {item.label}
                        </span>
                    </label>;
                })}
            </div>
        </InputWrapper>
    </>;
});

export default FormInputRadioBlock;