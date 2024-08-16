
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
    const { attributes } = props;

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
        dateFormat,
        dateStart,
        dateEnd,
        dateRange,
        useIcon,
        imageAlt,
        image,
        iconStyleMode,
        iconType,
        icon
    } = attributes;

    const validation = {
        type: 'date',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

    let dateSetting = {
        dateFormat,
    };

    if (dateStart) dateSetting.minDate = dateStart;
    if (dateEnd) dateSetting.maxDate = dateEnd;
    if (dateRange) dateSetting.mode = 'range';

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
                return <div className="form-input-date-icon type-icon">
                    <div className={`icon style-${iconStyleMode}`}>
                        <WrapAHref {...props}>
                            <i className={icon}></i>
                        </WrapAHref>
                    </div>
                </div>;
            case 'image':
                return <div className="form-input-date-icon type-image">
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
                <div className="input-icon-wrapper input-date">
                    {iconContent()}
                    <input
                        data-validation={JSON.stringify(validation)}
                        data-date={JSON.stringify(dateSetting)}
                        placeholder={inputPlaceholder}
                        name={inputName}
                        className="gutenverse-input gutenverse-input-date"
                        type="text"
                        {...additionalProps}
                    />
                </div>
                :
                <input
                    data-validation={JSON.stringify(validation)}
                    data-date={JSON.stringify(dateSetting)}
                    placeholder={inputPlaceholder}
                    name={inputName}
                    className="gutenverse-input gutenverse-input-date"
                    type="text"
                    {...additionalProps}
                />}
        </SaveInputWrapper>
    );
});

export default save;