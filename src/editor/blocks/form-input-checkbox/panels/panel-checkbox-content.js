import { __ } from '@wordpress/i18n';
import { CheckboxControl, RepeaterControl, TextControl } from 'gutenverse-core/controls';

export const checkboxContentPanel = () => {
    return [
        {
            id: 'checkboxOptions',
            label: __('Checkbox Options', 'gutenverse-form'),
            component: RepeaterControl,
            titleFormat: '<strong><%= value.label%></strong>',
            options: [
                {
                    id: 'label',
                    label: __('Label', 'gutenverse-form'),
                    component: TextControl,
                },
                {
                    id: 'value',
                    label: __('Value', 'gutenverse-form'),
                    component: TextControl,
                },
                {
                    id: 'selected',
                    label: __('Selected', 'gutenverse-form'),
                    component: CheckboxControl,
                },
            ],
        },
    ];
};