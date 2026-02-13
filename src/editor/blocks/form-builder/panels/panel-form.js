import { __ } from '@wordpress/i18n';
import { CheckboxControl, SelectSearchControl, TextControl } from 'gutenverse-core/controls';
import apiFetch from '@wordpress/api-fetch';
import { CreateForm } from './create-form';

export const formPanel = () => {
    const searchForms = input => new Promise(resolve => {
        apiFetch({
            path: '/gutenverse-form-client/v1/form/search',
            method: 'POST',
            data: {
                search: input
            }
        }).then(data => {
            const promiseOptions = data.map(item => {
                return {
                    label: item.label,
                    value: item.value
                };
            });

            resolve(promiseOptions);
        }).catch(() => {
            resolve([]);
        });
    });

    return [
        {
            id: 'formId',
            label: __('Choose Form Action', 'gutenverse-form'),
            component: SelectSearchControl,
            onSearch: searchForms
        },
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