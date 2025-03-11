import { compose } from '@wordpress/compose';
import { useEffect, useRef, useState } from '@wordpress/element';
import { withCustomStyle, withMouseMoveEffect, withPartialRender } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { ChoiceSelect } from 'gutenverse-core/components';
import { useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';

const FormInputMultiSelectBlock = compose(
    withPartialRender,
    withCustomStyle(panelList),
    withMouseMoveEffect
)(props => {
    const {
        attributes,
        setElementRef,
        clientId
    } = props;
    const {
        selectedOption,
        selectOptions,
        inputPlaceholder,
        elementId
    } = attributes;
    const elementRef = useRef();
    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);
    const [selected, setSelected] = useState(selectedOption);
    const inputData = {
        ...props,
        type: 'select',
        panelList: panelList,
        elementRef
    };
    useEffect(() => {
        setSelected(selectedOption);
    },[selectedOption]);

    return <>
        <CopyElementToolbar {...props}/>
        <InputWrapper {...inputData}>
            <div className="select-wrapper" ref={elementRef}>
                <ChoiceSelect
                    placeholder={inputPlaceholder}
                    options={selectOptions}
                    selected={selected}
                    setSelected={setSelected}
                    multi={true}
                />
            </div>
        </InputWrapper>
    </>;
});

export default FormInputMultiSelectBlock;