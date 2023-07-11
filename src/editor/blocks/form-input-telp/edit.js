import { compose } from '@wordpress/compose';

import { withCustomStyle } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { useRef } from '@wordpress/element';
import { useEffect } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';

const FormInputNumberTelp = compose(
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
        validationWarning,
        inputPattern,
    } = attributes;

    const telpRef = useRef();

    const inputData = {
        ...props,
        type: 'telp',
        panelList: panelList
    };

    const validation = {
        type: 'telp',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

    useEffect(() => {
        if (telpRef.current) {
            setElementRef(telpRef.current);
        }
    }, [telpRef]);

    return <>
        <InputWrapper {...inputData}>
            <input data-validation={JSON.stringify(validation)}
                placeholder={inputPlaceholder}
                name={inputName}
                className="gutenverse-input gutenverse-input-telp"
                type="tel"
                pattern={inputPattern}
                ref={telpRef}
            />
        </InputWrapper>
    </>;
});

export default FormInputNumberTelp;