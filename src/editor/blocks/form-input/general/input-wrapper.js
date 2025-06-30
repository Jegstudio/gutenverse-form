import classnames from 'classnames';
import { useEffect, useState } from '@wordpress/element';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { useAnimationEditor } from 'gutenverse-core/hooks';
import { useDisplayEditor } from 'gutenverse-core/hooks';
import { select } from '@wordpress/data';
import { BlockPanelController } from 'gutenverse-core/controls';

export const recursiveParentBlock = clientId => {
    const {
        getBlock,
        getBlockRootClientId
    } = select('core/block-editor');

    const parentId = getBlockRootClientId(clientId);

    if (parentId) {
        const block = getBlock(parentId);

        if ('gutenverse/form-builder' === block.name) {
            return true;
        } else {
            return recursiveParentBlock(parentId);
        }
    } else {
        return false;
    }
};

const InputWrapper = props => {
    const {
        attributes,
        clientId,
        panelList,
        type,
        setAttributes,
        elementRef
    } = props;

    const {
        elementId,
        inputLabel,
        inputHelper,
        showLabel,
        showHelper,
        position,
        required,
    } = attributes;

    const animationClass = useAnimationEditor(attributes);
    const displayClass = useDisplayEditor(attributes);

    const blockProps = useBlockProps({
        className: classnames(
            'guten-element',
            `guten-form-input-${type}`,
            'guten-form-input',
            `guten-input-position-${position}`,
            'no-margin',
            elementId,
            animationClass,
            displayClass,
            {
                'hide-label': !showLabel,
                'hide-helper': !showHelper
            }
        ),
    });

    const [validParent, setValidParent] = useState(true);

    useEffect(() => {
        setValidParent(recursiveParentBlock(clientId));
    }, []);

    const Label = showLabel && <RichText
        className={'input-label'}
        tagName={'label'}
        aria-label={__('Label Title', 'gutenverse-form')}
        placeholder={__('Label Title', 'gutenverse-form')}
        value={inputLabel}
        onChange={value => setAttributes({ inputLabel: value })}
        withoutInteractiveFormatting
    />;

    const Helper = showHelper && <RichText
        className={'input-helper'}
        tagName={'span'}
        aria-label={__('Input Helper', 'gutenverse-form')}
        placeholder={__('Input Helper', 'gutenverse-form')}
        value={inputHelper}
        onChange={value => setAttributes({ inputHelper: value })}
        withoutInteractiveFormatting
    />;

    const Required = required && <span className="required-badge">*</span>;

    return <>
        <BlockPanelController panelList={panelList} props={props} elementRef={elementRef} />
        <div  {...blockProps}>
            {!validParent && <h1 className="input-warning">
                {__('Please put input element inside Form Builder', 'gutenverse-form')}
            </h1>}
            <div className="label-wrapper">
                {Label}
                {Required}
            </div>
            <div className="main-wrapper">
                {props.children}
                {Helper}
            </div>
        </div>
    </>;
};

export default InputWrapper;