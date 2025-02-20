import { __ } from '@wordpress/i18n';
import { ColorControl, DimensionControl, RangeControl, SelectControl, SwitchControl, TypographyControl } from 'gutenverse-core/controls';
import { handleDimension, handleColor, handleTypography } from 'gutenverse-core/styling';

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
            id: 'checkboxSize',
            label: __('Checkbox Size', 'gutenverse-form'),
            component: RangeControl,
            unit: 'px',
            min: 1,
            max: 200,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'checkboxSize',
                    'selector': `.${elementId} .gutenverse-inner-input label .check:before`,
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
            id: 'checkboxSpace',
            label: __('Checkbox Space', 'gutenverse-form'),
            component: RangeControl,
            unit: 'px',
            min: 1,
            max: 200,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'checkboxSpace',
                    'selector': `.${elementId} .gutenverse-inner-input label .check:before`,
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
            id: 'checkboxLabelColor',
            label: __('Checkbox Label Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'checkboxLabelColor',
                    'selector': `.${elementId} .gutenverse-inner-input label`,
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
            id: 'checkboxTypography',
            label: __('Checkbox Label Typography', 'gutenverse-form'),
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
            id: 'checkboxColor',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Checkbox Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'checkboxColor',
                    'selector': `.${elementId} .gutenverse-inner-input label .check:before`,
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
            id: 'checkboxActiveColor',
            show: switcher.inputState === 'active',
            label: __('Checkbox Active Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'checkboxActiveColor',
                    'selector': `.${elementId} .gutenverse-inner-input label input:checked + .check:before`,
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