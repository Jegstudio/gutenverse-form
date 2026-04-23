import { __ } from '@wordpress/i18n';
import { CheckboxControl, TextControl } from 'gutenverse-core/controls';

export const formPanel = () => {
    return [
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
