import { __ } from '@wordpress/i18n';
import { CheckboxControl, RepeaterControl, TextControl } from 'gutenverse-core/controls';

export const selectContentPanel = () => {
    return [
        {
            id: 'selectOptions',
            label: __('Select Options', 'gutenverse'),
            component: RepeaterControl,
            titleFormat: '<strong><%= value.label%></strong>',
            options: [
                {
                    id: 'label',
                    label: __('Label', 'gutenverse'),
                    component: TextControl,
                },
                {
                    id: 'value',
                    label: __('Value', 'gutenverse'),
                    component: TextControl,
                },
                {
                    id: 'selected',
                    label: __('Selected', 'gutenverse'),
                    component: CheckboxControl,
                },
                {
                    id: 'disabled',
                    label: __('Disabled', 'gutenverse'),
                    component: CheckboxControl,
                },
            ],
        },
    ];
};