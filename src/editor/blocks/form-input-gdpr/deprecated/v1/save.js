
import SaveInputWrapper from '../../../form-input/general/deprecated/v1/save-input-wrapper';
import isEmpty from 'lodash/isEmpty';
import classnames from 'classnames';
import { withMouseMoveEffectScript } from 'gutenverse-core/hoc';
import { compose } from '@wordpress/compose';
import { RichText } from '@wordpress/block-editor';

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
        gdprValue,
        gdprFormValue,
        gdprLabel
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

    const displayRule = {
        type: defaultLogic,
        rule: displayLogic
    };

    const additionalProps = {
        ['data-display-rule']: !isEmpty(defaultLogic) && !isEmpty(displayLogic) ? JSON.stringify(displayRule) : undefined
    };

    return (
        <SaveInputWrapper {...props} inputType={'gdpr'} defaultLogic={defaultLogic}>
            <div className={innerClass}>
                <div className="guten-gdpr-wrapper">
                    <div className="guten-gdpr-input-wrapper">
                        <input
                            name={inputName} checked={gdprValue}
                            data-validation={JSON.stringify(validation)}
                            {...additionalProps}
                            className="gutenverse-input gutenverse-input-gdpr"
                            type="checkbox"
                            data-value={gdprFormValue}
                        />
                        <span className="check"></span>
                    </div>
                    <RichText.Content
                        className={'gdpr-label'}
                        value={gdprLabel}
                        tagName={'div'}
                    />
                </div>
            </div>
        </SaveInputWrapper>
    );
});

export default save;