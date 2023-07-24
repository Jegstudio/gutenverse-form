import { __ } from '@wordpress/i18n';
import { ColorControl, DimensionControl } from 'gutenverse-core/controls';
import { handleColor, handleDimension } from 'gutenverse-core/styling';

export const selectedPanel = props => {
    const {
        elementId,
    } = props;

    return [
        {
            id: 'selectedColor',
            label: __('Selected Text Color', 'gutenverse'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .choices .choices__list--multiple .choices__item.choices__item--selectable`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'selectedBgColor',
            label: __('Selected Background Color', 'gutenverse'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .choices .choices__list--multiple .choices__item.choices__item--selectable`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'selectedBorderColor',
            label: __('Selected Border Color', 'gutenverse'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .choices .choices__list--multiple .choices__item.choices__item--selectable`,
                    render: value => handleColor(value, 'border-color')
                },
                {
                    selector: `.${elementId} .choices .choices__list--multiple .choices__button`,
                    render: value => handleColor(value, 'border-left-color')
                }
            ]
        },
        {
            id: 'selectedRadius',
            label: __('Selected Border Radius', 'gutenverse'),
            component: DimensionControl,
            allowDeviceControl: true,
            position: ['top', 'right', 'bottom', 'left'],
            units: {
                px: {
                    text: 'px',
                    unit: 'px'
                },
                em: {
                    text: 'em',
                    unit: 'em'
                },
                ['%']: {
                    text: '%',
                    unit: '%'
                },
            },
            style: [
                {
                    selector: `.${elementId} .choices .choices__list--multiple .choices__item.choices__item--selectable`,
                    render: value => handleDimension(value, 'border-radius', false)
                }
            ]
        },
    ];
};