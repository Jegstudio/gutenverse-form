
import SaveInputWrapper from '../form-input/general/save-input-wrapper';

const save = props => {
    const {
        attributes,
    } = props;

    const {
        elementId,
        inputName,
        onText,
        offText
    } = attributes;

    return (
        <SaveInputWrapper {...props} inputType={'switch'}>
            <label className="switch-wrapper" htmlFor={elementId}>
                <input
                    id={elementId}
                    name={inputName}
                    className="gutenverse-input gutenverse-input-switch"
                    type="checkbox"
                    hidden
                />
                <span className="switch" data-on={onText} data-off={offText}/>
            </label>
        </SaveInputWrapper>
    );
};

export default save;