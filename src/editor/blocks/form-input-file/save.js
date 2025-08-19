
import SaveInputWrapper from '../form-input/general/save-input-wrapper';
import isEmpty from 'lodash/isEmpty';
import classnames from 'classnames';
import { withMouseMoveEffectScript } from 'gutenverse-core/hoc';
import { compose } from '@wordpress/compose';

const save = compose(
    withMouseMoveEffectScript
)(props => {
    const {
        attributes,
    } = props;

    const {
        inputName,
        required,
        validationWarning,
        defaultLogic,
        displayLogic,
        displayBlock,
        inputPlaceholder,
        buttonText,
        elementId
    } = attributes;


    const innerClass = classnames(
        'gutenverse-inner-input',
        displayBlock
    );

    const validation = {
        type: 'file',
        required,
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
        <SaveInputWrapper {...props} inputType={'file'} defaultLogic={defaultLogic}>
            <div className={innerClass}>
                <div hidden
                    name={inputName}
                    className="gutenverse-input"
                    data-validation={JSON.stringify(validation)}
                    {...additionalProps}
                />
                <div className="file-input-wrapper">
                    <input
                        name={inputName}
                        className="gutenverse-input-file"
                        type="file"
                        hidden
                        id={`file-input-${elementId}`}
                    />
                    <div className="input-wrapper">
                        <label htmlFor={`file-input-${elementId}`} className="file-button" >{buttonText}</label>
                        <span className="file-placeholder">{inputPlaceholder}</span>
                    </div>
                </div>
            </div>
        </SaveInputWrapper>
    );
});

export default save;