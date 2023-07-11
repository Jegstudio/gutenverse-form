
import SaveInputWrapper from '../form-input/general/save-input-wrapper';
import classnames from 'classnames';

const save = props => {
    const {
        attributes,
    } = props;

    const {
        inputName,
        required,
        validationWarning,
        checkboxOptions,
        displayBlock
    } = attributes;

    const innerClass = classnames(
        'gutenverse-inner-input',
        displayBlock
    );

    const validation = {
        type: 'checkbox',
        required,
        validationWarning
    };

    return (
        <SaveInputWrapper {...props} inputType={'checkbox'}>
            <div className={innerClass}>
                <div hidden
                    name={inputName}
                    className="gutenverse-input"
                    data-validation={JSON.stringify(validation)}
                />
                {checkboxOptions.map(item => {
                    return <label key={item.value}>
                        <input
                            name={inputName} value={item.value}
                            className="gutenverse-input-checkbox"
                            type="checkbox"
                        />
                        <span className="check">
                            {item.label}
                        </span>
                    </label>;
                })}
            </div>
        </SaveInputWrapper>
    );
};

export default save;