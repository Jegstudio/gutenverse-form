
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
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

    const { setAttributes, clientId } = props;
    const attributes = props.attributes || props.values || {};
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [values, setValues] = useState({
        title: 'Form Action'
    });
    const [saving, setSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');

    const updateValue = (id, value) => {
        setValues((prevValues) => ({
            ...prevValues,
            [id]: value
        }));
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
            if (response) {
                setValues(response);
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
            setAttributes({
                formId: {
                    label: '',
                    value: ''
                }
            });
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
                    setAttributes({
                        formId: {
                            label: values.title,
                            value: formId
                        }
                    });
                }
            } else {
                if (response && !isNaN(response)) {
                    setAttributes({
                        formId: {
                            label: values.title,
                            value: response
                        }
                    });
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
    const adminBase = window.ajaxurl ? window.ajaxurl.replace('admin-ajax.php', '') : '/wp-admin/';
    const entriesUrl = hasSelectedForm
        ? `${adminBase}edit.php?post_type=gutenverse-entries&form_id=${attributes.formId.value}`
        : `${adminBase}edit.php?post_type=gutenverse-entries`;

    return (
        <div className="gutenverse-create-form-action">
            {error && <div className="gutenverse-form-action-error">{error}</div>}

            {hasSelectedForm ? (
                <>
                    <div className="gutenverse-form-action-card">
                        <div className="gutenverse-form-action-card-header">
                            <span className="status-dot" />
                            <span className="status-label">{__('Connected action', 'gutenverse-form')}</span>
                        </div>
                        <div className="gutenverse-form-action-title" title={formTitle}>
                            {formTitle}
                        </div>
                        <div className="gutenverse-form-action-meta">
                            {__('Entries, email, integrations, and submission behavior use this action.', 'gutenverse-form')}
                        </div>
                    </div>

                    <div className="gutenverse-form-action-buttons">
                        <button
                            type="button"
                            className={`gutenverse-form-action-button primary ${saving ? 'disabled' : ''}`}
                            onClick={!saving ? openEditModal : undefined}
                            disabled={saving}
                        >
                            {__('Edit Action', 'gutenverse-form')}
                        </button>
                        <button
                            type="button"
                            className={`gutenverse-form-action-button danger ${saving ? 'disabled' : ''}`}
                            onClick={!saving ? () => setIsDeleteModalOpen(true) : undefined}
                            disabled={saving}
                        >
                            <IconTrashSVG size={14} />
                            {__('Delete', 'gutenverse-form')}
                        </button>
                    </div>

                    <a
                        href={entriesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gutenverse-form-action-list-link"
                    >
                        {__('View entries for this action', 'gutenverse-form')}
                    </a>
                </>
            ) : (
                <div className="gutenverse-form-action-empty">
                    <div className="empty-badge">{__('Action required', 'gutenverse-form')}</div>
                    <div className="empty-title">{__('Submissions need a destination', 'gutenverse-form')}</div>
                    <p>{__('The form can submit, but without a form action entries are hard to track and confirmation emails will not be sent.', 'gutenverse-form')}</p>
                    <button
                        type="button"
                        className={`gutenverse-form-action-button primary ${saving ? 'disabled' : ''}`}
                        onClick={!saving ? openCreateModal : undefined}
                        disabled={saving}
                    >
                        {__('Create Form Action', 'gutenverse-form')}
                    </button>
                </div>
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
