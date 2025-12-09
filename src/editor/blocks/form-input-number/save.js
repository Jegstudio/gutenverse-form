
import SaveInputWrapper from '../form-input/general/save-input-wrapper';
import isEmpty from 'lodash/isEmpty';
import { withMouseMoveEffectScript } from 'gutenverse-core/hoc';
import { compose } from '@wordpress/compose';
import { getImageSrc } from 'gutenverse-core/editor-helper';
import { renderIcon } from 'gutenverse-core/helper';

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
        inputMin,
        inputMax,
        inputStep,
        useIcon,
        imageAlt,
        image,
        iconStyleMode,
        iconType,
        icon,
        iconSVG,
        lazyLoad
    } = attributes;

    const validation = {
        type: 'number',
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
            case 'svg':
                return <div className="form-input-number-icon type-icon">
                    <div className={`icon style-${iconStyleMode}`}>
                        <WrapAHref {...props}>
                            {renderIcon(icon, iconType, iconSVG)}
                        </WrapAHref>
                    </div>
                </div>;
            case 'image':
                return <div className="form-input-number-icon type-image">
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
                <div className="input-icon-wrapper input-number">
                    {iconContent()}
                    <input
                        data-validation={JSON.stringify(validation)}
                        placeholder={inputPlaceholder}
                        name={inputName}
                        className="gutenverse-input gutenverse-input-number"
                        type="number"
                        min={inputMin}
                        max={inputMax}
                        step={inputStep}
                        {...additionalProps}
                    />
                </div>
                :
                <input
                    data-validation={JSON.stringify(validation)}
                    placeholder={inputPlaceholder}
                    name={inputName}
                    className="gutenverse-input gutenverse-input-number"
                    type="number"
                    min={inputMin}
                    max={inputMax}
                    step={inputStep}
                    {...additionalProps}
                />}
        </SaveInputWrapper>
    );
});

export default save;