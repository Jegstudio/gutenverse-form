import { __ } from '@wordpress/i18n';
import { useEffect, useState, createPortal } from '@wordpress/element';
import { DrawerWrapper, DrawerBody, DrawerContainer, DrawerFooter, DrawerHeader } from 'gutenverse-core/components';
import { IconCloseSVG } from 'gutenverse-core/icons';
import apiFetch from '@wordpress/api-fetch';
import FormContent from './form-content';
import { applyFilters } from '@wordpress/hooks';
import u from 'umbrellajs';

const CreateForm = () => {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState({
        title: 'Form Action'
    });
    const [saving, setSaving] = useState(false);

    const updateValue = (id, value) => {
        setValues({
            ...values,
            [id]: value
        });
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
        setSaving(true);
        apiFetch({
            path: 'gutenverse-form-client/v1/form-action/create',
            method: 'POST',
            data: {
                form: values,
            }
        }).then(() => {
            setSaving(false);
            location.reload();
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
                        {__('Create Form Action', 'gutenverse')}
                    </h3>
                    <div className="gutenverse-close" onClick={() => closeDrawer()}>
                        <IconCloseSVG size={20} />
                    </div>
                </>
            </DrawerHeader>
            <DrawerBody>
                <FormContent values={values} updateValue={updateValue} />
            </DrawerBody>
            <DrawerFooter>
                <>
                    <div className="gutenverse-button create" onClick={() => submitFormAction()}>
                        {saving ? __('Saving...', 'gutenverse') : __('Create Form', 'gutenverse')}
                    </div>
                    <div className="gutenverse-button cancel" onClick={() => closeDrawer()}>
                        {__('Cancel', 'gutenverse')}
                        </div>
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