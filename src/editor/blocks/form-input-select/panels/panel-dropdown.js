import { __ } from '@wordpress/i18n';
import { CheckboxControl, ColorControl, IconSVGControl, RangeControl, SVGControl } from 'gutenverse-core/controls';

export const panelDropdown = props => {
    const {
        useDropDownIcon,
        dropDownDisableIconRemove,
        dropDownIconRemove,
        elementId
    } = props;

    return [
        {
            id: 'useCustomDropdown',
            label: __('Custom Dropdown Icon', 'gutenverse-form'),
            component: CheckboxControl,
            description: __('Check this to change dropdown icon', 'gutenverse-form'),
        },
        {
            id: 'dropDownIconOpen',
            show: useDropDownIcon,
            label: __('Icon Open', 'gutenverse-form'),
            component: IconSVGControl,
        },
        {
            id: 'dropDownIconOpenColor',
            label: __('Open Icon Color', 'gutenverse-form'),
            show: useDropDownIcon,
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'dropDownIconOpenColor',
                    'selector': `.${elementId} .choices.custom-dropdown .choices__inner i, .${elementId} .choices.custom-dropdown .choices__inner svg`,
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
            id: 'dropDownIconOpenSize',
            label: __('Open Icon Size', 'gutenverse-form'),
            show: useDropDownIcon,
            component: RangeControl,
            min: 1,
            max: 200,
            step: 1,
            allowDeviceControl: true,
            unit: 'px',
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'dropDownIconOpenSize',
                    'responsive': true,
                    'selector': `.${elementId} .choices.custom-dropdown .choices__inner i, .${elementId} .choices.custom-dropdown .choices__inner svg`,
                    'properties': [
                        {
                            'name': 'font-size',
                            'valueType': 'pattern',
                            'pattern': '{value}px',
                            'patternValues': {
                                'value': {
                                    'type': 'direct',
                                }
                            }
                        }
                    ],
                }
            ]
        },
        {
            id: 'dropDownIconClose',
            show: useDropDownIcon,
            label: __('Icon Close', 'gutenverse-form'),
            component: IconSVGControl,
        },
        {
            id: 'dropDownIconCloseColor',
            label: __('Close Icon Color', 'gutenverse-form'),
            show: useDropDownIcon,
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'dropDownIconCloseColor',
                    'selector': `.${elementId} .choices.custom-dropdown.is-open .choices__inner i, .${elementId} .choices.custom-dropdown.is-open .choices__inner svg`,
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
            id: 'dropDownIconCloseSize',
            label: __('Close Icon Size', 'gutenverse-form'),
            show: useDropDownIcon,
            component: RangeControl,
            min: 1,
            max: 200,
            step: 1,
            allowDeviceControl: true,
            unit: 'px',
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'dropDownIconCloseSize',
                    'responsive': true,
                    'selector': `.${elementId} .choices.custom-dropdown.is-open .choices__inner i, .${elementId} .choices.custom-dropdown.is-open .choices__inner svg`,
                    'properties': [
                        {
                            'name': 'font-size',
                            'valueType': 'pattern',
                            'pattern': '{value}px',
                            'patternValues': {
                                'value': {
                                    'type': 'direct',
                                }
                            }
                        }
                    ],
                }
            ]
        },
        {
            id: 'dropDownDisableIconRemove',
            label: __('Disable Remove Icon', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'dropDownIconRemoveOffset',
            label: __('Remove Icon Offset', 'gutenverse-form'),
            show: !dropDownDisableIconRemove && '' !== dropDownIconRemove,
            component: RangeControl,
            min: 1,
            max: 500,
            step: 1,
            allowDeviceControl: true,
            unit: 'px',
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'dropDownIconRemoveOffset',
                    'responsive': true,
                    'selector': `.${elementId}.guten-element.guten-form-input-select .choices[data-type*=select-one] .choices__button`,
                    'properties': [
                        {
                            'name': 'margin-right',
                            'valueType': 'pattern',
                            'pattern': '{value}px',
                            'patternValues': {
                                'value': {
                                    'type': 'direct',
                                }
                            }
                        }
                    ],
                }
            ]
        },
        {
            id: 'dropDownIconRemove',
            label: __('Remove Icon', 'gutenverse-form'),
            show: !dropDownDisableIconRemove,
            component: SVGControl,
        },
        {
            id: 'dropDownIconRemoveColor',
            label: __('Remove Icon Color', 'gutenverse-form'),
            show: !dropDownDisableIconRemove && '' !== dropDownIconRemove,
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'dropDownIconRemoveColor',
                    'selector': `.${elementId}.guten-element.guten-form-input-select .choices[data-type*=select-one] .choices__button`,
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
            id: 'dropDownIconRemoveSize',
            label: __('Remove Icon Size', 'gutenverse-form'),
            show: !dropDownDisableIconRemove && '' !== dropDownIconRemove,
            component: RangeControl,
            min: 1,
            max: 20,
            step: 1,
            allowDeviceControl: true,
            unit: 'px',
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'dropDownIconRemoveSize',
                    'responsive': true,
                    'selector': `.${elementId}.guten-element.guten-form-input-select .choices[data-type*=select-one] .choices__button`,
                    'properties': [
                        {
                            'name': 'font-size',
                            'valueType': 'pattern',
                            'pattern': '{value}px',
                            'patternValues': {
                                'value': {
                                    'type': 'direct',
                                }
                            }
                        }
                    ],
                }
            ]
        },
    ];
};