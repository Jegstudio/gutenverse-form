import { classnames } from 'gutenverse-core/components';

const save = props => {
    const {
        attributes,
    } = props;

    const {
        siteKey
    } = attributes;

    const classNames = classnames(
        'guten-element',
        'gutenverse-recaptcha',
        'guten-form-input-recaptcha',
        'g-recaptcha'
    );

    return (
        <div className={classNames} data-sitekey={siteKey}></div>
    );
};

export default save;