import { __ } from '@wordpress/i18n';
import { CheckboxControl, SelectControl, TextControl } from 'gutenverse-core/controls';

export const contentPanel = props => {
    const {
        showLabel
    } = props;

    return [
        {
            id: 'showLabel',
            label: __('Show Label', 'gutenverse'),
            component: CheckboxControl,
        },
        {
            id: 'position',
            show: showLabel,
            label: __('Label Position', 'gutenverse'),
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
            label: __('Show Helper', 'gutenverse'),
            description: __('Display helper texts below the input field', 'gutenverse'),
            component: CheckboxControl,
        },
        {
            id: 'inputPlaceholder',
            label: __('Input Placeholder', 'gutenverse'),
            component: TextControl,
        },
        {
            id: 'inputName',
            label: __('Input ID', 'gutenverse'),
            description: __('This will be identifier used in your entries, make sure the name is unique.', 'gutenverse'),
            component: TextControl,
        },
    ];
};