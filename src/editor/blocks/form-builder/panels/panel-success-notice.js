import { __ } from '@wordpress/i18n';
import { handleBorderV2, handleColor, handleDimension, handleTypography } from 'gutenverse-core/styling';
import { BorderControl, BoxShadowControl, CheckboxControl, ColorControl, DimensionControl, IconRadioControl, TypographyControl } from 'gutenverse-core/controls';
import { allowRenderBoxShadow, handleBoxShadow } from 'gutenverse-core/styling';
import { AlignCenter, AlignLeft, AlignRight } from 'react-feather';


export const successNoticePanel = (props) => {
    const {
        elementId,
    } = props;

    return [
        {
            id: 'successExample',
            label: __('Success Example', 'gutenverse'),
            description: __('Show Success Notice Example inside the Editor.', 'gutenverse'),
            component: CheckboxControl,
        },
        {
            id: 'successAlign',
            label: __('Success Alignment', 'gutenverse'),
            component: IconRadioControl,
            allowDeviceControl: true,
            options: [
                {
                    label: __('Align Left', 'gutenverse'),
                    value: 'left',
                    icon: <AlignLeft />,
                },
                {
                    label: __('Align Center', 'gutenverse'),
                    value: 'center',
                    icon: <AlignCenter />,
                },
                {
                    label: __('Align Right', 'gutenverse'),
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
            label: __('Success Background Color', 'gutenverse'),
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
            label: __('Success Text Color', 'gutenverse'),
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
            label: __('Success Typography', 'gutenverse'),
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
            label: __('Success Padding', 'gutenverse'),
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
            id: 'successBorder_v2',
            label: __('Border Type', 'gutenverse'),
            component: BorderControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
                    render: value => handleBorderV2(value)
                }
            ]
        },
        {
            id: 'successBoxShadow',
            label: __('Box Shadow', 'gutenverse'),
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

