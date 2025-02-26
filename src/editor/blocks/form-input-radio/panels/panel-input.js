import { __ } from '@wordpress/i18n';
import { ColorControl, DimensionControl, RangeControl, SelectControl, SwitchControl, TypographyControl } from 'gutenverse-core/controls';

export const inputPanel = props => {
    const {
        elementId,
        setSwitcher,
        switcher
    } = props;

    return [
        {
            id: 'displayBlock',
            label: __('Option Display', 'gutenverse-form'),
            description: __('Select how options are stacked', 'gutenverse-form'),
            component: SelectControl,
            options: [
                {
                    label: __('Default (inline)'),
                    value: 'default'
                },
                {
                    label: __('Block'),
                    value: 'block'
                },
            ],
        },
        {
            id: 'labelSpace',
            label: __('Label Space', 'gutenverse-form'),
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
            id: 'radioSize',
            label: __('Radio Size', 'gutenverse-form'),
            component: RangeControl,
            unit: 'px',
            min: 1,
            max: 200,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'radioSize',
                    'properties': [
                        {
                            'name': 'font-size',
                            'valueType': 'pattern',
                            'pattern': '{value}px',
                            'patternValues': {
                                'value': {
                                    'type': 'direct'
                                }
                            }
                        }
                    ],
                    'selector': `.${elementId} .gutenverse-inner-input label .radio:before`,
                }
            ]
        },
        {
            id: 'radioSpace',
            label: __('Radio Space', 'gutenverse-form'),
            component: RangeControl,
            unit: 'px',
            min: 1,
            max: 200,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'radioSpace',
                    'properties': [
                        {
                            'name': 'margin-right',
                            'valueType': 'pattern',
                            'pattern': '{value}px',
                            'patternValues': {
                                'value': {
                                    'type': 'direct'
                                }
                            }
                        }
                    ],
                    'selector': `.${elementId} .gutenverse-inner-input label .radio:before`,
                }
            ]
        },
        {
            id: 'radioLabelColor',
            label: __('Radio Label Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'radioLabelColor',
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct',
                        }
                    ],
                    'selector': `.${elementId} .gutenverse-inner-input label`,
                }
            ]
        },
        {
            id: 'radioTypography',
            label: __('Radio Typography', 'gutenverse-form'),
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
            id: 'radioColor',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Radio Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'radioColor',
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct',
                        }
                    ],
                    'selector': `.${elementId} .gutenverse-inner-input label .radio:before`,
                }
            ]
        },
        {
            id: 'radioActiveColor',
            show: switcher.inputState === 'active',
            label: __('Radio Active Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'radioActiveColor',
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct',
                        }
                    ],
                    'selector': `.${elementId} .gutenverse-inner-input label input:checked + .radio:before`,
                }
            ]
        },
    ];
};