
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
        validationWarning
    } = attributes;

    const validation = {
        type: 'text',
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
                className="gutenverse-input gutenverse-input-text"
                type="text"
            />
        </SaveInputWrapper>
    );
};

export default save;