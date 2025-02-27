import { compose } from '@wordpress/compose';
import { useEffect, useRef, useState } from '@wordpress/element';
import { withCustomStyle, withMouseMoveEffect, withPartialRender } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { ChoiceSelect } from 'gutenverse-core/components';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';
import { useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';

const FormInputSelectBlock = compose(
    withCopyElementToolbar(),
    withMouseMoveEffect
)(props => {
    const [selected, setSelected] = useState({ value: '' });

    const {
        attributes,
        clientId
    } = props;

    const {
        selectOptions,
        inputPlaceholder,
        elementId
    } = attributes;

    const elementRef = useRef();
    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);

    const inputData = {
        ...props,
        type: 'select',
        panelList: panelList,
        elementRef
    };

    return <>
        <InputWrapper {...inputData}>
            <div className="select-wrapper" ref={elementRef}>
                <ChoiceSelect
                    placeholder={inputPlaceholder}
                    options={selectOptions}
                    selected={selected}
                    setSelected={setSelected}
                    multi={false}
                />
            </div>
        </InputWrapper>
    </>;
});


export default FormInputSelectBlock;
