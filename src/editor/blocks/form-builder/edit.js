import { compose } from '@wordpress/compose';
import { parse } from '@wordpress/blocks';
import { withAnimationStickyV2, withMouseMoveEffect, withPartialRender, withPassRef } from 'gutenverse-core/hoc';
import { useBlockProps, InnerBlocks, InspectorControls, BlockControls } from '@wordpress/block-editor';
import classnames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { BlockPanelController } from 'gutenverse-core/controls';
import { panelList } from './panels/panel-list';
import { useEffect, useRef, useState } from '@wordpress/element';
import { isSticky } from 'gutenverse-core/helper';
import { useRichTextParameter } from 'gutenverse-core/helper';
import { useAnimationEditor } from 'gutenverse-core/hooks';
import { useDisplayEditor } from 'gutenverse-core/hooks';
import { dispatch, select, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { PanelTutorial } from 'gutenverse-core/controls';
import { useDynamicScript, useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';
import appointmentTemplateData from './data/appointment-template.json';
import bookingTemplateData from './data/booking-template.json';
import contactTemplateData from './data/contact-template.json';
import subscribeTemplateData from './data/subscribe-template.json';
import { Modal, Button, ToolbarGroup, ToolbarButton } from '@wordpress/components';

const BULK_STYLE_PANEL_STATE = {
    panel: 'setting',
    section: 2,
};

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

const TEMPLATE_DATA = {
    appointment: appointmentTemplateData,
    booking: bookingTemplateData,
    contact: contactTemplateData,
    subscribe: subscribeTemplateData
};

const TemplatePreview = ({ templateId }) => {
    const imageBase = window?.GutenverseConfig?.gutenverseFormImgDir || '';
    const imageSrc = imageBase && (TEMPLATE_DATA[templateId]?.previewImage || (templateId === 'library' ? 'form-builder-library.png' : ''))
        ? `${imageBase}/${TEMPLATE_DATA[templateId]?.previewImage || 'form-builder-library.png'}`
        : '';

    if (imageSrc) {
        return (
            <div className={classnames('template-preview-box', {
                [`template-preview-box-${templateId}`]: !!templateId
            })}>
                <img
                    src={imageSrc}
                    alt={sprintf(__('Form %s preview', 'gutenverse-form'), templateId)}
                    className="template-preview-image"
                />
            </div>
        );
    }

    if (templateId === 'blank') {
        return <div className="template-preview-box template-preview-box-blank" />;
    }

    return <div className="template-preview-box" />;
};

const FormPlaceholder = ({ blockProps, attributes, clientId }) => {
    const [setupOpen, setSetupOpen] = useState(false);
    const [blankMode, setBlankMode] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('contact');
    const [creatingForm, setCreatingForm] = useState(false);
    const [error, setError] = useState('');
    const [proPopupActive, setProPopupActive] = useState(false);
    const { replaceBlocks } = dispatch('core/block-editor');
    const hasProPluginActive = !!window?.GutenverseConfig?.plugins?.['gutenverse-pro']?.active;
    const hasActiveProLicense = !isEmpty(window?.gprodata);
    const imageBase = window?.GutenverseConfig?.gutenverseFormImgDir || '';
    const appointmentPreviewImage = imageBase ? `${imageBase}/${appointmentTemplateData.previewImage}` : '';
    const adminUrl = window?.GutenverseConfig?.adminUrl || '/wp-admin/';
    const upgradeUrl = window?.GutenverseConfig?.upgradeProUrl || `${adminUrl}admin.php?page=gutenverse&path=license`;
    const licenseUrl = `${adminUrl}admin.php?page=gutenverse&path=license`;

    const findFormCategory = (sectionCategories = []) => {
        let result = null;

        sectionCategories.some(parent => {
            const childs = parent?.childs || {};

            return Object.keys(childs).some(key => {
                const child = childs[key];
                const name = `${child?.name || ''}`.toLowerCase();
                const slug = `${child?.slug || ''}`.toLowerCase();

                if (name === 'form' || name === 'forms' || slug === 'form' || slug === 'forms') {
                    result = {
                        id: child.id,
                        parent: parent.id
                    };
                    return true;
                }

                return false;
            });
        });

        return result;
    };

    const selectFormLibraryFilter = (attempt = 0) => {
        const libraryStore = select('gutenverse/library');
        const libraryData = libraryStore?.getLibraryData ? libraryStore.getLibraryData() : {};
        const modalData = libraryStore?.getModalData ? libraryStore.getModalData() : {};
        const formCategory = findFormCategory(libraryData?.sectionCategories);

        if (!modalData?.libraryData || !libraryData?.sectionCategories || !formCategory) {
            if (attempt < 20) {
                setTimeout(() => selectFormLibraryFilter(attempt + 1), 300);
            } else {
                setError(__('Could not find the Form section category in the library.', 'gutenverse-form'));
                setCreatingForm(false);
            }
            return;
        }

        dispatch('gutenverse/library').setActiveLiblary('section');
        dispatch('gutenverse/library').setCategories([]);
        dispatch('gutenverse/library').setAuthor('');
        dispatch('gutenverse/library').setLicense('');
        dispatch('gutenverse/library').setStatus('');
        dispatch('gutenverse/library').setPaging(1);
        dispatch('gutenverse/library').setCategories(formCategory);
        setCreatingForm(false);
    };

    const openFormLibrary = () => {
        const libraryButton = document.getElementById('gutenverse-library-button');

        if (!libraryButton) {
            setError(__('The Gutenverse Library button is not available in this editor.', 'gutenverse-form'));
            setCreatingForm(false);
            return;
        }

        setError('');
        libraryButton.click();
        selectFormLibraryFilter();
    };

    const createNewForm = () => {
        if (creatingForm) {
            return;
        }

        setCreatingForm(true);

        if (selectedTemplate === 'blank') {
            setBlankMode(true);
            setSetupOpen(false);
            setError('');
            setCreatingForm(false);
            return;
        }

        if (selectedTemplate === 'library') {
            openFormLibrary();
            return;
        }

        const templateBlocks = Object.fromEntries(
            Object.entries(TEMPLATE_DATA).map(([templateId, templateData]) => [templateId, templateData.templateContent])
        );
        const selectedTemplateContent = templateBlocks[selectedTemplate];

        if (selectedTemplate === 'appointment' && !hasActiveProLicense) {
            setCreatingForm(false);
            setProPopupActive(true);
            return;
        }

        if (selectedTemplateContent) {
            const blocks = parse(selectedTemplateContent);

            if (!blocks.length) {
                setError(__('Could not prepare the selected template. Please try again.', 'gutenverse-form'));
                setCreatingForm(false);
                return;
            }

            setError('');
            replaceBlocks(clientId, blocks);
            return;
        }

        setError(__('Template block data is not connected yet.', 'gutenverse-form'));
        setCreatingForm(false);
    };

    const getCreateButtonLabel = () => {
        if (!creatingForm) {
            return __('Create Form', 'gutenverse-form');
        }

        if (selectedTemplate === 'library') {
            return __('Opening Library...', 'gutenverse-form');
        }

        return __('Creating Form...', 'gutenverse-form');
    };

    const templates = [
        { id: 'blank', label: __('Blank Form', 'gutenverse-form') },
        { id: 'contact', label: __('Form Contact', 'gutenverse-form') },
        { id: 'subscribe', label: __('Form Subscribe', 'gutenverse-form') },
        { id: 'booking', label: __('Form Booking', 'gutenverse-form') },
        { id: 'appointment', label: __('Form Appointment', 'gutenverse-form'), pro: appointmentTemplateData.pro },
        { id: 'library', label: __('Choose From Library', 'gutenverse-form') },
    ];

    return (
        <div {...blockProps}>
            {proPopupActive && (
                <Modal
                    title={__('Appointment Form Template', 'gutenverse-form')}
                    onRequestClose={() => setProPopupActive(false)}
                    className="gutenverse-form-template-pro-modal"
                >
                    <div className="gutenverse-form-template-pro-content">
                        {appointmentPreviewImage && (
                            <div className="gutenverse-form-template-pro-preview">
                                <img
                                    src={appointmentPreviewImage}
                                    alt={__('Appointment Form template preview', 'gutenverse-form')}
                                />
                            </div>
                        )}
                        <div className="gutenverse-form-template-pro-copy">
                            <span className="template-pro-pill">{__('PRO Template', 'gutenverse-form')}</span>
                            <h3>{__('Unlock the Appointment Form layout', 'gutenverse-form')}</h3>
                            <p>{__('This starter template is available for active Gutenverse PRO licenses. Upgrade or activate your license to use it in the editor.', 'gutenverse-form')}</p>
                        </div>
                        <div className="gutenverse-form-template-pro-actions">
                            <Button
                                variant="tertiary"
                                onClick={() => setProPopupActive(false)}
                            >
                                {__('Maybe later', 'gutenverse-form')}
                            </Button>
                            <Button
                                variant={hasProPluginActive ? 'primary' : 'secondary'}
                                href={hasProPluginActive ? licenseUrl : upgradeUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {hasProPluginActive
                                    ? __('Activate License', 'gutenverse-form')
                                    : __('Upgrade to PRO', 'gutenverse-form')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
            <NoticeMessages {...attributes} />
            {blankMode ? (
                <InnerBlocks
                    renderAppender={InnerBlocks.ButtonBlockAppender}
                    clientId={clientId}
                />
            ) : (
                <div className={`guten-form-builder-placeholder ${setupOpen ? 'is-setup' : ''}`}>
                    {setupOpen && (
                        <button type="button" className="placeholder-back" onClick={() => {
                            setSetupOpen(false);
                            setError('');
                        }} disabled={creatingForm}>
                            <span>&larr;</span>
                            {__('Back', 'gutenverse-form')}
                        </button>
                    )}
                    <div className="placeholder-main-icon">
                        <FormBuilderIcon />
                    </div>
                    {setupOpen ? (
                        <>
                            <h3>{__('New Form Setup', 'gutenverse-form')}</h3>
                            <p>{__('Set up your form details and select a starting layout.', 'gutenverse-form')}</p>
                            <div className="placeholder-template-grid">
                                {templates.map(template => (
                                    <button
                                        type="button"
                                        className={classnames('placeholder-template-card', {
                                            active: selectedTemplate === template.id,
                                            'pro-locked': template.pro && !hasActiveProLicense
                                        })}
                                        key={template.id}
                                        onClick={() => {
                                            if (template.pro && !hasActiveProLicense) {
                                                setProPopupActive(true);
                                                return;
                                            }
                                            setSelectedTemplate(template.id);
                                            setError('');
                                        }}
                                        disabled={creatingForm}
                                    >
                                        {template.pro && <span className="template-pro-badge">{__('PRO', 'gutenverse-form')}</span>}
                                        <TemplatePreview templateId={template.id} />
                                        <strong>{template.label}</strong>
                                    </button>
                                ))}
                            </div>
                            {error && <p className="placeholder-error">{error}</p>}
                            <button
                                type="button"
                                className={classnames('placeholder-create-button', {
                                    loading: creatingForm
                                })}
                                onClick={createNewForm}
                                disabled={creatingForm}
                            >
                                {getCreateButtonLabel()}
                            </button>
                        </>
                    ) : (
                        <>
                            <h3>{__('Create a Form', 'gutenverse-form')}</h3>
                            <p>{__('Start a new form here. Each form builder manages its own dedicated form action.', 'gutenverse-form')}</p>
                            <div className="placeholder-actions">
                                <button type="button" className="placeholder-action" onClick={() => {
                                    setSetupOpen(true);
                                    setError('');
                                }}>
                                    <span className="placeholder-action-icon">
                                        <FormBuilderIcon add />
                                    </span>
                                    <span>
                                        <strong>{__('Create New Form', 'gutenverse-form')}</strong>
                                        <small>{__('Start a new form directly from the editor', 'gutenverse-form')}</small>
                                    </span>
                                </button>
                            </div>
                            {error && <p className="placeholder-error">{error}</p>}
                        </>
                    )}
                </div>
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
        panelState,
        setPanelState,
        setPanelIsClicked
    } = useRichTextParameter();

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

    useEffect(() => {
        const pendingNavigation = window.gutenverseFormBuilderPanelNavigation;

        if (pendingNavigation?.clientId === clientId) {
            setPanelState(pendingNavigation.panelState);
            setPanelIsClicked(false);
            delete window.gutenverseFormBuilderPanelNavigation;
        }
    }, [clientId, setPanelIsClicked, setPanelState]);

    const openBulkStylePanel = () => {
        setPanelState(BULK_STYLE_PANEL_STATE);
        setPanelIsClicked(false);
    };

    return <>
        <CopyElementToolbar {...props}/>
        <BlockControls>
            <ToolbarGroup>
                <ToolbarButton
                    text={__('Sync Input Styles', 'gutenverse-form')}
                    label={__('Sync Input Styles', 'gutenverse-form')}
                    onClick={openBulkStylePanel}
                />
            </ToolbarGroup>
        </BlockControls>
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
        <BlockPanelController panelList={panelList} props={props} elementRef={elementRef} panelState={panelState} setPanelIsClicked={setPanelIsClicked} />
        <Component blockProps={blockProps} attributes={attributes} clientId={clientId} setAttributes={props.setAttributes} />
    </>;
});

export default FormBuilderBlock;
