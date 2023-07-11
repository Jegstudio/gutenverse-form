
import SaveInputWrapper from '../form-input/general/save-input-wrapper';

const save = props => {
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

    return (
        <SaveInputWrapper {...props} inputType={validation.type}>
            <input
                data-validation={JSON.stringify(validation)}
                placeholder={inputPlaceholder}
                name={inputName}
                className="gutenverse-input gutenverse-input-number"
                type="number"
                min={inputMin}
                max={inputMax}
                step={inputStep}
            />
        </SaveInputWrapper>
    );
};

export default save;