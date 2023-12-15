import { compose } from '@wordpress/compose';

import { withCustomStyle, withMouseMoveEffect } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { useRef } from '@wordpress/element';
import { useEffect } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';

const FormInputNumberBlock = compose(
    withCustomStyle(panelList),
    withCopyElementToolbar(),
    withMouseMoveEffect
)(props => {
    const {
        attributes,
        setElementRef
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
        inputStep
    } = attributes;

    const numberRef = useRef();

    const inputData = {
        ...props,
        type: 'number',
        panelList: panelList
    };

    const validation = {
        type: 'number',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

    useEffect(() => {
        if (numberRef.current) {
            setElementRef(numberRef.current);
        }
    }, [numberRef]);

    return <>
        <InputWrapper {...inputData}>
            <input data-validation={JSON.stringify(validation)}
                placeholder={inputPlaceholder}
                name={inputName}
                className="gutenverse-input gutenverse-input-number"
                type="number"
                min={inputMin}
                max={inputMax}
                step={inputStep}
                ref={numberRef}
            />
        </InputWrapper>
    </>;
});

export default FormInputNumberBlock;