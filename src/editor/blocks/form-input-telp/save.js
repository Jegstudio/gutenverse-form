
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
        inputPattern
    } = attributes;

    const validation = {
        type: 'telp',
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
                className="gutenverse-input gutenverse-input-tel"
                type="tel"
                pattern={inputPattern}
            />
        </SaveInputWrapper>
    );
};

export default save;