import { __ } from '@wordpress/i18n';
import { ColorControl, DimensionControl, TypographyControl } from 'gutenverse-core/controls';
import { handleColor, handleTypography, handleDimension } from 'gutenverse-core/controls';

export const mainPanel = props => {
    const {
        elementId
    } = props;

    return [
        {
            id: 'helperColor',
            label: __('Helper Color', 'gutenverse'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .input-helper`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'helperTypography',
            label: __('Helper Typography', 'gutenverse'),
            component: TypographyControl,
            style: [
                {
                    selector: `.${elementId} .input-helper`,
                    hasChild: true,
                    render: (value,id) => handleTypography(value, props, id)
                }
            ],
        },
        {
            id: 'helperPadding',
            label: __('Helper Padding', 'gutenverse'),
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
                    selector: `.${elementId} .input-helper`,
                    render: value => handleDimension(value, 'padding')
                }
            ]
        },
        {
            id: 'warningColor',
            label: __('Warning Color', 'gutenverse'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .validation-error`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'warningTypography',
            label: __('Warning Typography', 'gutenverse'),
            component: TypographyControl,
            style: [
                {
                    selector: `.${elementId} .validation-error`,
                    hasChild: true,
                    render: (value,id) => handleTypography(value, props, id)
                }
            ],
        },
    ];
};