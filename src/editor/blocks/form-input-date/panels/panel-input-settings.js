import { __ } from '@wordpress/i18n';
import { CheckboxControl, DateControl, TextControl } from 'gutenverse-core/controls';

export const panelInputSettings = () => {
    return [
        {
            id: 'required',
            label: __('Required', 'gutenverse'),
            description: __('Check this option to make user required to fill this input', 'gutenverse'),
            component: CheckboxControl,
        },
        {
            id: 'dateRange',
            label: __('Date Range', 'gutenverse'),
            component: CheckboxControl,
        },
        {
            id: 'dateFormat',
            label: __('Date Format', 'gutenverse'),
            component: TextControl,
        },
        {
            id: 'dateStart',
            label: __('Set Minimum date', 'gutenverse'),
            component: DateControl,
        },
        {
            id: 'dateEnd',
            label: __('Set Maximum date', 'gutenverse'),
            component: DateControl,
        },
    ];
};