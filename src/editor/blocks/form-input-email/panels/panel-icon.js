import { __ } from '@wordpress/i18n';
import { CheckboxControl, ImageControl, RangeControl, SelectControl, TextControl } from 'gutenverse-core/controls';

export const panelIcon = (props) => {
    const {
        elementId,
        iconType,
        useIcon,
    } = props;

    return [
        {
            id: 'useIcon',
            label: __('Show Icon', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'iconAlignment',
            label: __('Icon Alignment', 'gutenverse-form'),
            component: SelectControl,
            show: useIcon,
            options: [
                {
                    value: 'left',
                    label: 'Left'
                },
                {
                    value: 'right',
                    label: 'Right'
                },
            ],
        },
        {
            id: 'iconType',
            label: __('Icon Type', 'gutenverse-form'),
            component: SelectControl,
            show: useIcon,
            options: [
                {
                    value: 'none',
                    label: 'None'
                },
                {
                    value: 'icon',
                    label: 'Icon'
                },
                {
                    value: 'image',
                    label: 'Image'
                },
            ],
        },
        {
            id: 'iconSize',
            show: iconType && iconType === 'icon' && useIcon,
            label: __('Icon Size', 'gutenverse-form'),
            component: RangeControl,
            allowDeviceControl: true,
            min: 1,
            max: 200,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'iconSize',
                    'responsive': true,
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-email-icon .icon i`,
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
            id: 'image',
            show: iconType && iconType === 'image' && useIcon,
            label: __('Icon Type', 'gutenverse-form'),
            component: ImageControl,
        },
        {
            id: 'lazyLoad',
            show: iconType && iconType === 'image' && useIcon,
            label: __('Set Lazy Load', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'imageAlt',
            show: iconType && iconType === 'image' && useIcon,
            label: __('Image Alt', 'gutenverse-form'),
            component: TextControl,
        },
        {
            id: 'imageWidth',
            show: iconType && iconType === 'image' && useIcon,
            label: __('Image Width', 'gutenverse-form'),
            component: RangeControl,
            allowDeviceControl: true,
            min: 1,
            max: 400,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'imageWidth',
                    'responsive': true,
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-email-icon .icon`,
                    'properties': [
                        {
                            'name': 'width',
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
            id: 'imageHeight',
            show: iconType && iconType === 'image' && useIcon,
            label: __('Image Height', 'gutenverse-form'),
            component: RangeControl,
            allowDeviceControl: true,
            min: 1,
            max: 400,
            step: 1,
            liveStyle: [
                {
                    'type': 'plain',
                    'id': 'imageHeight',
                    'responsive': true,
                    'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-email-icon .icon`,
                    'properties': [
                        {
                            'name': 'height',
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

