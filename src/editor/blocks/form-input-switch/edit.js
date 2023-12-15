import { compose } from '@wordpress/compose';

import { withCustomStyle, withMouseMoveEffect } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { useRef } from '@wordpress/element';
import { useEffect } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';

const FormInputSwitchBlock = compose(
    withCustomStyle(panelList),
    withCopyElementToolbar(),
    withMouseMoveEffect
)(props => {
    const {
        attributes,
        setElementRef
    } = props;

    const {
        elementId,
        inputName,
        onText,
        offText
    } = attributes;

    const switchRef = useRef();

    const inputData = {
        ...props,
        type: 'switch',
        panelList: panelList
    };

    useEffect(() => {
        if (switchRef.current) {
            setElementRef(switchRef.current);
        }
    }, [switchRef]);

    return <>
        <InputWrapper {...inputData} inputType={inputData.type}>
            <label className="switch-wrapper" htmlFor={elementId}>
                <input
                    id={elementId}
                    name={inputName}
                    className="gutenverse-input gutenverse-input-switch"
                    type="checkbox"
                    hidden
                    ref={switchRef}
                />
                <span className="switch" data-on={onText} data-off={offText} />
            </label>
        </InputWrapper>
    </>;
});

export default FormInputSwitchBlock;