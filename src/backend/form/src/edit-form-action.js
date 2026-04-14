import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { createPortal } from '@wordpress/element';
import { DrawerWrapper, DrawerBody, DrawerContainer, DrawerFooter, DrawerHeader, FormActionSkeleton } from 'gutenverse-core/components';
import { IconCloseSVG } from 'gutenverse-core/icons';
import apiFetch from '@wordpress/api-fetch';
import FormContent from './form-content';
import { u } from 'gutenverse-core/components';

const EditForm = () => {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [postId, setPostId] = useState(null);
    const [error, setError] = useState('');

    const updateValue = (id, value) => {
        setValues((prevValues) => ({
            ...prevValues,
            [id]: value
        }));
    };

    useEffect(() => {
        u('.type-gutenverse-form .edit a, .type-gutenverse-form .row-title').on('click', function (e) {
            e.preventDefault();
            const id = u(e.target).closest('.type-gutenverse-form').attr('id');
            setOpen(true);
            setPostId(id.replace('post-', ''));
        });
    }, []);

    useEffect(() => {
        setLoading(true);

        if (null !== postId) {
            apiFetch({
                path: `gutenverse-form-client/v1/form-action/${postId}`,
                method: 'GET',
            }).then(response => {
                setValues(response);
                setLoading(false);
                setError('');
            }).catch(err => {
                setError(err?.message || __('Could not load the form action. Please try again.', 'gutenverse-form'));
                setLoading(false);
            });
        }
    }, [postId]);

    const submitFormAction = () => {
        if (saving) {
            return;
        }

        if (!values.title || !values.title.trim()) {
            setError(__('Please enter a form action title before saving.', 'gutenverse-form'));
            return;
        }

        setSaving(true);
        setError('');
        apiFetch({
            path: 'gutenverse-form-client/v1/form-action/edit',
            method: 'POST',
            data: {
                form: {
                    ...values,
                    id: postId
                },
            }
        }).then(() => {
            setSaving(false);
            location.reload();
        }).catch(err => {
            setError(err?.message || __('Could not save the form action. Please try again.', 'gutenverse-form'));
            setSaving(false);
        });
    };

    return <DrawerWrapper {...{
        setOpen,
        open,
    }}>
        {({ closeDrawer }) => {
            return <DrawerContainer>
                <DrawerHeader>
                    <>
                        <h3>
                            {__('Edit Form Action', 'gutenverse-form')}
                        </h3>
                        <div className="gutenverse-close" onClick={() => closeDrawer()}>
                            <IconCloseSVG size={20} />
                        </div>
                    </>
                </DrawerHeader>
                <DrawerBody>
                    {error && <div className="gutenverse-form-save-error">{error}</div>}
                    {loading ? <FormActionSkeleton /> : <FormContent values={values} updateValue={updateValue} />}
                </DrawerBody>
                {!loading && <DrawerFooter>
                    <>
                        <button
                            type="button"
                            className={`gutenverse-button create ${saving ? 'disabled' : ''}`}
                            onClick={() => submitFormAction()}
                            disabled={saving}
                        >
                            {saving ? __('Saving...', 'gutenverse-form') : __('Edit Form', 'gutenverse-form')}
                        </button>
                        <button
                            type="button"
                            className="gutenverse-button cancel"
                            onClick={() => closeDrawer()}
                            disabled={saving}
                        >
                            {__('Cancel', 'gutenverse-form')}
                        </button>
                    </>
                </DrawerFooter>}
            </DrawerContainer>;
        }}
    </DrawerWrapper>;
};

const EditFormAction = (props) => {
    const body = document.getElementsByTagName('body')[0];
    const element = <EditForm {...props} />;
    return createPortal(element, body);
};


export default EditFormAction;
