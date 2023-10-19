import { compose } from '@wordpress/compose';
import { useEffect, useRef, useState } from '@wordpress/element';
import { withCustomStyle } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { ChoiceSelect } from 'gutenverse-core/components';
import { __ } from '@wordpress/i18n';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';

const FormInputMultiSelectBlock = compose(
    withCustomStyle(panelList),
    withCopyElementToolbar()
)(props => {
    const {
        attributes,
        setElementRef
    } = props;

    const {
        selectedOption,
        selectOptions,
        inputPlaceHolder,
    } = attributes;

    const selectRef = useRef();
    const [selected, setSelected] = useState(selectedOption);
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
                    placeholder={inputPlaceHolder}
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