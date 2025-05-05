import { __ } from '@wordpress/i18n';
import { ColorControl, DimensionControl, TypographyControl } from 'gutenverse-core/controls';

export const mainPanel = props => {
    const {
        elementId
    } = props;

    return [
        {
            id: 'helperColor',
            label: __('Helper Color', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'helperColor',
                    'selector': `.${elementId} .input-helper`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                    'responsive': true,
                }
            ]
        },
        {
            id: 'helperTypography',
            label: __('Helper Typography', 'gutenverse-form'),
            component: TypographyControl,
        },
        {
            id: 'helperPadding',
            label: __('Helper Padding', 'gutenverse-form'),
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
        },
        {
            id: 'warningColor',
            label: __('Warning Color', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'helperColor',
                    'selector': `.${elementId} .validation-error`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                    'responsive': true,
                }
            ]
        },
        {
            id: 'warningTypography',
            label: __('Warning Typography', 'gutenverse-form'),
            component: TypographyControl,
        },
    ];
};