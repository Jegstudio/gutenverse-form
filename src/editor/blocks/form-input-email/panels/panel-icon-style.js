import { __ } from '@wordpress/i18n';
import { BackgroundControl, BorderResponsiveControl, BoxShadowControl, ColorControl, DimensionControl, RangeControl, SelectControl, SwitchControl, GradientControl } from 'gutenverse-core/controls';
import { getDeviceType } from 'gutenverse-core/editor-helper';
import { handleColor, handleDimension, handleBorderResponsive, elementVar, normalAppender, allowRenderBoxShadow } from 'gutenverse-core/styling';
import { handleBoxShadow } from 'gutenverse-core/styling';

export const panelIconStyle = (props) => {
    const {
        elementId,
        switcher,
        setSwitcher,
        iconStyleMode,
        iconColorGradient,
        iconColorGradientHover,
        iconType
    } = props;

    /**
     * This is custom to prevent older saved values causing errors because BackgroundControl is used instead of GradientControl
     */
    const customHandleBackground = (background) => {
        const elementStyle = elementVar();
        const {
            gradientColor,
            gradientType = 'linear',
            gradientAngle = 180,
            gradientRadial = 'center center'
        } = background;

        if (gradientColor !== undefined) {
            const colors = gradientColor.map(gradient => `${gradient.color} ${gradient.offset * 100}%`);

            if (gradientType === 'radial') {
                normalAppender({
                    style: `background-image: radial-gradient(at ${gradientRadial}, ${colors.join(',')});`,
                    elementStyle
                });
            } else {
                normalAppender({
                    style: `background-image: linear-gradient(${gradientAngle}deg, ${colors.join(',')});`,
                    elementStyle
                });
            }
        }

        return elementStyle;
    };

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
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-email-icon .icon`,
                    render: value => handleDimension(value, 'padding')
                }
            ],
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
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-email-icon .icon`,
                    render: value => handleDimension(value, 'margin')
                }
            ],
        },
        {
            id: 'iconRotate',
            label: __('Icon Rotate', 'gutenverse-form'),
            component: RangeControl,
            allowDeviceControl: true,
            min: 1,
            max: 360,
            step: 1,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-email-icon .icon`,
                    render: value => `transform: rotate(${value}deg);`
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
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-email-icon .icon i`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'iconBgColor',
            show: (!switcher.icon || switcher.icon === 'normal') && (!iconStyleMode || iconStyleMode === 'color'),
            label: __('Normal Background Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-email-icon .icon`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'iconColorGradient',
            show: (!switcher.icon || switcher.icon === 'normal') && iconStyleMode === 'gradient' && iconType === 'icon',
            type: __('Color Gradient', 'gutenverse-form'),
            component: BackgroundControl,
            options: ['gradient'],
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-email-icon .icon.style-gradient i`,
                    hasChild: true,
                    render: value => customHandleBackground(value)
                }
            ]
        },
        {
            id: 'iconBackground',
            show: (!switcher.icon || switcher.icon === 'normal') && iconStyleMode === 'gradient',
            type: __('Background Gradient', 'gutenverse-form'),
            component: BackgroundControl,
            options: ['gradient'],
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-email-icon .icon.style-gradient`,
                    hasChild: true,
                    render: value => customHandleBackground(value)
                }
            ]
        },
        {
            id: 'iconBorder',
            show: (!switcher.icon || switcher.icon === 'normal'),
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-email-icon .icon`,
                    render: value => handleBorderResponsive(value)
                }
            ]
        },
        {
            id: 'iconBoxShadow',
            show: !switcher.icon || switcher.icon === 'normal',
            label: __('Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-email-icon .icon`,
                    allowRender: (value) => allowRenderBoxShadow(value),
                    render: value => handleBoxShadow(value)
                }
            ]
        },
        {
            id: 'iconHoverColor',
            show: switcher.icon === 'hover' && (!iconStyleMode || iconStyleMode === 'color'),
            label: __('Hover Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-email-icon .icon i`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'iconHoverBgColor',
            show: switcher.icon === 'hover' && (!iconStyleMode || iconStyleMode === 'color'),
            label: __('Hover Background Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-email-icon .icon`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'iconColorGradientHover',
            show: switcher.icon === 'hover' && iconStyleMode === 'gradient' && iconType === 'icon',
            type: __('Color Gradient', 'gutenverse-form'),
            component: BackgroundControl,
            options: ['gradient'],
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-email-icon .icon.style-gradient i`,
                    hasChild: true,
                    render: value => iconColorGradientHover ? customHandleBackground(value) : customHandleBackground(iconColorGradient)
                }
            ]
        },
        {
            id: 'iconBackgroundHover',
            show: switcher.icon === 'hover' && iconStyleMode === 'gradient',
            component: BackgroundControl,
            options: ['gradient'],
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-email-icon .icon.style-gradient`,
                    hasChild: true,
                    render: value => customHandleBackground(value)
                }
            ]
        },
        {
            id: 'iconBorderHover',
            show: switcher.icon === 'hover',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-email-icon .icon`,
                    render: value => handleBorderResponsive(value)
                },
            ]
        },
        {
            id: 'iconBoxShadowHover',
            show: switcher.icon === 'hover',
            label: __('Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-email-icon .icon`,
                    allowRender: (value) => allowRenderBoxShadow(value),
                    render: value => handleBoxShadow(value)
                }
            ]
        },
        {
            id: 'iconFocusColor',
            show: switcher.icon === 'focus' && (!iconStyleMode || iconStyleMode === 'color'),
            label: __('Focus Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-email-icon .icon i`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'iconFocusBgColor',
            show: switcher.icon === 'focus' && (!iconStyleMode || iconStyleMode === 'color'),
            label: __('Focus Background Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-email-icon .icon`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'iconColorGradientFocus',
            show: switcher.icon === 'focus' && iconStyleMode === 'gradient' && iconType === 'icon',
            type: __('Color Gradient', 'gutenverse-form'),
            component: BackgroundControl,
            options: ['gradient'],
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-email-icon .icon.style-gradient i`,
                    hasChild: true,
                    render: value => iconColorGradientHover ? customHandleBackground(value) : customHandleBackground(iconColorGradient)
                }
            ]
        },
        {
            id: 'iconBackgroundFocus',
            show: switcher.icon === 'focus' && iconStyleMode === 'gradient',
            component: BackgroundControl,
            options: ['gradient'],
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-email-icon .icon.style-gradient`,
                    hasChild: true,
                    render: value => customHandleBackground(value)
                }
            ]
        },
        {
            id: 'iconBorderFocus',
            show: switcher.icon === 'focus',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-email-icon .icon`,
                    render: value => handleBorderResponsive(value)
                },
            ]
        },
        {
            id: 'iconBoxShadowFocus',
            show: switcher.icon === 'focus',
            label: __('Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-email-icon .icon`,
                    allowRender: (value) => allowRenderBoxShadow(value),
                    render: value => handleBoxShadow(value)
                }
            ]
        }
    ];
};