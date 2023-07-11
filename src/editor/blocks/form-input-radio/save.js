
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
        radioOptions,
        displayBlock
    } = attributes;


    const innerClass = classnames(
        'gutenverse-inner-input',
        displayBlock
    );

    const validation = {
        type: 'radio',
        required,
        validationWarning
    };

    return (
        <SaveInputWrapper {...props} inputType={'radio'}>
            <div className={innerClass}>
                <div hidden
                    name={inputName}
                    className="gutenverse-input"
                    data-validation={JSON.stringify(validation)}
                />
                {radioOptions.map(item => {
                    return <label key={item.value}>
                        <input
                            name={inputName} value={item.value}
                            className="gutenverse-input-radio"
                            type="radio"
                        />
                        <span className="radio">
                            {item.label}
                        </span>
                    </label>;
                })}
            </div>
        </SaveInputWrapper>
    );
};

export default save;