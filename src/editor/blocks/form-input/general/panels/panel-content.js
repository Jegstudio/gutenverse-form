import { __ } from '@wordpress/i18n';
import { CheckboxControl, SelectControl, TextControl } from 'gutenverse-core/controls';

export const contentPanel = props => {
    const {
        showLabel,
        excludePlaceholder = false
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
            id: 'excludePlaceholder',
            show: excludePlaceholder,
            label: __('Exclude Placeholder', 'gutenverse-form'),
            description: __('Prevent the placeholder from appearing in the dropdown list of select options.', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'inputName',
            label: __('Input ID', 'gutenverse-form'),
            description: __('This will be identifier used in your entries, make sure the name is unique.', 'gutenverse-form'),
            component: TextControl,
        },
    ];
};