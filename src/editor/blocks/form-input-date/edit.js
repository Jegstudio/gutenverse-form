import { compose } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';
import { withCustomStyle, withMouseMoveEffect } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import GutenverseInputDate from '../../../frontend/blocks/input-date';
import { u } from'gutenverse-core/components';
import { useRef } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';

const FormInputDateBlock = compose(
    withCustomStyle(panelList),
    withCopyElementToolbar(),
    withMouseMoveEffect
)(props => {
    const {
        clientId,
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
        dateFormat,
        dateStart,
        dateEnd,
        dateRange
    } = attributes;

    const dateRef = useRef();

    const inputData = {
        ...props,
        type: 'date',
        panelList: panelList
    };

    const validation = {
        type: 'date',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

    useEffect(() => {
        const root = u(`#block-${clientId}`);
        new GutenverseInputDate(root);
    }, [attributes]);

    useEffect(() => {
        if (dateRef.current) {
            setElementRef(dateRef.current);
        }
    }, [dateRef]);


    let dateSetting = {
        dateFormat,
    };

    if (dateStart) dateSetting.minDate = dateStart;
    if (dateEnd) dateSetting.maxDate = dateEnd;
    if (dateRange) dateSetting.mode = 'range';

    return <>
        <InputWrapper {...inputData}>
            <input data-validation={JSON.stringify(validation)}
                data-date={JSON.stringify(dateSetting)}
                placeholder={inputPlaceholder}
                name={inputName}
                className="gutenverse-input gutenverse-input-date"
                type="text"
                ref={dateRef}
            />
        </InputWrapper>
    </>;
});

export default FormInputDateBlock;