import { __ } from '@wordpress/i18n';
import { ColorControl, DimensionControl, RangeControl, TypographyControl } from 'gutenverse-core/controls';
import { handleColor, handleTypography, handleDimension } from 'gutenverse-core/styling';

export const labelPanel = props => {
    const {
        elementId
    } = props;

    return [
        {
            id: 'labelWidth',
            label: __('Label Width', 'gutenverse-form'),
            component: RangeControl,
            min: 1,
            max: 100,
            step: 1,
            allowDeviceControl: true,
            unit: '%',
            style: [
                {
                    selector: `.${elementId} .label-wrapper`,
                    render: value => `width: ${value}%;`
                }
            ]
        },
        {
            id: 'labelColor',
            label: __('Label Color', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .label-wrapper .input-label`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'labelTypography',
            label: __('Title Typography', 'gutenverse-form'),
            component: TypographyControl,
            style: [
                {
                    selector: `.${elementId} .label-wrapper .input-label`,
                    hasChild: true,
                    render: (value, id) => handleTypography(value, props, id)
                }
            ],
        },
        {
            id: 'labelPadding',
            label: __('Label Padding', 'gutenverse-form'),
            component: DimensionControl,
            position: ['top', 'right', 'bottom', 'left'],
            allowDeviceControl: true,
            units: {
                px: {
                    text: 'px',
                    unit: 'px'
                },
                em: {
                    text: 'em',
                    unit: 'em'
                },
                percent: {
                    text: '%',
                    unit: '%'
                },
            },
            style: [
                {
                    selector: `.${elementId} .label-wrapper`,
                    render: value => handleDimension(value, 'padding')
                }
            ]
        },
        {
            id: 'labelMargin',
            label: __('Label Margin', 'gutenverse-form'),
            component: DimensionControl,
            position: ['top', 'right', 'bottom', 'left'],
            allowDeviceControl: true,
            units: {
                px: {
                    text: 'px',
                    unit: 'px'
                },
                em: {
                    text: 'em',
                    unit: 'em'
                },
                percent: {
                    text: '%',
                    unit: '%'
                },
            },
            style: [
                {
                    selector: `.${elementId} .label-wrapper`,
                    render: value => handleDimension(value, 'margin')
                }
            ]
        },
        {
            id: 'labelRequireColor',
            label: __('Require Indicator Color', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .label-wrapper .required-badge`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
    ];
};