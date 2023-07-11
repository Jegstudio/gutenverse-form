import { compose } from '@wordpress/compose';

import { withCustomStyle } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { useRef } from '@wordpress/element';
import { useEffect } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';

const FormInputTextareaBlock = compose(
    withCustomStyle(panelList),
    withCopyElementToolbar()
)(props => {
    const {
        attributes,
        setElementRef
    } = props;

    const {
        inputPlaceholder,
        inputName,
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    } = attributes;

    const textareaRef = useRef();

    const inputData = {
        ...props,
        type: 'textarea',
        panelList: panelList
    };

    const validation = {
        type: 'textarea',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

    useEffect(() => {
        if (textareaRef.current) {
            setElementRef(textareaRef.current);
        }
    }, [textareaRef]);


    return <>
        <InputWrapper {...inputData}>
            <textarea data-validation={JSON.stringify(validation)}
                placeholder={inputPlaceholder}
                name={inputName}
                className="gutenverse-input gutenverse-input-textarea"
                ref={textareaRef}
            />
        </InputWrapper>
    </>;
});

export default FormInputTextareaBlock;