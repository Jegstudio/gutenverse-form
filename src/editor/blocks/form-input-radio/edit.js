import { compose } from '@wordpress/compose';

import { withCustomStyle } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import classnames from 'classnames';
import { useRef } from '@wordpress/element';
import { useEffect } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';

const FormInputRadioBlock = compose(
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
        radioOptions,
        displayBlock
    } = attributes;

    const radioRef = useRef();

    const inputData = {
        ...props,
        type: 'radio',
        panelList: panelList
    };

    const innerClass = classnames(
        'gutenverse-inner-input',
        displayBlock
    );

    const validation = {
        type: 'radio',
        required,
        validationWarning
    };

    useEffect(() => {
        if (radioRef.current) {
            setElementRef(radioRef.current);
        }
    }, [radioRef]);

    return <>
        <InputWrapper {...inputData}>
            <div className={innerClass} ref={radioRef}>
                <div hidden
                    name={inputName}
                    className="gutenverse-input"
                    data-validation={JSON.stringify(validation)}
                />
                {radioOptions.map(item => {
                    return <label key={item.value}>
                        <input
                            name={inputName} value={item.value}
                            className="gutenverse-input-radio"
                            type="radio"
                        />
                        <span className="radio">
                            {item.label}
                        </span>
                    </label>;
                })}
            </div>
        </InputWrapper>
    </>;
});

export default FormInputRadioBlock;