import { __ } from '@wordpress/i18n';
import { ColorControl, RangeControl, TextControl, TypographyControl } from 'gutenverse-core/controls';

export const inputPanel = props => {
    const {
        elementId,
        switcherHeight,
        switcherWidth,
    } = props;

    return [
        {
            id: 'offText',
            label: __('OFF Text', 'gutenverse-form'),
            component: TextControl,
        },
        {
            id: 'onText',
            label: __('ON Text', 'gutenverse-form'),
            component: TextControl,
        },
        {
            id: 'switcherWidth',
            label: __('Switcher Width', 'gutenverse-form'),
            component: RangeControl,
            unit: 'px',
            min: 1,
            max: 200,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'switcherWidth',
                    'selector': `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch`,
                    'properties': [
                        {
                            'name': 'width',
                            'valueType': 'pattern',
                            'pattern': '{value}px',
                            'patternValues': {
                                'value': {
                                    'type': 'direct',
                                },

                            }
                        }
                    ],
                },
                {
                    'type': 'plain',
                    'id': 'switcherWidth',
                    'selector': `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper input:checked + .switch::after`,
                    'otherAttribute': {
                        'height': switcherHeight,
                        'width': switcherWidth
                    },
                    'properties': [
                        {
                            'name': 'transform',
                            'valueType': 'function',
                            'functionName': 'switcherWidthHeight'
                        }
                    ],
                }
            ]
        },
        {
            id: 'switcherHeight',
            label: __('Switcher Height', 'gutenverse-form'),
            component: RangeControl,
            unit: 'px',
            min: 1,
            max: 200,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'switcherHeight',
                    'selector': `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch::after`,
                    'properties': [
                        {
                            'name': 'width',
                            'valueType': 'pattern',
                            'pattern': 'calc({value}px - 4px)',
                            'patternValues': {
                                'value': {
                                    'type': 'direct',
                                },

                            }
                        }
                    ],
                },
                {
                    'type': 'plain',
                    'id': 'switcherHeight',
                    'selector': `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch::after`,
                    'properties': [
                        {
                            'name': 'height',
                            'valueType': 'pattern',
                            'pattern': 'calc({value}px - 4px)',
                            'patternValues': {
                                'value': {
                                    'type': 'direct',
                                },

                            }
                        }
                    ],
                },
                {
                    'type': 'plain',
                    'id': 'switcherHeight',
                    'selector': `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch`,
                    'properties': [
                        {
                            'name': 'height',
                            'valueType': 'pattern',
                            'pattern': '{value}px',
                            'patternValues': {
                                'value': {
                                    'type': 'direct',
                                },

                            }
                        }
                    ],
                },
                {
                    'type': 'plain',
                    'id': 'switcherWidth',
                    'selector': `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper input:checked + .switch::after`,
                    'otherAttribute': {
                        'height': switcherHeight,
                        'width': switcherWidth
                    },
                    'properties': [
                        {
                            'name': 'transform',
                            'valueType': 'function',
                            'functionName': 'switcherWidthHeight'
                        }
                    ],
                }
            ]
        },
        {
            id: 'switchTypography',
            label: __('Input Typography', 'gutenverse-form'),
            component: TypographyControl,
        },
        {
            id: 'offBackground',
            label: __('Off Background Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'offBackground',
                    'selector': `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch`,
                    'properties': [
                        {
                            'name': 'background-color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'offButton',
            label: __('Off Button Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'offButton',
                    'selector': `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch::after`,
                    'properties': [
                        {
                            'name': 'background-color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'offTextColor',
            label: __('Off Text Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'offTextColor',
                    'selector': `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch`,
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
            id: 'onBackground',
            label: __('On Background Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'onBackground',
                    'selector': `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper input:checked + .switch`,
                    'properties': [
                        {
                            'name': 'background-color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'onButton',
            label: __('On Button Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'onButton',
                    'selector': `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper input:checked + .switch::after`,
                    'properties': [
                        {
                            'name': 'background-color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'onTextColor',
            label: __('On Text Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'onTextColor',
                    'selector': `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper input:checked + .switch::before`,
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