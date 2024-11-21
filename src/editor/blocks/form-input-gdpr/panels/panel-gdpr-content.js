import { __ } from '@wordpress/i18n';
import { CheckboxControl, TextControl } from 'gutenverse-core/controls';

export const gdprContentPanel = () => {
    return [
        {
            id: 'gdprLabel',
            label: __('GDPR Label', 'gutenverse-form'),
            component: TextControl,
        },
        {
            id: 'gdprValue',
            label: __('GDPR Default Value', 'gutenverse-form'),
            description: __('Will not show on editor, only in frontend', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'gdprFormValue',
            label: __('GDPR Form Value', 'gutenverse-form'),
            description: __('Value that will be recorded in Form Action', 'gutenverse-form'),
            component: TextControl,
        },
    ];
};