
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
        selectOptions
    } = attributes;

    const validation = {
        type: 'select',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

    return (
        <SaveInputWrapper {...props} inputType={validation.type}>
            <select
                name={inputName}
                data-validation={JSON.stringify(validation)}
                className="gutenverse-input gutenverse-input-select"
            >
                <option value="">{inputPlaceholder}</option>
                {selectOptions.map(opt => {
                    let attributes = {
                        value: opt.value,
                    };
                    if (opt.selected) attributes.selected = 'selected';
                    if (opt.disabled) attributes.disabled = 'disabled';

                    return <option {...attributes} key={opt.value}>
                        {opt.label}
                    </option>;
                })}
            </select>
        </SaveInputWrapper>
    );
};

export default save;