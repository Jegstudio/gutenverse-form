import { __ } from '@wordpress/i18n';
import { CheckboxControl, TextControl } from 'gutenverse-core/controls';

export const panelRules = () => {
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
    ];
};