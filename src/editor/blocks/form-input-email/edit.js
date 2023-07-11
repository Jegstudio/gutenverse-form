import { compose } from '@wordpress/compose';

import { withCustomStyle } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { useRef } from '@wordpress/element';
import { useEffect } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';

const FormInputEmailBlock = compose(
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

    const emailRef = useRef();

    const inputData = {
        ...props,
        type: 'email',
        panelList: panelList
    };

    const validation = {
        type: 'email',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

    useEffect(() => {
        if (emailRef.current) {
            setElementRef(emailRef.current);
        }
    }, [emailRef]);


    return <>
        <InputWrapper {...inputData}>
            <input data-validation={JSON.stringify(validation)}
                placeholder={inputPlaceholder}
                name={inputName}
                className="gutenverse-input gutenverse-input-email"
                type="text"
                ref={emailRef}
            />
        </InputWrapper>
    </>;
});

export default FormInputEmailBlock;