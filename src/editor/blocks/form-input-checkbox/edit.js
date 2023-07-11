import { compose } from '@wordpress/compose';

import { withCustomStyle } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import classnames from 'classnames';
import { useEffect } from '@wordpress/element';
import { useRef } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';

const FormInputCheckboxBlock = compose(
    withCustomStyle(panelList),
    withCopyElementToolbar()
)(props => {
    const {
        attributes,
        setElementRef
    } = props;

    const {
        inputName,
        required,
        validationWarning,
        checkboxOptions,
        displayBlock
    } = attributes;

    const checkboxRef = useRef();

    const inputData = {
        ...props,
        type: 'checkbox',
        panelList: panelList
    };

    const innerClass = classnames(
        'gutenverse-inner-input',
        displayBlock
    );

    const validation = {
        type: 'checkbox',
        required,
        validationWarning
    };

    useEffect(() => {
        if (checkboxRef.current) {
            setElementRef(checkboxRef.current);
        }
    }, [checkboxRef]);

    return <>
        <InputWrapper {...inputData}>
            <div className={innerClass} ref={checkboxRef}>
                <div hidden
                    name={inputName}
                    className="gutenverse-input"
                    data-validation={JSON.stringify(validation)}
                />
                {checkboxOptions.map(item => {
                    return <label key={item.value}>
                        <input
                            name={inputName} value={item.value}
                            className="gutenverse-input-checkbox"
                            type="checkbox"
                        />
                        <span className="check">
                            {item.label}
                        </span>
                    </label>;
                })}
            </div>
        </InputWrapper>
    </>;
});

export default FormInputCheckboxBlock;