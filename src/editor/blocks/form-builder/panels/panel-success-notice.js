import { __ } from '@wordpress/i18n';
import { BorderControl, BorderResponsiveControl, BoxShadowControl, CheckboxControl, ColorControl, DimensionControl, IconRadioControl, TypographyControl } from 'gutenverse-core/controls';
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
            ]
        },
        {
            id: 'successBgColor',
            label: __('Success Background Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'successBgColor',
                    'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
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
            id: 'successTextColor',
            label: __('Success Text Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'successTextColor',
                    'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
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
            id: 'successTypography',
            label: __('Success Typography', 'gutenverse-form'),
            component: TypographyControl
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
            }
        },
        {
            id: 'successMargin',
            label: __('Success Margin', 'gutenverse-form'),
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
            id: 'successBorder',
            label: __('Border', 'gutenverse-form'),
            component: BorderControl,
            show : device === 'Desktop',
            liveStyle: [
                {
                    'type': 'border',
                    'id': 'successBorder',
                    'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
                }
            ]
        },
        {
            id: 'successBorderResponsive',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
            show : device !== 'Desktop',
            liveStyle: [
                {
                    'type': 'borderResponsive',
                    'id': 'successBorderResponsive',
                    'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
                }
            ]
        },
        {
            id: 'successBoxShadow',
            label: __('Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
            liveStyle: [
                {
                    'type': 'boxShadow',
                    'id': 'successBoxShadow',
                    'properties': [
                        {
                            'name': 'box-shadow',
                            'valueType': 'direct'
                        }
                    ],
                    'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
                }
            ]
        },
    ];
};

