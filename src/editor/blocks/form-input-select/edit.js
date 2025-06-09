import { compose } from '@wordpress/compose';
import { useRef, useState } from '@wordpress/element';
import { withMouseMoveEffect, withPartialRender, withPassRef } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { ChoiceSelect } from 'gutenverse-core/components';
import { useDynamicScript, useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';

const FormInputSelectBlock = compose(
    withMouseMoveEffect,
    withPartialRender,
    withPassRef,
)(props => {
    const [selected, setSelected] = useState({ value: '' });

    const {
        attributes,
        clientId
    } = props;

    const {
        selectOptions,
        inputPlaceholder,
        elementId,
        excludePlaceholder,
        useCustomDropdown,
        dropDownIconOpen,
        dropDownIconClose
    } = attributes;

    const elementRef = useRef();
    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);
    useDynamicScript(elementRef);

    const inputData = {
        ...props,
        type: 'select',
        panelList: panelList,
        elementRef
    };

    return <>
        <CopyElementToolbar {...props} />
        <InputWrapper {...inputData}>
            <div className="select-wrapper" ref={elementRef}>
                <ChoiceSelect
                    placeholder={inputPlaceholder}
                    options={selectOptions}
                    selected={selected}
                    setSelected={setSelected}
                    multi={false}
                    customDropdown={() => {
                        return <span className="select-dropdown-icon" />;
                    }}
                    excludePlaceholder={excludePlaceholder}
                    useCustomDropdown={useCustomDropdown}
                    dropDownIconOpen={dropDownIconOpen}
                    dropDownIconClose={dropDownIconClose}
                />
            </div>
        </InputWrapper>
    </>;
});


export default FormInputSelectBlock;
