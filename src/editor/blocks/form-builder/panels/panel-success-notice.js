import { __ } from '@wordpress/i18n';
import { handleBorderResponsive, handleBorder, handleColor, handleDimension, handleTypography } from 'gutenverse-core/styling';
import { BorderControl, BorderResponsiveControl, BoxShadowControl, CheckboxControl, ColorControl, DimensionControl, IconRadioControl, TypographyControl } from 'gutenverse-core/controls';
import { allowRenderBoxShadow, handleBoxShadow } from 'gutenverse-core/styling';
import { AlignCenter, AlignLeft, AlignRight } from 'gutenverse-core/components';
import { getDeviceType } from 'gutenverse-core/editor-helper';

export const successNoticePanel = (props) => {
    const {
        elementId,
    } = props;

    const device = getDeviceType();

    return [
        {
            id: 'successExample',
            label: __('Success Example', 'gutenverse-form'),
            description: __('Show Success Notice Example inside the Editor.', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'successAlign',
            label: __('Success Alignment', 'gutenverse-form'),
            component: IconRadioControl,
            allowDeviceControl: true,
            options: [
                {
                    label: __('Align Left', 'gutenverse-form'),
                    value: 'left',
                    icon: <AlignLeft />,
                },
                {
                    label: __('Align Center', 'gutenverse-form'),
                    value: 'center',
                    icon: <AlignCenter />,
                },
                {
                    label: __('Align Right', 'gutenverse-form'),
                    value: 'right',
                    icon: <AlignRight />,
                },
            ],
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
                    render: value => `text-align: ${value};`
                }
            ]
        },
        {
            id: 'successBgColor',
            label: __('Success Background Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'successTextColor',
            label: __('Success Text Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'successTypography',
            label: __('Success Typography', 'gutenverse-form'),
            component: TypographyControl,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
                    hasChild: true,
                    render: (value, id) => handleTypography(value, props, id)
                }
            ],
        },
        {
            id: 'successPadding',
            label: __('Success Padding', 'gutenverse-form'),
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
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
                    render: value => handleDimension(value, 'padding')
                }
            ],
        },
        {
            id: 'successBorder',
            label: __('Border', 'gutenverse-form'),
            component: BorderControl,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
                    hasChild: true,
                    render: value => handleBorder(value)
                }
            ]
        },
        {
            id: 'successBorderResponsive',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
                    allowRender: () => device !== 'Desktop',
                    render: value => handleBorderResponsive(value)
                }
            ]
        },
        {
            id: 'successBoxShadow',
            label: __('Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
                    allowRender: (value) => allowRenderBoxShadow(value),
                    render: value => handleBoxShadow(value)
                }
            ]
        },
    ];
};

