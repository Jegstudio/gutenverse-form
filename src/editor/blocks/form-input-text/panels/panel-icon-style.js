import { __ } from '@wordpress/i18n';
import { BackgroundControl, BorderResponsiveControl, BoxShadowControl, ColorControl, DimensionControl, RangeControl, SelectControl, SwitchControl } from 'gutenverse-core/controls';

export const panelIconStyle = (props) => {
    const {
        elementId,
        switcher,
        setSwitcher,
        iconStyleMode,
        iconType
    } = props;

    return [
        {
            id: 'iconPadding',
            label: __('Padding', 'gutenverse-form'),
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
            id: 'iconMargin',
            label: __('Margin', 'gutenverse-form'),
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
            id: 'iconRotate',
            label: __('Icon Rotate', 'gutenverse-form'),
            component: RangeControl,
            allowDeviceControl: true,
            min: 1,
            max: 360,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'iconRotate',
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon`,
                    'properties': [
                        {
                            'name': 'transform',
                            'valueType': 'pattern',
                            'pattern': 'rotate({value}deg)',
                            'patternValues': {
                                'value': {
                                    'type': 'direct',
                                },

                            }
                        }
                    ],
                    'responsive': true,
                }
            ]
        },
        {
            id: 'iconStyleMode',
            label: __('Color Mode', 'gutenverse-form'),
            component: SelectControl,
            options: [
                {
                    value: 'color',
                    label: 'Color'
                },
                {
                    value: 'gradient',
                    label: 'Gradient'
                }
            ],
        },
        {
            id: '__iconHover',
            component: SwitchControl,
            options: [
                {
                    value: 'normal',
                    label: 'Normal'
                },
                {
                    value: 'hover',
                    label: 'Hover'
                },
                {
                    value: 'focus',
                    label: 'Focus'
                }
            ],
            onChange: ({ __iconHover }) => setSwitcher({ ...switcher, icon: __iconHover })
        },
        {
            id: 'iconColor',
            show: (!switcher.icon || switcher.icon === 'normal') && (!iconStyleMode || iconStyleMode === 'color'),
            label: __('Normal Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'iconColor',
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon i`,
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
            id: 'iconBgColor',
            show: (!switcher.icon || switcher.icon === 'normal') && (!iconStyleMode || iconStyleMode === 'color'),
            label: __('Normal Background Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'iconBgColor',
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon`,
                    'properties': [
                        {
                            'name': 'background-color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'iconColorGradient',
            show: (!switcher.icon || switcher.icon === 'normal') && iconStyleMode === 'gradient' && iconType === 'icon',
            type: __('Icon Color Gradient', 'gutenverse-form'),
            component: BackgroundControl,
            options: ['gradient'],
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'iconColorGradient',
                    'properties': [
                        {
                            'name': 'background-image',
                            'valueType': 'function',
                            'functionName' : 'customHandleBackground'
                        }
                    ],
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon.style-gradient i`,
                }
            ],
        },
        {
            id: 'iconBackground',
            show: (!switcher.icon || switcher.icon === 'normal') && iconStyleMode === 'gradient',
            type: __('Icon Background Gradient', 'gutenverse-form'),
            component: BackgroundControl,
            options: ['gradient'],
            liveStyle: [
                {
                    'type': 'background',
                    'id': 'iconBackground',
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon.style-gradient`,
                }
            ]
        },
        {
            id: 'iconBorder',
            show: (!switcher.icon || switcher.icon === 'normal'),
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
        },
        {
            id: 'iconBoxShadow',
            show: !switcher.icon || switcher.icon === 'normal',
            label: __('Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
        },
        {
            id: 'iconHoverColor',
            show: switcher.icon === 'hover' && (!iconStyleMode || iconStyleMode === 'color'),
            label: __('Hover Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'iconHoverColor',
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-text-icon .icon i`,
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
            id: 'iconHoverBgColor',
            show: switcher.icon === 'hover' && (!iconStyleMode || iconStyleMode === 'color'),
            label: __('Hover Background Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'iconHoverBgColor',
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-text-icon .icon`,
                    'properties': [
                        {
                            'name': 'background-color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'iconColorGradientHover',
            show: switcher.icon === 'hover' && iconStyleMode === 'gradient' && iconType === 'icon',
            type: __('Icon Color Gradient', 'gutenverse-form'),
            component: BackgroundControl,
            options: ['gradient'],
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'iconColorGradientHover',
                    'properties': [
                        {
                            'name': 'background-image',
                            'valueType': 'function',
                            'functionName' : 'customHandleBackground'
                        }
                    ],
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-text-icon .icon.style-gradient i`,
                }
            ],
        },
        {
            id: 'iconBackgroundHover',
            show: switcher.icon === 'hover' && iconStyleMode === 'gradient',
            component: BackgroundControl,
            type: __('Icon Background Gradient', 'gutenverse-form'),
            options: ['gradient'],
            liveStyle: [
                {
                    'type': 'background',
                    'id': 'iconBackgroundHover',
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-text-icon .icon.style-gradient`,
                }
            ]
        },
        {
            id: 'iconBorderHover',
            show: switcher.icon === 'hover',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
        },
        {
            id: 'iconBoxShadowHover',
            show: switcher.icon === 'hover',
            label: __('Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
            liveStyle: [
                {
                    'type': 'boxShadow',
                    'id': 'iconBoxShadowHover',
                    'properties': [
                        {
                            'name': 'box-shadow',
                            'valueType': 'direct'
                        }
                    ],
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-text-icon .icon`,
                }
            ]
        },
        {
            id: 'iconFocusColor',
            show: switcher.icon === 'focus' && (!iconStyleMode || iconStyleMode === 'color'),
            label: __('Focus Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'iconFocusColor',
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-text-icon .icon i`,
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
            id: 'iconFocusBgColor',
            show: switcher.icon === 'focus' && (!iconStyleMode || iconStyleMode === 'color'),
            label: __('Focus Background Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'iconFocusBgColor',
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-text-icon .icon`,
                    'properties': [
                        {
                            'name': 'background-color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'iconColorGradientFocus',
            show: switcher.icon === 'focus' && iconStyleMode === 'gradient' && iconType === 'icon',
            type: __('Icon Color Gradient', 'gutenverse-form'),
            component: BackgroundControl,
            options: ['gradient'],
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'iconColorGradientFocus',
                    'properties': [
                        {
                            'name': 'background-image',
                            'valueType': 'function',
                            'functionName' : 'customHandleBackground'
                        }
                    ],
                    'selector': `${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-text-icon .icon.style-gradient i`,
                }
            ],
        },
        {
            id: 'iconBackgroundFocus',
            show: switcher.icon === 'focus' && iconStyleMode === 'gradient',
            component: BackgroundControl,
            type: __('Icon Background Gradient', 'gutenverse-form'),
            options: ['gradient'],
            liveStyle: [
                {
                    'type': 'background',
                    'id': 'iconBackgroundFocus',
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-text-icon .icon.style-gradient`,
                }
            ]
        },
        {
            id: 'iconBorderFocus',
            show: switcher.icon === 'focus',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
        },
        {
            id: 'iconBoxShadowFocus',
            show: switcher.icon === 'focus',
            label: __('Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
        }
    ];
};