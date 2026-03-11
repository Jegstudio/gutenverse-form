
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
        setOpen(true);
    };

    const openEditModal = () => {
        const formId = attributes.formId?.value;
        if (!formId) return;

        setIsEditing(true);
        setLoadingData(true);
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
            setLoadingData(false);
        });
    };

    const confirmDeleteFormAction = () => {
        const formId = attributes.formId?.value;
        if (!formId || saving) return;

        setSaving(true);
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
            console.error(err); // eslint-disable-line no-console
        });
    };

    const submitFormAction = () => {
        setSaving(true);
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
            console.error(err); // eslint-disable-line no-console
        });
    };

    const hasSelectedForm = !!attributes.formId?.value;

    return (
        <div className="gutenverse-create-form-action" style={{ marginTop: '10px' }}>
            {hasSelectedForm && (
                <div style={{
                    marginBottom: '15px',
                    padding: '12px',
                    backgroundColor: '#f0f6fb',
                    borderLeft: '4px solid #007cba',
                    borderRadius: '4px',
                }}>
                    <div style={{
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        color: '#007cba',
                        marginBottom: '4px',
                        letterSpacing: '0.05em'
                    }}>
                        {__('Connected Action', 'gutenverse-form')}
                    </div>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#1e1e1e',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                    }}>
                        {attributes.formId.label || __('(no title)', 'gutenverse-form')}
                    </div>
                </div>
            )}

            <div className="gutenverse-form-action-buttons" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {!hasSelectedForm ? (
                    <div
                        className={`gutenverse-button create ${saving ? 'disabled' : ''}`}
                        onClick={!saving ? openCreateModal : undefined}
                        title={__('Create New Form Action', 'gutenverse-form')}
                    >
                        {__('Create New', 'gutenverse-form')}
                    </div>
                ) : (
                    <>
                        <div
                            className={`gutenverse-button edit ${saving ? 'disabled' : ''}`}
                            onClick={!saving ? openEditModal : undefined}
                            title={__('Edit Selected Form', 'gutenverse-form')}
                        >
                            {__('Edit Form', 'gutenverse-form')}
                        </div>
                        <div
                            className={`gutenverse-button cancel destructive ${saving ? 'disabled' : ''}`}
                            onClick={() => setIsDeleteModalOpen(true)}
                            title={__('Delete Selected Form', 'gutenverse-form')}
                            style={{ backgroundColor: '#d63638', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            <IconTrashSVG size={14} />
                            {__('Delete', 'gutenverse-form')}
                        </div>
                    </>
                )}
            </div>

            <a
                href={window.ajaxurl ? window.ajaxurl.replace('admin-ajax.php', 'admin.php?page=gutenverse-form') : '/wp-admin/admin.php?page=gutenverse-form'}
                target="_blank"
                rel="noopener noreferrer"
                className="gutenverse-form-action-list-link"
                title={__('View Form Entries', 'gutenverse-form')}
            >
                {__('View Form Entries', 'gutenverse-form')}
            </a>

            {open && (
                <Modal
                    title={isEditing ? __('Edit Form Action', 'gutenverse-form') : __('Create New Form Action', 'gutenverse-form')}
                    onRequestClose={() => setOpen(false)}
                    className="gutenverse-form-builder-modal"
                    style={{ width: '800px', maxHeight: 'calc(100% - 60px)' }}
                >
                    <div className="gutenverse-form-modal-content">
                        {loadingData ? (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                {__('Loading...', 'gutenverse-form')}
                            </div>
                        ) : (
                            <FormContent values={values} updateValue={updateValue} isEditor={true} clientId={clientId} />
                        )}
                    </div>
                    <div className="gutenverse-form-modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <div className="gutenverse-button create" onClick={() => submitFormAction()}>
                            {saving ? __('Saving...', 'gutenverse-form') : (isEditing ? __('Update Form', 'gutenverse-form') : __('Create Form', 'gutenverse-form'))}
                        </div>
                        <div className="gutenverse-button cancel" onClick={() => setOpen(false)}>
                            {__('Cancel', 'gutenverse-form')}
                        </div>
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
