import { __ } from '@wordpress/i18n';
import { ColorControl, DimensionControl, RangeControl, SwitchControl, TypographyControl } from 'gutenverse-core/controls';
import { handleDimension, handleColor, handleTypography } from 'gutenverse-core/styling';

export const inputPanel = props => {
    const {
        elementId,
        setSwitcher,
        switcher
    } = props;

    return [
        {
            id: 'wrapperMargin',
            label: __('Wrapper Margin', 'gutenverse-form'),
            component: DimensionControl,
            position: ['top', 'right', 'bottom', 'left'],
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
        },
        {
            id: 'gdprSize',
            label: __('Checkbox Size', 'gutenverse-form'),
            component: RangeControl,
            unit: 'px',
            min: 1,
            max: 200,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'gdprSize',
                    'selector': `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .guten-gdpr-input-wrapper .check:before`,
                    'properties': [
                        {
                            'name': 'font-size',
                            'valueType': 'pattern',
                            'pattern': '{value}px',
                            'patternValues': {
                                'value': {
                                    'type': 'direct',
                                },

                            }
                        }
                    ],
                }
            ]
        },
        {
            id: 'gdprSpace',
            label: __('Checkbox Space', 'gutenverse-form'),
            component: RangeControl,
            unit: 'px',
            min: 1,
            max: 200,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'gdprSpace',
                    'selector': `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .guten-gdpr-input-wrapper .check:before`,
                    'properties': [
                        {
                            'name': 'margin-right',
                            'valueType': 'pattern',
                            'pattern': '{value}px',
                            'patternValues': {
                                'value': {
                                    'type': 'direct',
                                },

                            }
                        }
                    ],
                }
            ]
        },
        {
            id: 'gdprLabelColor',
            label: __('Checkbox Label Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'gdprLabelColor',
                    'selector': `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .gdpr-label`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'gdprTypography',
            label: __('Checkbox Label Typography', 'gutenverse-form'),
            component: TypographyControl,
        },
        {
            id: 'gdprLinkColor',
            label: __('Checkbox Link Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'gdprLinkColor',
                    'selector': `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .gdpr-label a`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'gdprLinkTypography',
            label: __('Checkbox Link Typography', 'gutenverse-form'),
            component: TypographyControl,
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
                    value: 'active',
                    label: 'Active'
                },
            ],
            onChange: ({ __itemState }) => setSwitcher({ ...switcher, inputState: __itemState })
        },
        {
            id: 'gdprColor',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Checkbox Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'gdprColor',
                    'selector': `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .guten-gdpr-input-wrapper .check:before`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'gdprActiveColor',
            show: switcher.inputState === 'active',
            label: __('Checkbox Active Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'gdprActiveColor',
                    'selector': `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .guten-gdpr-input-wrapper input:checked + .check:before`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
    ];
};