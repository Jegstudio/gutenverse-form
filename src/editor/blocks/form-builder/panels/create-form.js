
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { dispatch } from '@wordpress/data';
import { Modal, Button } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { IconTrashSVG } from 'gutenverse-core/icons';
import FormContent from '../../../../backend/form/src/form-content';

export const CreateForm = (props) => {
    // Shim for PopupPro/PopupInsufficientTier
    if (!window['GutenverseDashboard']) {
        window['GutenverseDashboard'] = window['GutenverseConfig'] || {};
    }
    if (!window['GutenverseDashboard'].imgDir) {
        window['GutenverseDashboard'].imgDir = (window['GutenverseConfig'] && window['GutenverseConfig'].gutenverseFormImgDir) ? window['GutenverseConfig'].gutenverseFormImgDir : '';
    }

    const { setAttributes, clientId, compact = false, showEntriesLink = !compact, noticeOnly = false } = props;
    const attributes = props.attributes || props.values || {};
    const autoOpenCreate = !!props.autoOpenCreate;
    const showNotice = props.showNotice !== false;
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [values, setValues] = useState({
        title: 'Form Action'
    });
    const [saving, setSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [isFormActionMissing, setIsFormActionMissing] = useState(false);
    const [isFormActionDataEmpty, setIsFormActionDataEmpty] = useState(false);
    const autoOpenHandled = useRef(false);
    const templatePersistFields = ['user_message_type', 'admin_message_type', 'user_email_template', 'admin_email_template'];

    const persistBuilderAssignment = (nextFormId) => {
        setAttributes({
            formId: nextFormId
                ? {
                    label: values.title,
                    value: nextFormId
                }
                : {
                    label: '',
                    value: ''
                }
        });

        // Persist the block attribute change so a refresh does not lose the assignment.
        setTimeout(() => {
            const editorDispatch = dispatch('core/editor');

            if (editorDispatch?.savePost) {
                editorDispatch.savePost();
            }
        }, 0);
    };

    const persistExistingFormAction = (nextValues) => {
        const formId = attributes.formId?.value;

        if (!formId) {
            return;
        }

        apiFetch({
            path: '/gutenverse-form-client/v1/form-action/edit',
            method: 'POST',
            data: {
                form: {
                    ...nextValues,
                    id: formId
                },
            }
        }).catch((err) => {
            console.error(err); // eslint-disable-line no-console
            setError(err?.message || __('Could not update this form action automatically. Please save the form action manually.', 'gutenverse-form'));
        });
    };

    const ActionRequiredNotice = ({ title, description, buttonLabel, onClick }) => (
        <div className="gutenverse-form-action-empty">
            <div className="gutenverse-form-action-empty-main">
                <div className="gutenverse-form-action-summary">
                    {compact ? (
                        <>
                            <span className="gutenverse-form-action-empty-icon">
                                <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 3C3.13428 3 0 6.13541 0 10C0 13.8668 3.13428 17 7 17C10.8657 17 14 13.8668 14 10C14 6.13541 10.8657 3 7 3ZM7 6.10484C7.65473 6.10484 8.18548 6.6356 8.18548 7.29032C8.18548 7.94505 7.65473 8.47581 7 8.47581C6.34527 8.47581 5.81452 7.94505 5.81452 7.29032C5.81452 6.6356 6.34527 6.10484 7 6.10484ZM8.58064 13.2742C8.58064 13.4612 8.42899 13.6129 8.24193 13.6129H5.75806C5.57101 13.6129 5.41935 13.4612 5.41935 13.2742V12.5968C5.41935 12.4097 5.57101 12.2581 5.75806 12.2581H6.09677V10.4516H5.75806C5.57101 10.4516 5.41935 10.3 5.41935 10.1129V9.43548C5.41935 9.24843 5.57101 9.09677 5.75806 9.09677H7.56452C7.75157 9.09677 7.90323 9.24843 7.90323 9.43548V12.2581H8.24193C8.42899 12.2581 8.58064 12.4097 8.58064 12.5968V13.2742Z" fill="#FFC908" />
                                </svg>
                            </span>
                            <div className="gutenverse-form-action-empty-copy">
                                <div className="empty-title">{title}</div>
                                <div className="empty-description">
                                    {description}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="empty-badge">{__('Action required', 'gutenverse-form')}</div>
                            <div className="empty-title">{title}</div>
                        </>
                    )}
                </div>
                {compact && (
                    <button
                        type="button"
                        className={`gutenverse-form-action-button primary ${saving ? 'disabled' : ''}`}
                        onClick={!saving ? onClick : undefined}
                        disabled={saving}
                    >
                        {buttonLabel}
                    </button>
                )}
            </div>
            {!compact && <p>{description}</p>}
            {!compact && (
                <button
                    type="button"
                    className={`gutenverse-form-action-button primary ${saving ? 'disabled' : ''}`}
                    onClick={!saving ? onClick : undefined}
                    disabled={saving}
                >
                    {buttonLabel}
                </button>
            )}
        </div>
    );

    const updateValue = (id, value) => {
        setValues((prevValues) => {
            const nextValues = {
                ...prevValues,
                [id]: value
            };

            if (templatePersistFields.includes(id) && attributes.formId?.value) {
                persistExistingFormAction(nextValues);
            }

            return nextValues;
        });
    };

    const resetValues = () => {
        const data = applyFilters(
            'gutenverse.form.tab.firstLoad',
            {},
            null
        );
        setValues({
            title: 'Form Action',
            ...data
        });
    };

    const openCreateModal = () => {
        setIsEditing(false);
        resetValues();
        setError('');
        setOpen(true);
    };

    const createLocalFormAction = () => {
        setIsFormActionMissing(false);
        openCreateModal();
    };

    useEffect(() => {
        if (!autoOpenCreate || autoOpenHandled.current || attributes.formId?.value) {
            return;
        }

        autoOpenHandled.current = true;
        openCreateModal();

        if (setAttributes) {
            setAttributes({ openFormActionOnMount: false });
        }
    }, [autoOpenCreate, attributes.formId?.value]);

    const openEditModal = () => {
        const formId = attributes.formId?.value;
        if (!formId) return;

        setIsEditing(true);
        setLoadingData(true);
        setError('');
        setOpen(true);

        apiFetch({
            path: `/gutenverse-form-client/v1/form-action/${formId}`,
            method: 'GET',
        }).then((response) => {
            if (!isExpectedFormAction(response)) {
                setIsFormActionMissing(true);
                setIsFormActionDataEmpty(false);
                setLoadingData(false);
                setOpen(false);
                openCreateModal();
                return;
            }

            if (response) {
                setValues(response);
                setIsFormActionMissing(false);
                setIsFormActionDataEmpty(!!response.is_data_empty);
            }
            setLoadingData(false);
        }).catch((err) => {
            console.error(err); // eslint-disable-line no-console
            setError(err?.message || __('Could not load this form action. Please try again.', 'gutenverse-form'));
            setLoadingData(false);
        });
    };

    const confirmDeleteFormAction = () => {
        const formId = attributes.formId?.value;
        if (!formId || saving) return;

        setSaving(true);
        setError('');
        apiFetch({
            path: `/gutenverse-form-client/v1/form-action/${formId}`,
            method: 'DELETE',
        }).then(() => {
            persistBuilderAssignment('');
            setSaving(false);
            setIsDeleteModalOpen(false);
        }).catch((err) => {
            setSaving(false);
            setIsDeleteModalOpen(false);
            setError(err?.message || __('Could not delete this form action. Please try again.', 'gutenverse-form'));
            console.error(err); // eslint-disable-line no-console
        });
    };

    const submitFormAction = () => {
        if (saving) return;
        if (!values.title || !values.title.trim()) {
            setError(__('Please enter a form action title before saving.', 'gutenverse-form'));
            return;
        }

        setSaving(true);
        setError('');
        const path = isEditing ? '/gutenverse-form-client/v1/form-action/edit' : '/gutenverse-form-client/v1/form-action/create';
        const formId = attributes.formId?.value;
        const formData = isEditing ? { ...values, id: formId } : values;

        apiFetch({
            path: path,
            method: 'POST',
            data: {
                form: formData,
            }
        }).then((response) => {
            setSaving(false);
            setOpen(false);

            if (isEditing) {
                if (values.title && attributes.formId?.label !== values.title) {
                    persistBuilderAssignment(formId);
                }
                setIsFormActionMissing(false);
                setIsFormActionDataEmpty(false);
            } else {
                if (response && !isNaN(response)) {
                    persistBuilderAssignment(response);
                    setIsFormActionMissing(false);
                    setIsFormActionDataEmpty(false);
                }
            }
        }).catch((err) => {
            setSaving(false);
            setError(err?.message || __('Could not save this form action. Please try again.', 'gutenverse-form'));
            console.error(err); // eslint-disable-line no-console
        });
    };

    const hasSelectedForm = !!attributes.formId?.value;
    const formTitle = attributes.formId?.label || __('Untitled form action', 'gutenverse-form');
    const isExpectedFormAction = (response) => {
        const expectedTitle = attributes.formId?.label;

        if (!response) {
            return false;
        }

        if (!expectedTitle) {
            return true;
        }

        return response.title === expectedTitle;
    };
    const adminBase = window.ajaxurl ? window.ajaxurl.replace('admin-ajax.php', '') : '/wp-admin/';
    const entriesUrl = hasSelectedForm
        ? `${adminBase}edit.php?post_type=gutenverse-entries&form_id=${attributes.formId.value}`
        : `${adminBase}edit.php?post_type=gutenverse-entries`;

    useEffect(() => {
        const formId = attributes.formId?.value;

        if (!formId) {
            setIsFormActionMissing(false);
            setIsFormActionDataEmpty(false);
            return;
        }

        apiFetch({
            path: `/gutenverse-form-client/v1/form-action/${formId}`,
            method: 'GET',
        }).then((response) => {
            const isExpected = isExpectedFormAction(response);

            setIsFormActionMissing(!isExpected);
            setIsFormActionDataEmpty(isExpected && !!response?.is_data_empty);
        }).catch((err) => {
            setIsFormActionMissing(err?.code === 'invalid_form_action' || err?.data?.status === 404);
            setIsFormActionDataEmpty(false);
        });
    }, [attributes.formId?.label, attributes.formId?.value]);

    if (noticeOnly && hasSelectedForm && !isFormActionMissing && !isFormActionDataEmpty && !open && !isDeleteModalOpen && !error) {
        return null;
    }

    return (
        <div className={`gutenverse-create-form-action ${compact ? 'is-compact' : ''}`}>
            {error && <div className="gutenverse-form-action-error">{error}</div>}

            {hasSelectedForm ? (
                <>
                    {!noticeOnly && !isFormActionMissing && <div className="gutenverse-form-action-card">
                        <div className="gutenverse-form-action-summary">
                            <div className="gutenverse-form-action-card-header">
                                <span className="status-dot" />
                                <span className="status-label">
                                    {compact ? __('Connected Form Action', 'gutenverse-form') : __('Connected action', 'gutenverse-form')}
                                </span>
                            </div>
                            <div className="gutenverse-form-action-title" title={formTitle}>
                                {formTitle}
                            </div>
                            {compact && (
                                <div className="gutenverse-form-action-meta">
                                    {__('This form sends submissions to the connected form.', 'gutenverse-form')}
                                </div>
                            )}
                            {!compact && (
                                <div className="gutenverse-form-action-meta">
                                    {__('Entries, email, integrations, and submission behavior use this action.', 'gutenverse-form')}
                                </div>
                            )}
                        </div>
                        <div className="gutenverse-form-action-buttons">
                            <button
                                type="button"
                                className={`gutenverse-form-action-button primary ${saving ? 'disabled' : ''}`}
                                onClick={!saving ? openEditModal : undefined}
                                disabled={saving}
                            >
                                {compact ? __('Edit Form Action', 'gutenverse-form') : __('Edit Action', 'gutenverse-form')}
                            </button>
                            <button
                                type="button"
                                className={`gutenverse-form-action-button danger ${saving ? 'disabled' : ''}`}
                                onClick={!saving ? () => setIsDeleteModalOpen(true) : undefined}
                                disabled={saving}
                            >
                                {!compact && <IconTrashSVG size={14} />}
                                {compact ? __('Delete Action', 'gutenverse-form') : __('Delete', 'gutenverse-form')}
                            </button>
                        </div>
                    </div>}

                    {showNotice && isFormActionMissing && (
                        <ActionRequiredNotice
                            title={__('Form Action Required', 'gutenverse-form')}
                            description={__('This imported form action does not exist on this site. Create a new local form action so this form builder can work properly.', 'gutenverse-form')}
                            buttonLabel={__('Create Form Action', 'gutenverse-form')}
                            onClick={createLocalFormAction}
                        />
                    )}

                    {showNotice && !isFormActionMissing && isFormActionDataEmpty && (
                        <ActionRequiredNotice
                            title={__('Form Action Required', 'gutenverse-form')}
                            description={__('This form needs to be set up before it can collect submissions.', 'gutenverse-form')}
                            buttonLabel={__('Set Up Form Action', 'gutenverse-form')}
                            onClick={openEditModal}
                        />
                    )}

                    {!noticeOnly && isFormActionMissing && (
                        <button
                            type="button"
                            className={`gutenverse-form-action-button primary ${saving ? 'disabled' : ''}`}
                            onClick={!saving ? createLocalFormAction : undefined}
                            disabled={saving}
                        >
                            {__('Create Form Action', 'gutenverse-form')}
                        </button>
                    )}

                    {!noticeOnly && !isFormActionMissing && showEntriesLink && (
                        <a
                            href={entriesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gutenverse-form-action-list-link"
                        >
                            {compact ? __('View Form Entries', 'gutenverse-form') : __('View entries for this action', 'gutenverse-form')}
                        </a>
                    )}
                </>
            ) : (
                showNotice ? (
                    <ActionRequiredNotice
                        title={__('Form Action Required', 'gutenverse-form')}
                        description={__('Create a form action to receive submissions.', 'gutenverse-form')}
                        buttonLabel={__('Create Form Action', 'gutenverse-form')}
                        onClick={openCreateModal}
                    />
                ) : (
                    <button
                        type="button"
                        className={`gutenverse-form-action-button primary ${saving ? 'disabled' : ''}`}
                        onClick={!saving ? openCreateModal : undefined}
                        disabled={saving}
                    >
                        {__('Create Form Action', 'gutenverse-form')}
                    </button>
                )
            )}

            {open && (
                <Modal
                    title={isEditing ? __('Edit Form Action', 'gutenverse-form') : __('Create New Form Action', 'gutenverse-form')}
                    onRequestClose={() => setOpen(false)}
                    className="gutenverse-form-builder-modal"
                    style={{ width: '800px', maxHeight: 'calc(100% - 60px)' }}
                >
                    <div className="gutenverse-form-modal-content">
                        {error && <div className="gutenverse-form-action-error modal-error">{error}</div>}
                        {loadingData ? (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                {__('Loading...', 'gutenverse-form')}
                            </div>
                        ) : (
                            <FormContent values={values} updateValue={updateValue} isEditor={true} clientId={clientId} />
                        )}
                    </div>
                    <div className="gutenverse-form-modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                            type="button"
                            className={`gutenverse-button create ${saving ? 'disabled' : ''}`}
                            onClick={() => submitFormAction()}
                            disabled={saving}
                        >
                            {saving ? __('Saving...', 'gutenverse-form') : (isEditing ? __('Update Form', 'gutenverse-form') : __('Create Form', 'gutenverse-form'))}
                        </button>
                        <button
                            type="button"
                            className="gutenverse-button cancel"
                            onClick={() => setOpen(false)}
                            disabled={saving}
                        >
                            {__('Cancel', 'gutenverse-form')}
                        </button>
                    </div>
                </Modal>
            )}

            {isDeleteModalOpen && (
                <Modal
                    title={__('Delete Form Action', 'gutenverse-form')}
                    onRequestClose={() => setIsDeleteModalOpen(false)}
                    className="gutenverse-form-confirm-modal"
                >
                    <div style={{ padding: '0 20px 20px' }}>
                        <p style={{ margin: '0 0 20px 0', fontSize: '14px', lineHeight: '1.5' }}>
                            {__('Are you sure you want to delete this form action? This cannot be undone and will permanently remove the action data.', 'gutenverse-form')}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <Button isSecondary onClick={() => setIsDeleteModalOpen(false)}>
                                {__('Cancel', 'gutenverse-form')}
                            </Button>
                            <Button isPrimary isDestructive onClick={confirmDeleteFormAction} disabled={saving}>
                                {saving ? __('Deleting...', 'gutenverse-form') : __('Delete Permanently', 'gutenverse-form')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
