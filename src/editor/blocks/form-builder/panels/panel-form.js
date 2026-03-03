import { __ } from '@wordpress/i18n';
import { CheckboxControl, TextControl } from 'gutenverse-core/controls';
import { CreateForm } from './create-form';

export const formPanel = () => {
    return [
        {
            id: 'createForm',
            component: CreateForm,
        },
        {
            id: 'hideAfterSubmit',
            label: __('Hide After Submit', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'redirectTo',
            label: __('Redirect To', 'gutenverse-form'),
            component: TextControl,
        },
    ];
};