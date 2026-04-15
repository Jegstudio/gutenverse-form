import { compose } from '@wordpress/compose';
import { withAnimationStickyV2, withMouseMoveEffect, withPartialRender, withPassRef } from 'gutenverse-core/hoc';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import classnames from 'classnames';
import { BlockPanelController } from 'gutenverse-core/controls';
import { panelList } from './panels/panel-list';
import { useEffect, useRef, useState } from '@wordpress/element';
import { isSticky } from 'gutenverse-core/helper';
import { useAnimationEditor } from 'gutenverse-core/hooks';
import { useDisplayEditor } from 'gutenverse-core/hooks';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { PanelTutorial } from 'gutenverse-core/controls';
import { useDynamicScript, useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';
import { createBlock } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';
import { Modal, Button } from '@wordpress/components';

const NoticeMessages = ({ successExample = false, errorExample = false }) => {
    return <>
        {successExample && <div className="form-notification"><div className="notification-body guten-success">{__('Thank you! (You can setup this message inside your form setting in Dashboard->Form).')}</div></div>}
        {errorExample && <div className="form-notification"><div className="notification-body guten-error">{__('Something went wrong! (You can setup this message inside your form setting in Dashboard->Form).')}</div></div>}
    </>;
};

const FormWrapper = ({ blockProps, attributes }) => {
    return (
        <div {...blockProps}>
            <NoticeMessages {...attributes} />
            <InnerBlocks />
        </div>
    );
};

const FormBuilderIcon = ({ add = false }) => {
    return (
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
            <rect x="9" y="6" width="18" height="24" fill="none" stroke="currentColor" strokeWidth="3" />
            <line x1="13" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="3" />
            <line x1="13" y1="18" x2="23" y2="18" stroke="currentColor" strokeWidth="3" />
            <line x1="13" y1="24" x2="20" y2="24" stroke="currentColor" strokeWidth="3" />
            {add && (
                <>
                    <circle cx="26" cy="26" r="6" fill="currentColor" />
                    <line x1="26" y1="22" x2="26" y2="30" stroke="#fff" strokeWidth="2" />
                    <line x1="22" y1="26" x2="30" y2="26" stroke="#fff" strokeWidth="2" />
                </>
            )}
        </svg>
    );
};

const FormPlaceholder = ({ blockProps, attributes, clientId, setAttributes }) => {
    const [selectModalOpen, setSelectModalOpen] = useState(false);
    const [forms, setForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState('');
    const [loadingForms, setLoadingForms] = useState(false);
    const [error, setError] = useState('');
    const { replaceInnerBlocks } = useDispatch('core/block-editor');

    const openSelectModal = () => {
        setSelectModalOpen(true);
        setLoadingForms(true);
        setError('');

        apiFetch({
            path: 'gutenverse-form-client/v1/form/search',
            method: 'POST',
            data: {
                search: ''
            }
        }).then(response => {
            const nextForms = Array.isArray(response) ? response : [];
            setForms(nextForms);
            setSelectedForm(nextForms[0]?.value || '');
            setLoadingForms(false);
        }).catch(err => {
            setError(err?.message || __('Could not load existing forms. Please try again.', 'gutenverse-form'));
            setLoadingForms(false);
        });
    };

    const selectExistingForm = () => {
        const form = forms.find(item => `${item.value}` === `${selectedForm}`);

        if (!form) {
            setError(__('Please select a form first.', 'gutenverse-form'));
            return;
        }

        setAttributes({
            formId: form
        });
        setSelectModalOpen(false);
    };

    const createNewForm = () => {
        const starterBlocks = [
            createBlock('gutenverse/form-input-text', {
                inputLabel: __('Name', 'gutenverse-form'),
                inputPlaceholder: __('Your name', 'gutenverse-form'),
                inputName: 'name',
                required: true
            }),
            createBlock('gutenverse/form-input-email', {
                inputLabel: __('Email', 'gutenverse-form'),
                inputPlaceholder: __('Your email', 'gutenverse-form'),
                inputName: 'email',
                required: true
            }),
            createBlock('gutenverse/form-input-textarea', {
                inputLabel: __('Message', 'gutenverse-form'),
                inputPlaceholder: __('Your message', 'gutenverse-form'),
                inputName: 'message',
                required: true
            }),
            createBlock('gutenverse/form-input-submit', {
                content: __('Submit', 'gutenverse-form')
            })
        ];

        replaceInnerBlocks(clientId, starterBlocks, true);
    };

    return (
        <div {...blockProps}>
            <NoticeMessages {...attributes} />
            <div className="guten-form-builder-placeholder">
                <div className="placeholder-main-icon">
                    <FormBuilderIcon />
                </div>
                <h3>{__('Select or Create a Form', 'gutenverse-form')}</h3>
                <p>{__('Select an existing form or create a new one to get started.', 'gutenverse-form')}</p>
                <div className="placeholder-actions">
                    <button type="button" className="placeholder-action" onClick={openSelectModal}>
                        <span className="placeholder-action-icon">
                            <FormBuilderIcon />
                        </span>
                        <span>
                            <strong>{__('Select Existing Form', 'gutenverse-form')}</strong>
                            <small>{__('Use a form that you have already created', 'gutenverse-form')}</small>
                        </span>
                    </button>
                    <button type="button" className="placeholder-action" onClick={createNewForm}>
                        <span className="placeholder-action-icon">
                            <FormBuilderIcon add />
                        </span>
                        <span>
                            <strong>{__('Create New Form', 'gutenverse-form')}</strong>
                            <small>{__('Start a new form directly from the editor', 'gutenverse-form')}</small>
                        </span>
                    </button>
                </div>
            </div>
            {selectModalOpen && (
                <Modal
                    title={__('Select Existing Form', 'gutenverse-form')}
                    onRequestClose={() => setSelectModalOpen(false)}
                    className="gutenverse-form-select-modal"
                >
                    <div className="gutenverse-form-select-modal-content">
                        {loadingForms ? (
                            <p>{__('Loading forms...', 'gutenverse-form')}</p>
                        ) : forms.length > 0 ? (
                            <select value={selectedForm} onChange={event => setSelectedForm(event.target.value)}>
                                {forms.map(form => (
                                    <option key={form.value} value={form.value}>{form.label}</option>
                                ))}
                            </select>
                        ) : (
                            <p>{__('No existing forms found.', 'gutenverse-form')}</p>
                        )}
                        {error && <p className="gutenverse-form-select-error">{error}</p>}
                    </div>
                    <div className="gutenverse-form-select-modal-footer">
                        <Button isSecondary onClick={() => setSelectModalOpen(false)}>
                            {__('Cancel', 'gutenverse-form')}
                        </Button>
                        <Button isPrimary onClick={selectExistingForm} disabled={loadingForms || forms.length === 0}>
                            {__('Select Form', 'gutenverse-form')}
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const FormBuilderBlock = compose(
    withPassRef,
    withAnimationStickyV2(),
    withMouseMoveEffect,
    withPartialRender,
)((props) => {
    const {
        getBlockOrder
    } = useSelect(
        (select) => select('core/block-editor'),
        []
    );

    const {
        clientId,
        attributes,
        setBlockRef,
    } = props;

    const {
        elementId,
        sticky = {},
        stickyPosition
    } = attributes;

    const elementRef = useRef();
    const animationClass = useAnimationEditor(attributes);
    const displayClass = useDisplayEditor(attributes);
    const hasChildBlocks = getBlockOrder(clientId).length > 0;

    const blockProps = useBlockProps({
        className: classnames(
            'guten-element',
            'guten-form-builder',
            'no-margin',
            elementId,
            animationClass,
            displayClass,
            {
                [`sticky-${stickyPosition}`]: isSticky(sticky),
            }
        ),
        ref: elementRef
    });

    const Component = hasChildBlocks ? FormWrapper : FormPlaceholder;

    useGenerateElementId(clientId, elementId, elementRef);
    useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);
    useDynamicScript(elementRef);

    useEffect(() => {
        if (elementRef) {
            setBlockRef(elementRef);
        }
    }, [elementRef]);

    return <>
        <CopyElementToolbar {...props}/>
        <InspectorControls>
            <PanelTutorial
                title={__('How to use form builder', 'gutenverse-form')}
                list={[
                    {
                        title: __('Adding inputs', 'gutenverse-form'),
                        description: __('Click the + symbol on form builder block, then search for inputs you need (checkbox, text, email, etc). Also don\'t forget to add a submit button.', 'gutenverse-form')
                    },
                    {
                        title: __('Create your form configuration', 'gutenverse-form'),
                        description: __('In the Form Setting panel below, click Create New to create a form action directly from here. Your email configuration is managed inside the form action.', 'gutenverse-form')
                    },
                    {
                        title: __('Edit your form configuration', 'gutenverse-form'),
                        description: __('If a form action is already linked, click Edit Form to update its settings, including confirmation and notification emails.', 'gutenverse-form')
                    }
                ]}
            />
        </InspectorControls>
        <BlockPanelController panelList={panelList} props={props} elementRef={elementRef} />
        <Component blockProps={blockProps} attributes={attributes} clientId={clientId} setAttributes={props.setAttributes} />
    </>;
});

export default FormBuilderBlock;
