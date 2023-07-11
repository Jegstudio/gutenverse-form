
import classnames from 'classnames';
import { useBlockProps } from '@wordpress/block-editor';
import { RichText } from '@wordpress/block-editor';
import { useAnimationFrontend } from 'gutenverse-core/hooks';
import { useDisplayFrontend } from 'gutenverse-core/hooks';

const SaveInputWrapper = ({ attributes, inputType, children }) => {
    const {
        elementId,
        inputLabel,
        inputHelper,
        showLabel,
        showHelper,
        position,
        validationWarning,
        required,
    } = attributes;

    const animationClass = useAnimationFrontend(attributes);
    const displayClass = useDisplayFrontend(attributes);

    const className = classnames(
        'guten-element',
        `guten-form-input-${inputType}`,
        'guten-form-input',
        `guten-input-position-${position}`,
        elementId,
        animationClass,
        displayClass,
        {
            'hide-label': !showLabel,
            'hide-helper': !showHelper
        }
    );

    const Label = showLabel && <RichText.Content
        className={'input-label'}
        value={inputLabel}
        tagName={'label'}
    />;

    const Helper = showHelper && <RichText.Content
        className={'input-helper'}
        value={inputHelper}
        tagName={'span'}
    />;

    const Required = required && <span className="required-badge">*</span>;

    return (
        <div {...useBlockProps.save({ className })}>
            <div className="label-wrapper">
                {Label}
                {Required}
            </div>
            <div className="main-wrapper">
                {children}
                <div className="validation-error">
                    {validationWarning}
                </div>
                {Helper}
            </div>
        </div>
    );
};

export default SaveInputWrapper;