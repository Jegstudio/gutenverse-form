
import SaveInputWrapper from '../form-input/general/save-input-wrapper';

const save = props => {
    const { attributes } = props;

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

    return (
        <SaveInputWrapper {...props} inputType={validation.type}>
            <input
                data-validation={JSON.stringify(validation)}
                data-date={JSON.stringify(dateSetting)}
                placeholder={inputPlaceholder}
                name={inputName}
                className="gutenverse-input gutenverse-input-date"
                type="text"
            />
        </SaveInputWrapper>
    );
};

export default save;