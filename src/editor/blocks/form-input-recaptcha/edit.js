import { compose } from '@wordpress/compose';
import { withPartialRender, withPassRef } from 'gutenverse-core/hoc';
import { panelList } from './panels/panel-list';
import { useEffect, useRef, useState } from '@wordpress/element';
import { BlockPanelController } from 'gutenverse-core/controls';
import classnames from 'classnames';
import { useDynamicScript, useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { useBlockProps } from 'gutenverse-core/components';
import { __ } from '@wordpress/i18n';
import { recursiveParentBlock } from '../form-input/general/input-wrapper';


const FormInputRecaptcha = compose(
    withPartialRender,
    withPassRef,
)(props => {
    const {
        attributes,
        clientId
    } = props;

    const {
        elementId,
    } = attributes;

    const elementRef = useRef();

    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);
    useDynamicScript(elementRef);

    const blockProps = useBlockProps({
        className: classnames(
            'gutenverse-recaptcha',
            'g-recaptcha',
            elementId,
        ),
        ref: elementRef
    });

    const [validParent, setValidParent] = useState(true);

    useEffect(() => {
        setValidParent(recursiveParentBlock(clientId));
    }, []);

    return <>
        <BlockPanelController panelList={panelList} props={props} elementRef={elementRef} />
        {!validParent && <h1 className="input-warning">
            {__('Please put input element inside Form Builder', 'gutenverse-form')}
        </h1>}
        <div {...blockProps}>
            <div className="indicator">
                <i className="icon gtn gtn-arrow-up-solid"></i>
                <span>{__('RECAPTCHA', 'gutenverse-form')}</span>
                <i className="icon gtn gtn-arrow-down-solid"></i>
            </div>
        </div>
    </>;
});

export default FormInputRecaptcha;