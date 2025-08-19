import { __ } from '@wordpress/i18n';
import { addQueryArgs, apiFetch } from 'gutenverse-core-frontend';
import { CheckboxControl, NumberControl, RangeControl, SelectSearchControl, TextControl } from 'gutenverse-core/controls';
import { isOnEditor } from 'gutenverse-core/helper';

export const panelRules = () => {
    const searchExtention = isOnEditor() ? input => {
        return new Promise(resolve => {
            apiFetch({
                path: addQueryArgs('/gutenverse-form-client/v1/form/get-allowed-mimes', {
                    search: input,
                }),
            }).then(data => {
                const promiseOptions = data.map(item => {
                    return {
                        label: item,
                        value: item
                    };
                });

                resolve(promiseOptions);
            }).catch(() => {
                resolve([]);
            });
        });
    } : () => {
        return {
            label: '',
            value: ''
        };
    }
    return [
        {
            id: 'required',
            label: __('Required', 'gutenverse-form'),
            component: CheckboxControl,
            description: __('Check this option to make user required to fill this input', 'gutenverse-form'),
        },
        {
            id: 'validationWarning',
            label: __('Warning Message', 'gutenverse-form'),
            description: __('Validation message if the required input is incorrect', 'gutenverse-form'),
            component: TextControl,
        },
        {
            id: 'sizeLimit',
            label: __('File Size Limit', 'gutenverse-form'),
            component: RangeControl,
            unit: 'KB',
            min: 100,
            max: 10000,
            step: 1,
            isParseFloat: true,
        },
        {
            id: 'allowedExtention',
            label: __('Allowed File Extention', 'gutenverse-form'),
            component: SelectSearchControl,
            isMulti: true,
            onSearch: searchExtention
        }
    ];
};