import { __ } from '@wordpress/i18n';
import { handleBorderV2, handleColor, handleDimension, handleTypography } from 'gutenverse-core/styling';
import { BorderControl, BoxShadowControl, CheckboxControl, ColorControl, DimensionControl, IconRadioControl, TypographyControl } from 'gutenverse-core/controls';
import { allowRenderBoxShadow, handleBoxShadow } from 'gutenverse-core/styling';
import { AlignCenter, AlignLeft, AlignRight } from 'gutenverse-core/components';


export const errorNoticePanel = (props) => {
    const {
        elementId,
    } = props;

    return [
        {
            id: 'errorExample',
            label: __('Error Example', 'gutenverse'),
            description: __('Show Error Notice Example inside the Editor.', 'gutenverse'),
            component: CheckboxControl,
        },
        {
            id: 'errorAlign',
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
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                    render: value => `text-align: ${value};`
                }
            ]
        },
        {
            id: 'errorBgColor',
            label: __('Error Background Color', 'gutenverse'),
            component: ColorControl,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                    render: value => handleColor(value, 'background-color')
                }
            ]
        },
        {
            id: 'errorTextColor',
            label: __('Error Text Color', 'gutenverse'),
            component: ColorControl,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'errorTypography',
            label: __('Error Typography', 'gutenverse'),
            component: TypographyControl,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                    hasChild: true,
                    render: (value, id) => handleTypography(value, props, id)
                }
            ],
        },
        {
            id: 'errorPadding',
            label: __('Error Padding', 'gutenverse'),
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
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                    render: value => handleDimension(value, 'padding')
                }
            ],
        },
        {
            id: 'errorBorder_v2',
            label: __('Border Type', 'gutenverse'),
            component: BorderControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                    render: value => handleBorderV2(value)
                }
            ]
        },
        {
            id: 'errorBoxShadow',
            label: __('Box Shadow', 'gutenverse'),
            component: BoxShadowControl,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                    allowRender: (value) => allowRenderBoxShadow(value),
                    render: value => handleBoxShadow(value)
                }
            ]
        },
    ];
};

