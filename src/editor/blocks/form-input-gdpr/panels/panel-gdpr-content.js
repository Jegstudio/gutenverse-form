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
            label: __('GDPR Checked Value', 'gutenverse-form'),
            description: __('Value sent to Form Action and integrations when the checkbox is checked', 'gutenverse-form'),
            component: TextControl,
        },
        {
            id: 'gdprUncheckedFormValue',
            label: __('GDPR Unchecked Value', 'gutenverse-form'),
            description: __('Value sent to Form Action and integrations when the checkbox is unchecked', 'gutenverse-form'),
            component: TextControl,
        },
    ];
};
