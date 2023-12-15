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
                    selector: `.${elementId} .gutenverse-input`,
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
                    selector: `.${elementId} .gutenverse-input`,
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
                    selector: `.${elementId} .gutenverse-input::placeholder`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'inputTypography',
            label: __('Input Typography', 'gutenverse-form'),
            component: TypographyControl,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input`,
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
                {
                    value: 'focus',
                    label: 'Focus'
                }
            ],
            onChange: ({ __itemState }) => setSwitcher({ ...switcher, inputState: __itemState })
        },
        {
            id: 'inputColorNormal',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Input Color Normal', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'inputBgColorNormal',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Input Background Color Normal', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'inputBorderNormal',
            show: (!switcher.inputState || switcher.inputState === 'normal') && device === 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderControl,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input`,
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
                    selector: `.${elementId} .gutenverse-input`,
                    allowRender: () => device !== 'Desktop',
                    render: value => handleBorderResponsive(value)
                }
            ]
        },
        {
            id: 'inputColorHover',
            show: switcher.inputState === 'hover',
            label: __('Input Color Hover', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input:hover`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'inputBgColorHover',
            show: switcher.inputState === 'hover',
            label: __('Input Background Color Hover', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input:hover`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'inputBorderHover',
            show: switcher.inputState === 'hover' && device === 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderControl,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input:hover`,
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
                    selector: `.${elementId} .gutenverse-input:hover`,
                    allowRender: () => device !== 'Desktop',
                    render: value => handleBorderResponsive(value)
                }
            ]
        },
        {
            id: 'inputColorFocus',
            show: switcher.inputState === 'focus',
            label: __('Input Color Focus', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input:focus, .${elementId} .gutenverse-input:focus-visible`,
                    render: value => handleColor(value, 'color')
                },
            ]
        },
        {
            id: 'inputBgColorFocus',
            show: switcher.inputState === 'focus',
            label: __('Input Background Color Focus', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input:focus, .${elementId} .gutenverse-input:focus-visible`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'inputBorderFocus',
            show: switcher.inputState === 'focus' && device === 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderControl,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input:focus, .${elementId} .gutenverse-input:focus-visible`,
                    hasChild: true,
                    render: value => handleBorder(value)
                }
            ]
        },
        {
            id: 'inputBorderFocusResponsive',
            show: switcher.inputState === 'focus' && device !== 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input:focus, .${elementId} .gutenverse-input:focus-visible`,
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
                    selector: `.${elementId} .gutenverse-input`,
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
                    selector: `.${elementId} .gutenverse-input:hover`,
                    allowRender: (value) => allowRenderBoxShadow(value),
                    render: value => handleBoxShadow(value)
                }
            ]
        }
    ];
};