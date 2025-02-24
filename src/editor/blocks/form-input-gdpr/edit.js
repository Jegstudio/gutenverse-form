import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { withCustomStyle, withMouseMoveEffect } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import classnames from 'classnames';
import { useEffect } from '@wordpress/element';
import { useRef } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';
import { RichTextComponent } from 'gutenverse-core/components';
import { u } from 'gutenverse-core/components';
import { useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';

const FormInputGdprBlock = compose(
    withCopyElementToolbar(),
    withMouseMoveEffect
)(props => {
    const {
        attributes,
        setElementRef,
        setAttributes,
        clientId
    } = props;

    const {
        inputName,
        required,
        validationWarning,
        gdprValue,
        displayBlock,
        elementId
    } = attributes;

    const elementRef = useRef();
    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);

    const inputData = {
        ...props,
        type: 'gdpr',
        panelList: panelList,
        elementRef
    };

    const innerClass = classnames(
        'gutenverse-inner-input',
        displayBlock
    );

    const validation = {
        type: 'checkbox',
        required,
        validationWarning
    };

    const handleOn = () => {
        const element = u(`.${elementId} .gutenverse-input-gdpr`);
        const elementStatus = element.is(':checked');
        element.attr('checked',!elementStatus);
    };

    return <>
        <InputWrapper {...inputData}>
            <div className={innerClass} ref={elementRef}>
                <div hidden
                    name={inputName}
                    className="gutenverse-input"
                    data-validation={JSON.stringify(validation)}
                />
                <div className="guten-gdpr-wrapper">
                    <div className="guten-gdpr-input-wrapper">
                        <input
                            name={inputName}
                            className="gutenverse-input-gdpr"
                            type="checkbox"
                        />
                        <span className="check" onClick={handleOn}></span>
                    </div>
                    <RichTextComponent
                        {...props}
                        classNames={'gdpr-label'}
                        aria-label={__('GDPR Agreement Label', 'gutenverse')}
                        placeholder={__('GDPR Agreement Label', 'gutenverse')}
                        onChange={value => setAttributes({ gdprLabel: value })}
                        multiline={false}
                        contentAttribute={'gdprLabel'}
                    />
                </div>
            </div>
        </InputWrapper>
    </>;
});

export default FormInputGdprBlock;