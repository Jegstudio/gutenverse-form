import { __ } from '@wordpress/i18n';
import { BorderControl, BoxShadowControl, RangeControl } from 'gutenverse-core/controls';
import { ColorControl, DimensionControl, SwitchControl, TypographyControl } from 'gutenverse-core/controls';
import { handleDimension, handleColor, handleTypography, handleBorder, allowRenderBoxShadow, handleBoxShadow } from 'gutenverse-core/styling';

export const inputPanel = props => {
    const {
        elementId,
        setSwitcher,
        switcher
    } = props;

    return [
        {
            id: 'inputHeight',
            label: __('Textarea height', 'gutenverse'),
            description: __('Textarea height in px unit', 'gutenverse'),
            component: RangeControl,
            min: 1,
            max: 300,
            step: 1,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input`,
                    render: value => `height: ${value}px;`
                }
            ],
        },
        {
            id: 'inputPadding',
            label: __('Input Padding', 'gutenverse'),
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
            label: __('Input Margin', 'gutenverse'),
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
            label: __('Input Placeholder Color', 'gutenverse'),
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
            label: __('Input Typography', 'gutenverse'),
            component: TypographyControl,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input`,
                    hasChild: true,
                    render: (value,id) => handleTypography(value, props, id)
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
            label: __('Input Color Normal', 'gutenverse'),
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
            label: __('Input Background Color Normal', 'gutenverse'),
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
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Border Type', 'gutenverse'),
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
            id: 'inputColorHover',
            show: switcher.inputState === 'hover',
            label: __('Input Color Hover', 'gutenverse'),
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
            label: __('Input Background Color Hover', 'gutenverse'),
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
            show: switcher.inputState === 'hover',
            label: __('Border Type', 'gutenverse'),
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
            id: 'inputColorFocus',
            show: switcher.inputState === 'focus',
            label: __('Input Color Focus', 'gutenverse'),
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
            label: __('Input Background Color Focus', 'gutenverse'),
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
            show: switcher.inputState === 'focus',
            label: __('Border Type', 'gutenverse'),
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
            onChange: ({__inputAreaHover}) => setSwitcher({...switcher, inputAreaHover: __inputAreaHover})
        },
        {
            id: 'inputAreaBoxShadow',
            show: !switcher.inputAreaHover || switcher.inputAreaHover === 'normal',
            label: __('Box Shadow', 'gutenverse'),
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
            label: __('Hover Box Shadow', 'gutenverse'),
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