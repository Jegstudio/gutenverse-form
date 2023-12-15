import { __ } from '@wordpress/i18n';
import { handleBorderResponsive, handleBorder, handleColor, handleDimension, handleTypography } from 'gutenverse-core/styling';
import { BorderControl, BorderResponsiveControl, BoxShadowControl, CheckboxControl, ColorControl, DimensionControl, IconRadioControl, TypographyControl } from 'gutenverse-core/controls';
import { allowRenderBoxShadow, handleBoxShadow } from 'gutenverse-core/styling';
import { AlignCenter, AlignLeft, AlignRight } from 'gutenverse-core/components';
import { getDeviceType } from 'gutenverse-core/editor-helper';

export const errorNoticePanel = (props) => {
    const {
        elementId,
    } = props;

    const device = getDeviceType();

    return [
        {
            id: 'errorExample',
            label: __('Error Example', 'gutenverse-form'),
            description: __('Show Error Notice Example inside the Editor.', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'errorAlign',
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
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                    render: value => `text-align: ${value};`
                }
            ]
        },
        {
            id: 'errorBgColor',
            label: __('Error Background Color', 'gutenverse-form'),
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
            label: __('Error Text Color', 'gutenverse-form'),
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
            label: __('Error Typography', 'gutenverse-form'),
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
            label: __('Error Padding', 'gutenverse-form'),
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
            id: 'errorBorder',
            show: device === 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderControl,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                    hasChild: true,
                    render: value => handleBorder(value)
                }
            ]
        },
        {
            id: 'errorBorderResponsive',
            show: device !== 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                    allowRender: () => device !== 'Desktop',
                    render: value => handleBorderResponsive(value)
                }
            ]
        },
        {
            id: 'errorBoxShadow',
            label: __('Box Shadow', 'gutenverse-form'),
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

