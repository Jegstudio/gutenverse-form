import { __ } from '@wordpress/i18n';
import { BorderControl, BorderResponsiveControl, BoxShadowControl, CheckboxControl, ColorControl, DimensionControl, IconRadioControl, TypographyControl } from 'gutenverse-core/controls';
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
            ]
        },
        {
            id: 'errorBgColor',
            label: __('Error Background Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'errorBgColor',
                    'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                    'properties': [
                        {
                            'name': 'background-color',
                            'valueType': 'direct'
                        }
                    ]
                }
            ]
        },
        {
            id: 'errorTextColor',
            label: __('Error Text Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'errorTextColor',
                    'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ]
                }
            ]
        },
        {
            id: 'errorTypography',
            label: __('Error Typography', 'gutenverse-form'),
            component: TypographyControl
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
            }
        },
        {
            id: 'errorMargin',
            label: __('Error Margin', 'gutenverse-form'),
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
            }
        },
        {
            id: 'errorBorder',
            show: device === 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderControl,
            liveStyle: [
                {
                    'type': 'border',
                    'id': 'errorBorder',
                    'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                }
            ]
        },
        {
            id: 'errorBorderResponsive',
            show: device !== 'Desktop',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'borderResponsive',
                    'id': 'errorBorderResponsive',
                    'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                }
            ]
        },
        {
            id: 'errorBoxShadow',
            label: __('Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
            liveStyle: [
                {
                    'type': 'boxShadow',
                    'id': 'errorBoxShadow',
                    'properties': [
                        {
                            'name': 'box-shadow',
                            'valueType': 'direct'
                        }
                    ],
                    'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
                }
            ]
        },
    ];
};

