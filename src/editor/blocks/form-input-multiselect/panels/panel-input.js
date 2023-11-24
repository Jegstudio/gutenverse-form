import { __ } from '@wordpress/i18n';
import { BorderControl, BoxShadowControl, ColorControl, DimensionControl, SwitchControl, TypographyControl } from 'gutenverse-core/controls';
import { handleDimension, handleColor, handleTypography, handleBorderV2, allowRenderBoxShadow, handleBoxShadow } from 'gutenverse-core/styling';

export const inputPanel = props => {
    const {
        elementId,
        setSwitcher,
        switcher
    } = props;

    return [
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
                    selector: `.${elementId} .main-wrapper .choices__inner`,
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
                    selector: `.${elementId} .main-wrapper .choices__inner`,
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
                    selector: `.${elementId} .choices__input::placeholder`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'inputTextColor',
            label: __('Input Text Color', 'gutenverse'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .choices__input`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'placeholderBgColor',
            label: __('Input Background Color', 'gutenverse'),
            component: ColorControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .choices__placeholder, .${elementId} .choices__inner, .${elementId} .choices__input`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'inputTypography',
            label: __('Input Typography', 'gutenverse'),
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
            label: __('Options Text Color Normal', 'gutenverse'),
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
            id: 'inputBgColorNormal',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Options Background Color Normal', 'gutenverse'),
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
            id: 'inputBorderNormal_v2',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Options Border Normal', 'gutenverse'),
            component: BorderControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .choices .choices__inner, .${elementId} .choices .choices__list.choices__list--dropdown`,
                    render: value => handleBorderV2(value)
                }
            ]
        },
        {
            id: 'inputColorHover',
            show: switcher.inputState === 'hover',
            label: __('Options Text Color Hover', 'gutenverse'),
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
            id: 'inputBgColorHover',
            show: switcher.inputState === 'hover',
            label: __('Options Background Color Hover', 'gutenverse'),
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
            id: 'inputBorderHover_v2',
            show: switcher.inputState === 'hover',
            label: __('Options Border Hover', 'gutenverse'),
            component: BorderControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .choices .choices__inner:hover, .${elementId} .choices .choices__list.choices__list--dropdown:hover`,
                    render: value => handleBorderV2(value)
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
            label: __('Box Shadow', 'gutenverse'),
            component: BoxShadowControl,
            style: [
                {
                    selector: `.${elementId} .choices `,
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
                    selector: `.${elementId}:hover .choices `,
                    allowRender: (value) => allowRenderBoxShadow(value),
                    render: value => handleBoxShadow(value)
                }
            ]
        }
    ];
};