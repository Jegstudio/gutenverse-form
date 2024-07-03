import { __ } from '@wordpress/i18n';
import { BorderControl, BorderResponsiveControl, BoxShadowControl, ColorControl, DimensionControl, SwitchControl, TypographyControl } from 'gutenverse-core/controls';
import { handleDimension, handleColor, handleTypography, handleBorderResponsive, handleBorder, allowRenderBoxShadow, handleBoxShadow } from 'gutenverse-core/styling';
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
            style: [
                {
                    selector: `.${elementId} .main-wrapper .choices__inner`,
                    render: value => handleDimension(value, 'padding')
                }
            ]
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
            style: [
                {
                    selector: `.${elementId} .main-wrapper .choices`,
                    render: value => handleDimension(value, 'margin')
                }
            ]
        },
        {
            id: 'placeholderColor',
            label: __('Input Placeholder Color', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .choices__placeholder:not(.choices__item--choice)`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'placeholderBgColor',
            label: __('Input Background Color', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .choices__inner, .${elementId} .choices .choices__input`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'inputTypography',
            label: __('Input Typography', 'gutenverse-form'),
            component: TypographyControl,
            style: [
                {
                    selector: `.${elementId} .choices__placeholder, .${elementId} .choices__item, .${elementId} .choices__input`,
                    hasChild: true,
                    render: (value, id) => handleTypography(value, props, id)
                }
            ],
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
            style: [
                {
                    selector: `.${elementId} .choices .choices__inner .choices__list .choices__item.choices__item--selectable:not(.choices__placeholder)`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'choicesColorNormal',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Options Text Color Normal', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .choices .choices__list.choices__list--dropdown .choices__item`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'choicesBgColorNormal',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Options Background Color Normal', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .choices .choices__list.choices__list--dropdown .choices__item`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'inputBorderNormal',
            show: (!switcher.inputState || switcher.inputState === 'normal') && device == 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderControl,
            style: [
                {
                    selector: `.${elementId} .choices .choices__inner, .${elementId} .choices .choices__list.choices__list--dropdown`,
                    hasChild: true,
                    render: value => handleBorder(value)
                }
            ]
        },
        {
            id: 'inputBorderNormalResponsive',
            show: (!switcher.inputState || switcher.inputState === 'normal') && device !== 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .choices .choices__inner, .${elementId} .choices .choices__list.choices__list--dropdown`,
                    allowRender: () => device !== 'Desktop',
                    render: value => handleBorderResponsive(value)
                }
            ]
        },
        {
            id: 'inputColorHover',
            show: switcher.inputState === 'hover',
            label: __('Input Text Color Hover', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId}:hover .choices .choices__inner .choices__list .choices__item.choices__item--selectable:not(.choices__placeholder)`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'choicesColorHover',
            show: switcher.inputState === 'hover',
            label: __('Options Text Color Hover', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .choices .choices__list.choices__list--dropdown .choices__item.is-highlighted`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'choicesBgColorHover',
            show: switcher.inputState === 'hover',
            label: __('Selected Option Color Hover', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .choices .choices__list.choices__list--dropdown .choices__item.is-highlighted`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'inputBorderHover',
            show: switcher.inputState === 'hover' && device == 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderControl,
            style: [
                {
                    selector: `.${elementId} .choices .choices__inner:hover, .${elementId} .choices .choices__list.choices__list--dropdown:hover`,
                    hasChild: true,
                    render: value => handleBorder(value)
                }
            ]
        },
        {
            id: 'inputBorderHoverResponsive',
            show: switcher.inputState === 'hover' && device !== 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .choices .choices__inner:hover, .${elementId} .choices .choices__list.choices__list--dropdown:hover`,
                    allowRender: () => device !== 'Desktop',
                    render: value => handleBorderResponsive(value)
                }
            ]
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
            style: [
                {
                    selector: `.${elementId} .choices .choices__inner, .${elementId} .choices .choices__list.choices__list--dropdown`,
                    allowRender: (value) => allowRenderBoxShadow(value),
                    render: value => handleBoxShadow(value)
                }
            ]
        },
        {
            id: 'inputAreaBoxShadowHover',
            show: switcher.inputAreaHover === 'hover',
            label: __('Hover Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
            style: [
                {
                    selector: `.${elementId} .choices .choices__inner:hover, .${elementId} .choices .choices__list.choices__list--dropdown:hover`,
                    allowRender: (value) => allowRenderBoxShadow(value),
                    render: value => handleBoxShadow(value)
                }
            ]
        }
    ];
};