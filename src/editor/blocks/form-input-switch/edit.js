import { compose } from '@wordpress/compose';
import { withMouseMoveEffect, withPartialRender, withPassRef } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { useRef } from '@wordpress/element';
import { u } from 'gutenverse-core/components';
import { useDynamicScript, useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';

const FormInputSwitchBlock = compose(
    withMouseMoveEffect,
    withPartialRender,
    withPassRef,
)(props => {
    const {
        attributes,
        clientId
    } = props;

    const {
        elementId,
        inputName,
        onText,
        offText
    } = attributes;

    const elementRef = useRef();

    const inputData = {
        ...props,
        type: 'switch',
        panelList: panelList,
        elementRef
    };

    const handleSwitchOn = () => {
        const element = u(`.${elementId} .gutenverse-input-switch`);
        const elementStatus = element.is(':checked');
        element.attr('checked', !elementStatus);
    };

    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);
    useDynamicScript(elementRef);

    return <>
        <CopyElementToolbar {...props} />
        <InputWrapper {...inputData} inputType={inputData.type}>
            <label className="switch-wrapper" htmlFor={elementId}>
                <input
                    id={elementId}
                    name={inputName}
                    className="gutenverse-input gutenverse-input-switch"
                    type="checkbox"
                    hidden
                    ref={elementRef}
                />
                <span className="switch" data-on={onText} data-off={offText} onClick={handleSwitchOn} />
            </label>
        </InputWrapper>
    </>;
});

export default FormInputSwitchBlock;