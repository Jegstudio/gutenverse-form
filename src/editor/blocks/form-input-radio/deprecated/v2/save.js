
import SaveInputWrapper from '../../../form-input/general/save-input-wrapper';
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

    const displayRule = {
        type: defaultLogic,
        rule: displayLogic
    };

    const additionalProps = {
        ['data-display-rule']: !isEmpty(defaultLogic) && !isEmpty(displayLogic) ? JSON.stringify(displayRule) : undefined
    };

    return (
        <SaveInputWrapper {...props} inputType={'radio'} defaultLogic={defaultLogic}>
            <div className={innerClass}>
                <div hidden
                    name={inputName}
                    className="gutenverse-input"
                    data-validation={JSON.stringify(validation)}
                    {...additionalProps}
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
});

export default save;
