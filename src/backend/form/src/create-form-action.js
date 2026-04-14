import { __ } from '@wordpress/i18n';
import { useEffect, useState, createPortal } from '@wordpress/element';
import { DrawerWrapper, DrawerBody, DrawerContainer, DrawerFooter, DrawerHeader } from 'gutenverse-core/components';
import { IconCloseSVG } from 'gutenverse-core/icons';
import apiFetch from '@wordpress/api-fetch';
import FormContent from './form-content';
import { applyFilters } from '@wordpress/hooks';
import { u } from 'gutenverse-core/components';

const CreateForm = () => {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState({
        title: 'Form Action'
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const updateValue = (id, value) => {
        setValues((prevValues) => ({
            ...prevValues,
            [id]: value
        }));
    };

    useEffect(() => {
        u('.page-title-action').on('click', e => {
            e.preventDefault();
            setOpen(data => !data);
        });

        const data = applyFilters(
            'gutenverse.form.tab.firstLoad',
            {},
            null
        );

        setValues({
            ...values,
            ...data
        });
    }, []);

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
            path: 'gutenverse-form-client/v1/form-action/create',
            method: 'POST',
            data: {
                form: values,
            }
        }).then(() => {
            setSaving(false);
            location.reload();
        }).catch(err => {
            setError(err?.message || __('Could not create the form action. Please try again.', 'gutenverse-form'));
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
                            {__('Create Form Action', 'gutenverse-form')}
                        </h3>
                        <div className="gutenverse-close" onClick={() => closeDrawer()}>
                            <IconCloseSVG size={20} />
                        </div>
                    </>
                </DrawerHeader>
                <DrawerBody>
                    {error && <div className="gutenverse-form-save-error">{error}</div>}
                    <FormContent values={values} updateValue={updateValue} />
                </DrawerBody>
                <DrawerFooter>
                    <>
                        <button
                            type="button"
                            className={`gutenverse-button create ${saving ? 'disabled' : ''}`}
                            onClick={() => submitFormAction()}
                            disabled={saving}
                        >
                            {saving ? __('Saving...', 'gutenverse-form') : __('Create Form', 'gutenverse-form')}
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
                </DrawerFooter>
            </DrawerContainer>;
        }}
    </DrawerWrapper>;
};

const CreateFormAction = (props) => {
    const body = document.getElementsByTagName('body')[0];
    const element = <CreateForm {...props} />;
    return createPortal(element, body);
};

export default CreateFormAction;
