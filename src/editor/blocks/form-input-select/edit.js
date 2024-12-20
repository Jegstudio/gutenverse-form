import { compose } from '@wordpress/compose';
import { useEffect, useRef, useState } from '@wordpress/element';
import { withCustomStyle, withMouseMoveEffect, withPartialRender } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { ChoiceSelect } from 'gutenverse-core/components';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';

const FormInputSelectBlock = compose(
    withPartialRender,
    withCustomStyle(panelList),
    withCopyElementToolbar(),
    withMouseMoveEffect
)(props => {
    const selectRef = useRef();
    const [selected, setSelected] = useState({ value: '' });

    const {
        attributes,
        setElementRef
    } = props;

    const {
        selectOptions,
        inputPlaceholder
    } = attributes;

    const inputData = {
        ...props,
        type: 'select',
        panelList: panelList
    };


    useEffect(() => {
        if (selectRef.current) {
            setElementRef(selectRef.current);
        }
    }, [selectRef]);

    return <>
        <InputWrapper {...inputData}>
            <div className="select-wrapper" ref={selectRef}>
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
