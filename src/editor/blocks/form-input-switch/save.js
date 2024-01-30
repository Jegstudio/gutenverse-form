
import SaveInputWrapper from '../form-input/general/save-input-wrapper';
import isEmpty from 'lodash/isEmpty';
import { withMouseMoveEffectScript } from 'gutenverse-core/hoc';
import { compose } from '@wordpress/compose';

const save = compose(
    withMouseMoveEffectScript
)(props => {
    const {
        attributes,
    } = props;

    const {
        elementId,
        inputName,
        onText,
        offText,
        defaultLogic,
        displayLogic,
    } = attributes;

    const displayRule = {
        type: defaultLogic,
        rule: displayLogic
    };

    const additionalProps = {
        ['data-display-rule']: !isEmpty(defaultLogic) && !isEmpty(displayLogic) ? JSON.stringify(displayRule) : undefined
    };

    return (
        <SaveInputWrapper {...props} inputType={'switch'} defaultLogic={defaultLogic}>
            <label className="switch-wrapper" htmlFor={elementId}>
                <input
                    id={elementId}
                    name={inputName}
                    className="gutenverse-input gutenverse-input-switch"
                    type="checkbox"
                    hidden
                    {...additionalProps}
                />
                <span className="switch" data-on={onText} data-off={offText}/>
            </label>
        </SaveInputWrapper>
    );
});

export default save;