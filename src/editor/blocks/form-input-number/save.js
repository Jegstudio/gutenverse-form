
import SaveInputWrapper from '../form-input/general/save-input-wrapper';
import isEmpty from 'lodash/isEmpty';
import { withMouseMoveEffectScript } from 'gutenverse-core/hoc';
import { compose } from '@wordpress/compose';

const save = compose(
    withMouseMoveEffectScript
)(props => {
    const {
        attributes,
    } = props;

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
        inputMin,
        inputMax,
        inputStep
    } = attributes;

    const validation = {
        type: 'number',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

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
                placeholder={inputPlaceholder}
                name={inputName}
                className="gutenverse-input gutenverse-input-number"
                type="number"
                min={inputMin}
                max={inputMax}
                step={inputStep}
                {...additionalProps}
            />
        </SaveInputWrapper>
    );
});

export default save;