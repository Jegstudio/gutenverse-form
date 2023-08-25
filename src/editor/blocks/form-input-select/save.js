
import SaveInputWrapper from '../form-input/general/save-input-wrapper';
import isEmpty from 'lodash/isEmpty';

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
        defaultLogic,
        displayLogic,
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

    const displayRule = {
        type: defaultLogic,
        rule: displayLogic
    };

    const additionalProps = {
        ['data-display-rule']: !isEmpty(defaultLogic) && !isEmpty(displayLogic) ? JSON.stringify(displayRule) : undefined
    };

    return (
        <SaveInputWrapper {...props} inputType={validation.type} defaultLogic={defaultLogic}>
            <select
                name={inputName}
                data-validation={JSON.stringify(validation)}
                className="gutenverse-input gutenverse-input-select"
                {...additionalProps}
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