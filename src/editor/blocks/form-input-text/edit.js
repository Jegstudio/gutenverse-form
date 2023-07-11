import { compose } from '@wordpress/compose';

import { withCustomStyle } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import InputWrapper from '../form-input/general/input-wrapper';
import { useRef } from '@wordpress/element';
import { useEffect } from '@wordpress/element';
import { withCopyElementToolbar } from 'gutenverse-core/hoc';
import { useAnimationEditor } from 'gutenverse-core/hooks';
import classnames from 'classnames';

const FormInputTextBlock = compose(
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

    const animationClass = useAnimationEditor(attributes);
    const textFieldRef = useRef();

    const inputData = {
        ...props,
        type: 'text',
        panelList: panelList
    };

    const validation = {
        type: 'text',
        required,
        validationType,
        validationMin,
        validationMax,
        validationWarning
    };

    useEffect(() => {
        if (textFieldRef.current) {
            setElementRef(textFieldRef.current);
        }
    }, [textFieldRef]);

    return <>
        <InputWrapper {...inputData}>
            <input data-validation={JSON.stringify(validation)}
                placeholder={inputPlaceholder}
                name={inputName}
                className={classnames(
                    'gutenverse-input',
                    'gutenverse-input-text',
                    animationClass
                )}
                type="text"
                ref={textFieldRef}
            />
        </InputWrapper>
    </>;
});

export default FormInputTextBlock;