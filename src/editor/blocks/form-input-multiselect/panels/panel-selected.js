import { __ } from '@wordpress/i18n';
import { ColorControl, DimensionControl } from 'gutenverse-core/controls';

export const selectedPanel = props => {
    const {
        elementId,
    } = props;

    return [
        {
            id: 'selectedColor',
            label: __('Selected Text Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'selectedColor',
                    'selector': `.${elementId} .choices .choices__list--multiple .choices__item.choices__item--selectable`,
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
            id: 'selectedBgColor',
            label: __('Selected Background Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'selectedBgColor',
                    'selector': `.${elementId} .choices .choices__list--multiple .choices__item.choices__item--selectable`,
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
            id: 'selectedBorderColor',
            label: __('Selected Border Color', 'gutenverse-form'),
            component: ColorControl,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'selectedBorderColor',
                    'selector': `.${elementId} .choices .choices__list--multiple .choices__item.choices__item--selectable`,
                    'properties': [
                        {
                            'name': 'border-color',
                            'valueType': 'direct'
                        }
                    ],
                },
                {
                    'type': 'color',
                    'id': 'selectedBorderColor',
                    'selector': `.${elementId} .choices .choices__list--multiple .choices__button`,
                    'properties': [
                        {
                            'name': 'border-left-color',
                            'valueType': 'direct'
                        }
                    ],
                }
            ]
        },
        {
            id: 'selectedRadius',
            label: __('Selected Border Radius', 'gutenverse-form'),
            component: DimensionControl,
            allowDeviceControl: true,
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
                ['%']: {
                    text: '%',
                    unit: '%'
                },
            },
        },
    ];
};