import { __ } from '@wordpress/i18n';
import { BackgroundControl, BorderResponsiveControl, BoxShadowControl, CheckboxControl, ColorControl, DimensionControl, IconControl, RangeControl, SelectControl, SizeControl, SwitchControl, TypographyControl } from 'gutenverse-core/controls';

export const buttonStylePanel = (props) => {
    const {
        elementId,
        showIcon,
        setSwitcher,
        switcher,
    } = props;

    return [
        {
            id: 'buttonTypography',
            label: __('Button Text Typography', 'gutenverse-form'),
            component: TypographyControl,
        },
        {
            id: 'placeholderTypography',
            label: __('Placeholder Typography', 'gutenverse-form'),
            component: TypographyControl,
        },
        {
            id: 'showIcon',
            label: __('Show Icon', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'icon',
            label: __('Icon', 'gutenverse'),
            show: showIcon,
            component: IconControl,
        },
        {
            id: 'iconPosition',
            label: __('Icon Position'),
            show: showIcon,
            component: SelectControl,
            options: [
                {
                    label: __('Before', 'gutenverse-form'),
                    value: 'before'
                },
                {
                    label: __('After', 'gutenverse-form'),
                    value: 'after'
                },
            ],
        },
        {
            id: 'iconSpacing',
            label: __('Icon Spacing', 'gutenverse-form'),
            show: showIcon,
            component: RangeControl,
            allowDeviceControl: true,
            unit: 'px',
            min: 0,
            max: 50,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'iconSpacing',
                    'responsive': true,
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-button`,
                    'properties': [
                        {
                            'name': 'gap',
                            'valueType': 'pattern',
                            'pattern': '{value}px',
                            'patternValues': {
                                'value': {
                                    'type': 'direct',
                                },
                            }
                        }
                    ],
                }
            ]
        },
        {
            id: 'iconSize',
            label: __('Icon Size', 'gutenverse-form'),
            component: SizeControl,
            allowDeviceControl: true,
            show: showIcon,
            units: {
                px: {
                    text: 'px',
                    min: 1,
                    max: 100,
                    step: 1
                },
                em: {
                    text: 'em',
                    min: 0.1,
                    max: 3,
                    step: 0.1
                },
            },
            liveStyle: [
                {
                    'type': 'unitPoint',
                    'id': 'iconSize',
                    'properties': [
                        {
                            'name': 'font-size',
                            'valueType': 'direct'
                        }
                    ],
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-button i`,
                    'responsive': true
                }
            ]
        },
        {
            id: 'paddingButton',
            label: __('Button Padding', 'gutenverse-form'),
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
                rem: {
                    text: 'rem',
                    unit: 'rem'
                },
            },
        },
        {
            id: 'placeholderColor',
            label: __('Placeholder Color', 'gutenverse-form'),
            component: ColorControl,
            show: switcher.buttonHover === 'normal' || !switcher.buttonHover,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'placeholderColor',
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-placeholder`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: '__buttonHover',
            component: SwitchControl,
            options: [
                {
                    value: 'normal',
                    label: 'Normal'
                },
                {
                    value: 'hover',
                    label: 'Hover'
                }
            ],
            onChange: ({ __buttonHover }) => setSwitcher({ ...switcher, buttonHover: __buttonHover })
        },
        {
            id: 'buttonTextColor',
            label: __('Button Text Color', 'gutenverse-form'),
            component: ColorControl,
            show: switcher.buttonHover === 'normal' || !switcher.buttonHover,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'buttonTextColor',
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-button`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'buttonTextColorHover',
            label: __('Button Text Color', 'gutenverse-form'),
            component: ColorControl,
            show: switcher.buttonHover === 'hover',
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'buttonTextColorHover',
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-button:hover`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'iconColor',
            label: __('Icon Color', 'gutenverse-form'),
            component: ColorControl,
            show: switcher.buttonHover === 'normal' || !switcher.buttonHover,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'iconColor',
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-button i`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'iconColorHover',
            label: __('Icon Color', 'gutenverse-form'),
            component: ColorControl,
            show: switcher.buttonHover === 'hover',
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'iconColorHover',
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-button:hover i`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'backgroundButton',
            component: BackgroundControl,
            allowDeviceControl: true,
            options: ['default', 'gradient'],
            show: (switcher.buttonHover === 'normal' || !switcher.buttonHover),
            liveStyle: [
                {
                    'type': 'background',
                    'id': 'backgroundButton',
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-button`,
                }
            ]
        },
        {
            id: 'backgroundButtonHover',
            component: BackgroundControl,
            allowDeviceControl: true,
            options: ['default', 'gradient'],
            show: switcher.buttonHover === 'hover',
            liveStyle: [
                {
                    'type': 'background',
                    'id': 'backgroundButtonHover',
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-button:hover`,
                }
            ]
        },
        {
            id: 'borderButton',
            show: (switcher.buttonHover === 'normal' || !switcher.buttonHover),
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'borderResponsive',
                    'id': 'borderButton',
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-button`,
                }
            ]
        },
        {
            id: 'borderButtonHover',
            show: switcher.buttonHover === 'hover',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'borderResponsive',
                    'id': 'borderButtonHover',
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-button:hover`,
                }
            ]
        },
        {
            id: 'boxShadowButton',
            show: (switcher.buttonHover === 'normal' || !switcher.buttonHover),
            component: BoxShadowControl,
            label: __('Box Shadow', 'gutenverse-form'),
            liveStyle: [
                {
                    'type': 'boxShadow',
                    'id': 'boxShadowButton',
                    'properties': [
                        {
                            'name': 'box-shadow',
                            'valueType': 'direct'
                        }
                    ],
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-button`,
                }
            ]
        },
        {
            id: 'boxShadowButtonHover',
            show: switcher.buttonHover === 'hover',
            label: __('Box Shadow Hover', 'gutenverse-form'),
            component: BoxShadowControl,
            liveStyle: [
                {
                    'type': 'boxShadow',
                    'id': 'boxShadowButtonHover',
                    'properties': [
                        {
                            'name': 'box-shadow',
                            'valueType': 'direct'
                        }
                    ],
                    'selector': `.${elementId}.guten-form-input-file .file-input-wrapper .input-wrapper .file-button:hover`,
                }
            ]
        },
    ];
};