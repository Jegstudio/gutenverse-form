import { __ } from '@wordpress/i18n';
import { CheckboxControl, ColorControl, IconSVGControl, RangeControl} from 'gutenverse-core/controls';

export const panelDropdown = props => {
    const {
        useDropDownIcon,
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
                    'id' : 'dropDownIconOpenColor',
                    'selector': `.${elementId} .choices.custom-dropdown .choices__inner i`,
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
                    'selector': `.${elementId} .choices.custom-dropdown .choices__inner i`,
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
                    'selector': `.${elementId} .choices.custom-dropdown.is-open .choices__inner i`,
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
                    'selector': `.${elementId} .choices.custom-dropdown.is-open .choices__inner i`,
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