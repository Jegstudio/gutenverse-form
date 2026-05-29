import { compose } from '@wordpress/compose';
import { parse } from '@wordpress/blocks';
import { withAnimationStickyV2, withMouseMoveEffect, withPartialRender, withPassRef } from 'gutenverse-core/hoc';
import { useBlockProps, InnerBlocks, InspectorControls, BlockControls } from '@wordpress/block-editor';
import classnames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { BlockPanelController } from 'gutenverse-core/controls';
import { panelList } from './panels/panel-list';
import { useEffect, useRef, useState } from '@wordpress/element';
import { isSticky, openFreemiusPopup } from 'gutenverse-core/helper';
import { useRichTextParameter } from 'gutenverse-core/helper';
import { useAnimationEditor } from 'gutenverse-core/hooks';
import { useDisplayEditor } from 'gutenverse-core/hooks';
import { dispatch, select, subscribe, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { applyFilters, hasFilter } from '@wordpress/hooks';
import { PanelTutorial } from 'gutenverse-core/controls';
import { useDynamicScript, useDynamicStyle, useGenerateElementId } from 'gutenverse-core/styling';
import getBlockStyle from './styles/block-style';
import { CopyElementToolbar } from 'gutenverse-core/components';
import bookingTemplateData from './data/booking-template.json';
import contactTemplateData from './data/contact-template.json';
import subscribeTemplateData from './data/subscribe-template.json';
import { CreateForm } from './panels/create-form';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { isBlockPreviewContext } from '../form-input/general/is-preview-context';
import { signal } from 'gutenverse-core/editor-helper';

const BULK_STYLE_PANEL_STATE = {
    panel: 'setting',
    section: 2,
};

const FORM_BUILDER_BLOCK_NAME = 'gutenverse/form-builder';
const APPOINTMENT_TEMPLATE_ID = 'appointment';
const APPOINTMENT_TEMPLATE_PREVIEW_IMAGE = 'form-builder-appointment.png';
const FORM_BUILDER_TEMPLATES_FILTER = 'gutenverse-form.form-builder-templates';
const FORM_BUILDER_TEMPLATE_CONTENT_FILTER = 'gutenverse-form.form-builder-template-content';

const createFormInstanceId = () => {
    if (window?.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    return `form-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getFormActionId = (formId) => formId?.value || '';

const collectFormBuilderBlocks = (blocks = [], result = []) => {
    blocks.forEach(block => {
        if (block.name === FORM_BUILDER_BLOCK_NAME) {
            result.push(block);
        }

        if (block.innerBlocks?.length) {
            collectFormBuilderBlocks(block.innerBlocks, result);
        }
    });

    return result;
};

const persistCurrentPost = () => {
    setTimeout(() => {
        const editorDispatch = dispatch('core/editor');

        if (editorDispatch?.savePost) {
            editorDispatch.savePost();
        }
    }, 0);
};

const NoticeMessages = ({ successExample = false, errorExample = false }) => {
    return <>
        {successExample && <div className="form-notification"><div className="notification-body guten-success">{__('Thank you! (You can setup this message inside your form setting in Dashboard->Form).')}</div></div>}
        {errorExample && <div className="form-notification"><div className="notification-body guten-error">{__('Something went wrong! (You can setup this message inside your form setting in Dashboard->Form).')}</div></div>}
    </>;
};

const FormActionOwnershipNotice = ({ message }) => {
    if (!message) {
        return null;
    }

    return <div className="gutenverse-form-action-ownership-notice">{message}</div>;
};

const FormWrapper = ({ blockProps, attributes, clientId, setAttributes, ownershipNotice, isPreviewContext = false }) => {
    return (
        <div {...blockProps}>
            {!isPreviewContext && <NoticeMessages {...attributes} />}
            {!isPreviewContext && <FormActionOwnershipNotice message={ownershipNotice} />}
            {!isPreviewContext && (
                <div className="gutenverse-form-builder-inline-action">
                    <CreateForm
                        attributes={attributes}
                        clientId={clientId}
                        setAttributes={setAttributes}
                        compact
                        autoOpenCreate={attributes.openFormActionOnMount}
                        noticeOnly
                    />
                </div>
            )}
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
    booking: bookingTemplateData,
    contact: contactTemplateData,
    subscribe: subscribeTemplateData
};

const TemplatePreview = ({ templateId, template = {} }) => {
    const imageBase = window?.GutenverseConfig?.gutenverseFormImgDir || '';
    const previewImage = template.previewImage || TEMPLATE_DATA[templateId]?.previewImage || (templateId === 'library' ? 'form-builder-library.png' : '');
    const imageSrc = imageBase && previewImage
        ? `${imageBase}/${previewImage}`
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

const FormPlaceholder = ({ blockProps, attributes, clientId, setAttributes, ownershipNotice, isPreviewContext = false }) => {
    const [blankMode, setBlankMode] = useState(false);
    const [creatingForm, setCreatingForm] = useState(false);
    const [error, setError] = useState('');
    const [templateFilterVersion, setTemplateFilterVersion] = useState(0);
    const pendingLibraryImportRef = useRef(null);
    const { replaceBlocks, removeBlocks } = dispatch('core/block-editor');
    const hasProPluginActive = Boolean(window?.GutenverseConfig?.plugins?.['gutenverse-pro']?.active || window?.gserver);
    const hasActiveProLicense = !isEmpty(window?.gprodata);
    const hasPremiumTemplateContentFilter = hasFilter(FORM_BUILDER_TEMPLATE_CONTENT_FILTER);
    const adminUrl = window?.GutenverseConfig?.adminUrl || '/wp-admin/';
    const upgradeUrl = window?.GutenverseConfig?.upgradeProUrl || `${adminUrl}admin.php?page=gutenverse&path=license`;
    const licenseUrl = window?.GutenverseConfig?.updateLicensePage || `${adminUrl}admin.php?page=gutenverse&path=license`;
    useEffect(() => {
        const bindFormBuilderTemplate = signal.afterFilterSignal.add(() => {
            setTemplateFilterVersion(current => current + 1);
            return true;
        });

        return () => {
            bindFormBuilderTemplate.detach();
        };
    }, []);

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

    useEffect(() => {
        const unsubscribe = subscribe(() => {
            const pendingLibraryImport = pendingLibraryImportRef.current;

            if (!pendingLibraryImport) {
                return;
            }

            const libraryStore = select('gutenverse/library');
            const modalData = libraryStore?.getModalData ? libraryStore.getModalData() : {};
            const isImportingSection = !!modalData?.lockSectionImport;

            if (isImportingSection) {
                pendingLibraryImport.wasImporting = true;
                return;
            }

            if (!pendingLibraryImport.wasImporting) {
                return;
            }

            pendingLibraryImportRef.current = null;

            const blockEditorStore = select('core/block-editor');
            const block = blockEditorStore.getBlock(clientId);

            if (!block) {
                return;
            }

            const parentClientId = blockEditorStore.getBlockRootClientId(clientId) || '';
            const currentBlockCount = blockEditorStore.getBlockOrder(parentClientId).length;

            if (currentBlockCount > pendingLibraryImport.initialBlockCount) {
                removeBlocks(clientId, false);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [clientId, removeBlocks]);

    const openFormLibrary = () => {
        const libraryButton = document.getElementById('gutenverse-library-button');

        if (!libraryButton) {
            setError(__('The Gutenverse Library button is not available in this editor.', 'gutenverse-form'));
            setCreatingForm(false);
            return;
        }

        const blockEditorStore = select('core/block-editor');
        const parentClientId = blockEditorStore.getBlockRootClientId(clientId) || '';

        pendingLibraryImportRef.current = {
            initialBlockCount: blockEditorStore.getBlockOrder(parentClientId).length,
            wasImporting: false,
        };

        setError('');
        libraryButton.click();
        selectFormLibraryFilter();
    };

    const openPremiumTemplatePopup = (event = null) => {
        if (event?.preventDefault) {
            event.preventDefault();
        }

        if (hasProPluginActive) {
            window.open(licenseUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        const popupOpened = openFreemiusPopup(null, upgradeUrl, {
            medium: 'form-builder-template',
            campaign: 'appointment-form-template',
        });

        if (!popupOpened && upgradeUrl) {
            window.open(upgradeUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const createNewForm = (template) => {
        if (creatingForm) {
            return;
        }

        setCreatingForm(true);
        const templateId = typeof template === 'string' ? template : template?.id;

        if (templateId === 'blank') {
            setBlankMode(true);
            setError('');
            setCreatingForm(false);
            return;
        }

        if (templateId === 'library') {
            openFormLibrary();
            return;
        }

        const selectedTemplateContent = applyFilters(
            FORM_BUILDER_TEMPLATE_CONTENT_FILTER,
            TEMPLATE_DATA[templateId]?.templateContent || '',
            {
                template,
                templateId,
                hasProPluginActive,
                hasActiveProLicense,
                hasPremiumTemplateContentFilter,
                templateFilterVersion,
            }
        );

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

        if (template?.pro) {
            openPremiumTemplatePopup();
            setCreatingForm(false);
            return;
        }

        setError(__('Template block data is not connected yet.', 'gutenverse-form'));
        setCreatingForm(false);
    };

    const filteredPremiumTemplates = applyFilters(
        FORM_BUILDER_TEMPLATES_FILTER,
        [
            {
                id: APPOINTMENT_TEMPLATE_ID,
                label: __('Appointment Form', 'gutenverse-form'),
                pro: true,
                previewImage: APPOINTMENT_TEMPLATE_PREVIEW_IMAGE,
            },
        ],
        {
            hasActiveProLicense,
            hasProPluginActive,
            hasPremiumTemplateContentFilter,
            templateFilterVersion,
        }
    );
    const premiumTemplates = Array.isArray(filteredPremiumTemplates) ? filteredPremiumTemplates : [];

    const templates = [
        { id: 'blank', label: __('Blank Form', 'gutenverse-form') },
        { id: 'contact', label: __('Contact Form', 'gutenverse-form') },
        { id: 'subscribe', label: __('Subscribe Form', 'gutenverse-form') },
        { id: 'booking', label: __('Booking Form', 'gutenverse-form') },
        ...premiumTemplates,
        { id: 'library', label: __('Choose From Library', 'gutenverse-form') },
    ];

    return (
        <div {...blockProps}>
            {!isPreviewContext && <NoticeMessages {...attributes} />}
            {!isPreviewContext && <FormActionOwnershipNotice message={ownershipNotice} />}
            {blankMode ? (
                <>
                    <div className="gutenverse-form-builder-inline-action">
                        <CreateForm
                            attributes={attributes}
                            clientId={clientId}
                            setAttributes={setAttributes}
                            compact
                            autoOpenCreate={attributes.openFormActionOnMount}
                            noticeOnly
                        />
                    </div>
                    <InnerBlocks
                        renderAppender={InnerBlocks.ButtonBlockAppender}
                        clientId={clientId}
                    />
                </>
            ) : (
                <div className="guten-form-builder-placeholder is-setup">
                    <div className="placeholder-main-icon">
                        <FormBuilderIcon />
                    </div>
                    <h3>{__('Create a Form', 'gutenverse-form')}</h3>
                    <p>{__('Choose a starting template to begin building right away. Each form builder manages its own dedicated form action.', 'gutenverse-form')}</p>
                    <div className="placeholder-template-grid">
                        {templates.map(template => (
                            <button
                                type="button"
                                className={classnames('placeholder-template-card', {
                                    'pro-locked': template.pro && !hasPremiumTemplateContentFilter
                                })}
                                key={template.id}
                                disabled={creatingForm}
                                onClick={(event) => {
                                    if (template.pro && !hasPremiumTemplateContentFilter) {
                                        setError('');
                                        openPremiumTemplatePopup(event);
                                        return;
                                    }
                                    setError('');
                                    createNewForm(template);
                                }}
                            >
                                {template.pro && <span className="template-pro-badge">{__('PRO', 'gutenverse-form')}</span>}
                                <TemplatePreview templateId={template.id} template={template} />
                                <strong>{template.label}</strong>
                            </button>
                        ))}
                    </div>
                    {error && <p className="placeholder-error">{error}</p>}
                </div>
            )}
        </div>
    );
};

const useFormActionOwnership = ({ attributes, clientId, setAttributes, disabled = false }) => {
    const [ownershipNotice, setOwnershipNotice] = useState('');
    const ownershipRequestKey = useRef('');
    const formActionId = getFormActionId(attributes.formId);
    const formInstanceId = attributes.formInstanceId || '';
    const formBuilderBlocks = useSelect(
        (select) => collectFormBuilderBlocks(select('core/block-editor').getBlocks()),
        []
    );
    const currentPostId = useSelect(
        (select) => select('core/editor')?.getCurrentPostId?.() || 0,
        []
    );

    const getSameInstanceBlocks = () => {
        if (!formActionId || !formInstanceId) {
            return [];
        }

        return formBuilderBlocks.filter(block => (
            `${getFormActionId(block.attributes?.formId)}` === `${formActionId}` &&
            block.attributes?.formInstanceId === formInstanceId
        ));
    };

    useEffect(() => {
        if (disabled) {
            return;
        }

        if (!attributes.formInstanceId) {
            setAttributes({ formInstanceId: createFormInstanceId() });
        }
    }, [attributes.formInstanceId, disabled, setAttributes]);

    useEffect(() => {
        if (disabled) {
            return;
        }

        const sameInstanceBlocks = getSameInstanceBlocks();
        const firstInstanceBlock = sameInstanceBlocks[0];

        if (sameInstanceBlocks.length > 1 && firstInstanceBlock?.clientId !== clientId) {
            setOwnershipNotice('');
            setAttributes({ formInstanceId: createFormInstanceId() });
        }
    }, [clientId, disabled, formActionId, formInstanceId, formBuilderBlocks, setAttributes]);

    useEffect(() => {
        if (disabled) {
            return;
        }

        if (!formActionId || !formInstanceId || !currentPostId) {
            return;
        }

        const sameInstanceBlocks = getSameInstanceBlocks();
        const firstInstanceBlock = sameInstanceBlocks[0];

        if (sameInstanceBlocks.length > 1 && firstInstanceBlock?.clientId !== clientId) {
            return;
        }

        const requestKey = `${formActionId}:${currentPostId}:${formInstanceId}`;

        if (ownershipRequestKey.current === requestKey) {
            return;
        }

        ownershipRequestKey.current = requestKey;

        apiFetch({
            path: '/gutenverse-form-client/v1/form-action/ownership',
            method: 'POST',
            data: {
                id: formActionId,
                owner_post_id: currentPostId,
                owner_instance_id: formInstanceId,
            }
        }).then((response) => {
            const nextFormId = response?.formId;

            if (nextFormId?.value && Number(nextFormId.value) !== Number(formActionId)) {
                setAttributes({ formId: nextFormId });
                persistCurrentPost();
            }

            if (response?.copied) {
                setOwnershipNotice(__('This duplicated form now uses its own copied form action. Changes here will not affect the original form.', 'gutenverse-form'));
            }
        }).catch(() => {
            ownershipRequestKey.current = '';
        });
    }, [clientId, currentPostId, disabled, formActionId, formInstanceId, formBuilderBlocks, setAttributes]);

    return disabled ? '' : ownershipNotice;
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
    const isPreviewContext = isBlockPreviewContext(elementRef.current);

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
    const ownershipNotice = useFormActionOwnership({
        attributes,
        clientId,
        setAttributes: props.setAttributes,
        disabled: isPreviewContext,
    });

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
                ]}
            />
            <div className="gutenverse-form-action-inspector">
                <CreateForm
                    attributes={attributes}
                    clientId={clientId}
                    setAttributes={props.setAttributes}
                    compact
                    showEntriesLink
                />
            </div>
        </InspectorControls>
        <BlockPanelController panelList={panelList} props={props} elementRef={elementRef} panelState={panelState} setPanelIsClicked={setPanelIsClicked} />
        <Component blockProps={blockProps} attributes={attributes} clientId={clientId} setAttributes={props.setAttributes} ownershipNotice={ownershipNotice} isPreviewContext={isPreviewContext} />
    </>;
});

export default FormBuilderBlock;
