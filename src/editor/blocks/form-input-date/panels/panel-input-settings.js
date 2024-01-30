import { __ } from '@wordpress/i18n';
import { CheckboxControl, DateControl, TextControl } from 'gutenverse-core/controls';

export const panelInputSettings = () => {
    return [
        {
            id: 'required',
            label: __('Required', 'gutenverse-form'),
            description: __('Check this option to make user required to fill this input', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'dateRange',
            label: __('Date Range', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'dateFormat',
            label: __('Date Format', 'gutenverse-form'),
            component: TextControl,
        },
        {
            id: 'dateStart',
            label: __('Set Minimum date', 'gutenverse-form'),
            component: DateControl,
        },
        {
            id: 'dateEnd',
            label: __('Set Maximum date', 'gutenverse-form'),
            component: DateControl,
        },
    ];
};