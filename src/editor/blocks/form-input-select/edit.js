import { compose } from '@wordpress/compose';
import { useEffect, useRef, useState } from '@wordpress/element';
import { withCustomStyle } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { __ } from '@wordpress/i18n';
import { ChoiceSelect } from 'gutenverse-core/components';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';

const FormInputSelectBlock = compose(
    withCustomStyle(panelList),
    withCopyElementToolbar()
)(props => {
    const selectRef = useRef();
    const [selected, setSelected] = useState({ value: '' });

    const {
        attributes,
        setElementRef
    } = props;

    const {
        selectOptions
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
                    placeholder={__('Text Placeholder', 'gutenverse')}
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
