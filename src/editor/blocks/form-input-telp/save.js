
import SaveInputWrapper from '../form-input/general/save-input-wrapper';
import isEmpty from 'lodash/isEmpty';
import { withMouseMoveEffectScript } from 'gutenverse-core/hoc';
import { compose } from '@wordpress/compose';

const WrapAHref = ({ attributes, children }) => {
    const {
        url,
        linkTarget,
        rel,
        buttonClass = '',
    } = attributes;

    if (url !== undefined && url !== '' ) {
        return <a className={buttonClass} href={url} target={linkTarget} rel={rel}>
            {children}
        </a>;
    } else {
        return children;
    }
};

const save = compose(
    withMouseMoveEffectScript
)(props => {
    const {
        attributes,
    } = props;

    const {
        inputPlaceholder,
        inputName,
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning,
        defaultLogic,
        displayLogic,
        inputPattern,
        useIcon,
        imageAlt,
        image,
        iconStyleMode,
        iconType,
        icon
    } = attributes;

    const validation = {
        type: 'telp',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

    const displayRule = {
        type: defaultLogic,
        rule: displayLogic
    };

    const additionalProps = {
        ['data-display-rule']: !isEmpty(defaultLogic) && !isEmpty(displayLogic) ? JSON.stringify(displayRule) : undefined
    };
    const imageAltText = imageAlt || null;

    const imageLazyLoad = () => {
        if(lazyLoad){
            return <img src={getImageSrc(image)} alt={imageAltText} loading="lazy"/>;
        }else{
            return <img src={getImageSrc(image)} alt={imageAltText}/>;
        }
    };
    const iconContent = () => {
        switch (iconType) {
            case 'icon':
                return <div className="form-input-telp-icon type-icon">
                    <div className={`icon style-${iconStyleMode}`}>
                        <WrapAHref {...props}>
                            <i className={icon}></i>
                        </WrapAHref>
                    </div>
                </div>;
            case 'image':
                return <div className="form-input-telp-icon type-image">
                    <div className={`icon style-${iconStyleMode}`}>
                        <WrapAHref {...props}>
                            {imageLazyLoad()}
                        </WrapAHref>
                    </div>
                </div>;
            default:
                return null;
        }
    };

    return (
        <SaveInputWrapper {...props} inputType={validation.type} defaultLogic={defaultLogic}>
            {useIcon ?
                <div className="input-icon-wrapper input-telp">
                    {iconContent()}
                    <input
                        data-validation={JSON.stringify(validation)}
                        placeholder={inputPlaceholder}
                        name={inputName}
                        className="gutenverse-input gutenverse-input-tel"
                        type="tel"
                        pattern={inputPattern}
                        {...additionalProps}
                    />
                </div>
                :
                <input
                    data-validation={JSON.stringify(validation)}
                    placeholder={inputPlaceholder}
                    name={inputName}
                    className="gutenverse-input gutenverse-input-tel"
                    type="tel"
                    pattern={inputPattern}
                    {...additionalProps}
                />}
        </SaveInputWrapper>
    );
});

export default save;