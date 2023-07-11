import { __ } from '@wordpress/i18n';
import { RepeaterControl, TextControl } from 'gutenverse-core/controls';

export const radioContentPanel = () => {
    return [
        {
            id: 'radioOptions',
            label: __('Radio Options', 'gutenverse'),
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
            ],
        },
    ];
};