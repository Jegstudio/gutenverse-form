
import SaveInputWrapper from '../form-input/general/save-input-wrapper';
import isEmpty from 'lodash/isEmpty';
import { withMouseMoveEffectScript } from 'gutenverse-core/hoc';
import { compose } from '@wordpress/compose';

const save = compose(
    withMouseMoveEffectScript
)(props => {
    const { attributes } = props;

    const {
        inputPlaceholder,
        inputName,
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning,
        defaultLogic,
        displayLogic,
        dateFormat,
        dateStart,
        dateEnd,
        dateRange
    } = attributes;

    const validation = {
        type: 'date',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

    let dateSetting = {
        dateFormat,
    };

    if (dateStart) dateSetting.minDate = dateStart;
    if (dateEnd) dateSetting.maxDate = dateEnd;
    if (dateRange) dateSetting.mode = 'range';

    const displayRule = {
        type: defaultLogic,
        rule: displayLogic
    };

    const additionalProps = {
        ['data-display-rule']: !isEmpty(defaultLogic) && !isEmpty(displayLogic) ? JSON.stringify(displayRule) : undefined
    };

    return (
        <SaveInputWrapper {...props} inputType={validation.type} defaultLogic={defaultLogic}>
            <input
                data-validation={JSON.stringify(validation)}
                data-date={JSON.stringify(dateSetting)}
                placeholder={inputPlaceholder}
                name={inputName}
                className="gutenverse-input gutenverse-input-date"
                type="text"
                {...additionalProps}
            />
        </SaveInputWrapper>
    );
});

export default save;