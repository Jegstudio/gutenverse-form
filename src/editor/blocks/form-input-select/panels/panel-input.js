import { __ } from '@wordpress/i18n';
import { BorderControl, BorderResponsiveControl, BoxShadowControl, ColorControl, DimensionControl, SwitchControl, TypographyControl } from 'gutenverse-core/controls';
import { getDeviceType } from 'gutenverse-core/editor-helper';

export const inputPanel = props => {
    const {
        elementId,
        setSwitcher,
        switcher
    } = props;

    const device = getDeviceType();

    return [
        {
            id: 'inputPadding',
            label: __('Input Padding', 'gutenverse-form'),
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
            id: 'inputMargin',
            label: __('Input Margin', 'gutenverse-form'),
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
            id: 'placeholderColor',
            label: __('Input Placeholder Color', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'placeholderColor',
                    'selector': `.${elementId} .choices__placeholder:not(.choices__item--choice)`,
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
            id: 'placeholderBgColor',
            label: __('Input Background Color', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'placeholderBgColor',
                    'selector': `.${elementId} .choices__inner, .${elementId} .choices .choices__input`,
                    'properties': [
                        {
                            'name': 'background-color',
                            'valueType': 'direct'
                        }
                    ],
                    'responsive': true,
                }
            ]
        },
        {
            id: 'inputTypography',
            label: __('Input Typography', 'gutenverse-form'),
            component: TypographyControl,
        },
        {
            id: '__itemState',
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
            ],
            onChange: ({ __itemState }) => setSwitcher({ ...switcher, inputState: __itemState })
        },
        {
            id: 'inputColorNormal',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Input Text Color Normal', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'inputColorNormal',
                    'selector': `.${elementId} .choices .choices__inner .choices__list .choices__item.choices__item--selectable:not(.choices__placeholder)`,
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
            id: 'choicesColorNormal',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Options Text Color Normal', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'choicesColorNormal',
                    'selector': `.${elementId} .choices .choices__list.choices__list--dropdown .choices__item`,
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
            id: 'choicesBgColorNormal',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Options Background Color Normal', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'choicesBgColorNormal',
                    'selector': `.${elementId} .choices .choices__list.choices__list--dropdown .choices__item`,
                    'properties': [
                        {
                            'name': 'background-color',
                            'valueType': 'direct'
                        }
                    ],
                    'responsive': true,
                }
            ]
        },
        {
            id: 'inputBorderNormal',
            show: (!switcher.inputState || switcher.inputState === 'normal') && device == 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderControl,
        },
        {
            id: 'inputBorderNormalResponsive',
            show: (!switcher.inputState || switcher.inputState === 'normal') && device !== 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
        },
        {
            id: 'inputColorHover',
            show: switcher.inputState === 'hover',
            label: __('Input Text Color Hover', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'inputColorHover',
                    'selector': `.${elementId}:hover .choices .choices__inner .choices__list .choices__item.choices__item--selectable:not(.choices__placeholder)`,
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
            id: 'choicesColorHover',
            show: switcher.inputState === 'hover',
            label: __('Options Text Color Hover', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'choicesColorHover',
                    'selector': `.${elementId} .choices .choices__list.choices__list--dropdown .choices__item.is-highlighted`,
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
            id: 'choicesBgColorHover',
            show: switcher.inputState === 'hover',
            label: __('Selected Option Color Hover', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'choicesBgColorHover',
                    'selector': `.${elementId} .choices .choices__list.choices__list--dropdown .choices__item.is-highlighted`,
                    'properties': [
                        {
                            'name': 'background-color',
                            'valueType': 'direct'
                        }
                    ],
                    'responsive': true,
                }
            ]
        },
        {
            id: 'inputBorderHover',
            show: switcher.inputState === 'hover' && device == 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderControl,
        },
        {
            id: 'inputBorderHoverResponsive',
            show: switcher.inputState === 'hover' && device !== 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
        },
        {
            id: '__inputAreaHover',
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
            onChange: ({ __inputAreaHover }) => setSwitcher({ ...switcher, inputAreaHover: __inputAreaHover })
        },
        {
            id: 'inputAreaBoxShadow',
            show: !switcher.inputAreaHover || switcher.inputAreaHover === 'normal',
            label: __('Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
            liveStyle: [
                {
                    'type': 'boxShadow',
                    'id': 'inputAreaBoxShadow',
                    'properties': [
                        {
                            'name': 'box-shadow',
                            'valueType': 'direct'
                        }
                    ],
                    'selector': `.${elementId} .choices .choices__inner, .${elementId} .choices .choices__list.choices__list--dropdown`,
                }
            ]
        },
        {
            id: 'inputAreaBoxShadowHover',
            show: switcher.inputAreaHover === 'hover',
            label: __('Hover Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
            liveStyle: [
                {
                    'type': 'boxShadow',
                    'id': 'inputAreaBoxShadowHover',
                    'properties': [
                        {
                            'name': 'box-shadow',
                            'valueType': 'direct'
                        }
                    ],
                    'selector': `.${elementId} .choices .choices__inner:hover, .${elementId} .choices .choices__list.choices__list--dropdown:hover`,
                }
            ]
        }
    ];
};