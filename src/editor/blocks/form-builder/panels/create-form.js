
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { Modal } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import FormContent from '../../../../backend/form/src/form-content';

export const CreateForm = (props) => {
    // Shim for PopupPro/PopupInsufficientTier
    if (!window['GutenverseDashboard']) {
        window['GutenverseDashboard'] = window['GutenverseConfig'] || {};
    }
    if (!window['GutenverseDashboard'].imgDir) {
        window['GutenverseDashboard'].imgDir = (window['GutenverseConfig'] && window['GutenverseConfig'].gutenverseFormImgDir) ? window['GutenverseConfig'].gutenverseFormImgDir : '';
    }

    const { setAttributes, values: attributes } = props;
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [values, setValues] = useState({
        title: 'Form Action'
    });
    const [saving, setSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    const updateValue = (id, value) => {
        setValues({
            ...values,
            [id]: value
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
        setOpen(true);
    };

    const openEditModal = () => {
        if (!attributes.formId || !attributes.formId.value) return;

        setIsEditing(true);
        setLoadingData(true);
        setOpen(true);

        // Fetch existing form data
        apiFetch({
            path: `/gutenverse-form-client/v1/form-action/${attributes.formId.value}`,
            method: 'GET',
        }).then((response) => {
            if (response) {
                setValues(response);
            }
            setLoadingData(false);
        }).catch((err) => {
            console.error(err); // eslint-disable-line no-console
            setLoadingData(false);
            // Optionally close modal or show error
        });
    };

    const submitFormAction = () => {
        setSaving(true);
        const path = isEditing ? '/gutenverse-form-client/v1/form-action/edit' : '/gutenverse-form-client/v1/form-action/create';

        // Prepare data. For editing we need ID.
        const formData = isEditing ? { ...values, id: attributes.formId.value } : values;

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
                // Determine if we need to update attributes (e.g. title changed)
                // The response might be the ID or an object depending on API.
                // Edit API usually returns ID or boolean.
                // We should assume success if we are here.
                // Update the label if title changed in values
                if (values.title && attributes.formId.label !== values.title) {
                    setAttributes({
                        formId: {
                            label: values.title,
                            value: attributes.formId.value
                        }
                    });
                }
            } else {
                // Create returns ID
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

    const hasSelectedForm = attributes && attributes.formId && attributes.formId.value;

    return (
        <div className="gutenverse-create-form-action" style={{ marginBottom: '20px' }}>
            <div
                className="gutenverse-button create"
                onClick={openCreateModal}
                style={{ display: 'block', textAlign: 'center', width: '100%', boxSizing: 'border-box', marginBottom: '10px' }}
            >
                {__('Create New Form Action', 'gutenverse-form')}
            </div>

            {hasSelectedForm && (
                <div
                    className="gutenverse-button"
                    onClick={openEditModal}
                    style={{ display: 'block', textAlign: 'center', width: '100%', boxSizing: 'border-box', background: '#fff', color: '#333', border: '1px solid #ddd', marginBottom: '10px' }}
                >
                    {__('Edit Selected Form', 'gutenverse-form')}
                </div>
            )}

            <a
                href="edit.php?post_type=gutenverse-form"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', textAlign: 'center', width: '100%', boxSizing: 'border-box', color: '#007cba', textDecoration: 'none', padding: '5px' }}
            >
                {__('View Form Action List', 'gutenverse-form')}
            </a>

            {open && (
                <Modal
                    title={isEditing ? __('Edit Form Action', 'gutenverse-form') : __('Create New Form Action', 'gutenverse-form')}
                    onRequestClose={() => setOpen(false)}
                    className="gutenverse-form-builder-modal"
                    style={{ maxWidth: '800px' }}
                >
                    <div className="gutenverse-form-modal-content">
                        {loadingData ? (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                {__('Loading...', 'gutenverse-form')}
                            </div>
                        ) : (
                            <FormContent values={values} updateValue={updateValue} isEditor={true} clientId={props.clientId} />
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
        </div>
    );
};
