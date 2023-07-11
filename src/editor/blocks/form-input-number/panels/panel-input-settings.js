import { __ } from '@wordpress/i18n';
import { NumberControl } from 'gutenverse-core/controls';

export const panelInputSettings = () => {
    return [
        {
            id: 'inputMin',
            label: __('Min Number', 'gutenverse'),
            component: NumberControl,
        },
        {
            id: 'inputMax',
            label: __('Max Number', 'gutenverse'),
            component: NumberControl,
        },
        {
            id: 'inputStep',
            label: __('Number Step', 'gutenverse'),
            component: NumberControl,
        },
    ];
};