
import classnames from 'classnames';
import { RichText, useBlockProps } from '@wordpress/block-editor';
import { useAnimationFrontend } from 'gutenverse-core/hooks';
import { useDisplayFrontend } from 'gutenverse-core/hooks';

const save = ({ attributes }) => {
    const {
        elementId,
        content,
        buttonType,
        buttonSize,
        showIcon,
        icon,
        iconPosition,
    } = attributes;

    const animationClass = useAnimationFrontend(attributes);
    const displayClass = useDisplayFrontend(attributes);

    const className = classnames(
        'guten-element',
        'guten-button-wrapper',
        'guten-submit-wrapper',
        elementId,
        displayClass
    );

    const buttonClass = classnames(
        'guten-button',
        'gutenverse-input-submit',
        animationClass,
        {
            [`guten-button-${buttonType}`]: buttonType && buttonType !== 'default',
            [`guten-button-${buttonSize}`]: buttonSize,
        }
    );

    return (
        <div {...useBlockProps.save({ className })}>
            <div className="form-notification"></div>
            <button className={buttonClass} type="submit">
                {showIcon && iconPosition === 'before' && <i className={`fa-lg ${icon}`} />}
                <span>
                    <RichText.Content value={content} />
                </span>
                {showIcon && iconPosition === 'after' && <i className={`fa-lg ${icon}`} />}
            </button>
            <div className="gutenverse-input-submit-loader">
                <i className="fas fa-spinner fa-spin" />
            </div>
        </div>
    );
};

export default save;