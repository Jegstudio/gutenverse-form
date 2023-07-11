import { __ } from '@wordpress/i18n';
import { CheckboxControl, TextControl } from 'gutenverse-core/controls';

export const panelRules = () => {
    return [
        {
            id: 'required',
            label: __('Required', 'gutenverse'),
            component: CheckboxControl,
            description: __('Check this option to make user required to fill this input', 'gutenverse'),
        },
        {
            id: 'validationWarning',
            label: __('Warning Message', 'gutenverse'),
            description: __('Validation message if the required input is incorrect', 'gutenverse'),
            component: TextControl,
        },
    ];
};