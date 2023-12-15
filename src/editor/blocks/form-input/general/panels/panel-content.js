import { __ } from '@wordpress/i18n';
import { CheckboxControl, SelectControl, TextControl } from 'gutenverse-core/controls';

export const contentPanel = props => {
    const {
        showLabel
    } = props;

    return [
        {
            id: 'showLabel',
            label: __('Show Label', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'position',
            show: showLabel,
            label: __('Label Position', 'gutenverse-form'),
            component: SelectControl,
            options: [
                {
                    label: __('Top'),
                    value: 'top'
                },
                {
                    label: __('Left'),
                    value: 'left'
                },
            ],
        },
        {
            id: 'showHelper',
            label: __('Show Helper', 'gutenverse-form'),
            description: __('Display helper texts below the input field', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'inputPlaceholder',
            label: __('Input Placeholder', 'gutenverse-form'),
            component: TextControl,
        },
        {
            id: 'inputName',
            label: __('Input ID', 'gutenverse-form'),
            description: __('This will be identifier used in your entries, make sure the name is unique.', 'gutenverse-form'),
            component: TextControl,
        },
    ];
};