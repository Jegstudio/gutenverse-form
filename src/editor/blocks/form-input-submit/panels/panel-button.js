import { __ } from '@wordpress/i18n';

import { AlignCenter, AlignLeft, AlignRight } from 'gutenverse-core/components';
import { CheckboxControl, DimensionControl, IconRadioControl, IconSVGControl, RangeControl, SelectControl, SizeControl, TextControl } from 'gutenverse-core/controls';
import { isNotEmpty } from 'gutenverse-core/helper';

export const buttonPanel = (props) => {
    const {
        elementId,
        showIcon,
        iconPosition,
        iconSpacing,
    } = props;


    return [
        {
            id: 'alignButton',
            label: __('Button Alignment', 'gutenverse-form'),
            component: IconRadioControl,
            allowDeviceControl: true,
            options: [
                {
                    label: __('Align Left', 'gutenverse-form'),
                    value: 'flex-start',
                    icon: <AlignLeft />,
                },
                {
                    label: __('Align Center', 'gutenverse-form'),
                    value: 'center',
                    icon: <AlignCenter />,
                },
                {
                    label: __('Align Right', 'gutenverse-form'),
                    value: 'flex-end',
                    icon: <AlignRight />,
                },
            ],
        },
        {
            id: 'ariaLabel',
            label: __('Aria Label', 'gutenverse-form'),
            component: TextControl,
        },
        {
            id: 'buttonType',
            label: __('Button Type'),
            component: SelectControl,
            options: [
                {
                    label: __('Default', 'gutenverse-form'),
                    value: 'default'
                },
                {
                    label: __('Info', 'gutenverse-form'),
                    value: 'info'
                },
                {
                    label: __('Success', 'gutenverse-form'),
                    value: 'success'
                },
                {
                    label: __('Warning', 'gutenverse-form'),
                    value: 'warning'
                },
                {
                    label: __('Danger', 'gutenverse-form'),
                    value: 'danger'
                },
            ]
        },
        {
            id: 'buttonSize',
            label: __('Button Size'),
            component: SelectControl,
            options: [
                {
                    label: __('Extra Small', 'gutenverse-form'),
                    value: 'xs'
                },
                {
                    label: __('Small', 'gutenverse-form'),
                    value: 'sm'
                },
                {
                    label: __('Medium', 'gutenverse-form'),
                    value: 'md'
                },
                {
                    label: __('Large', 'gutenverse-form'),
                    value: 'lg'
                },
                {
                    label: __('Extra Large', 'gutenverse-form'),
                    value: 'xl'
                },
            ]
        },
        {
            id: 'buttonWidth',
            label: __('Set Width', 'gutenverse-form'),
            component: RangeControl,
            allowDeviceControl: true,
            unit: '%',
            min: 0,
            max: 100,
            step: 1,
        },
        {
            id: 'showIcon',
            label: __('Show Icon', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'icon',
            label: __('Icon', 'gutenverse-form'),
            show: showIcon,
            component: IconSVGControl,
        },
        {
            id: 'iconPosition',
            label: __('Icon Position'),
            show: showIcon,
            component: SelectControl,
            options: [
                {
                    label: __('Before', 'gutenverse-form'),
                    value: 'before'
                },
                {
                    label: __('After', 'gutenverse-form'),
                    value: 'after'
                },
            ],
        },
        {
            id: 'iconSpacing',
            label: __('Icon Spacing', 'gutenverse-form'),
            show: showIcon,
            component: RangeControl,
            allowDeviceControl: true,
            unit: 'px',
            min: 0,
            max: 50,
            step: 1,
            liveStyle: [
                isNotEmpty(iconPosition) && isNotEmpty(iconSpacing) && {
                    'type': 'plain',
                    'id': 'iconSpacing',
                    'responsive': true,
                    'selector': `.${elementId} .guten-button i`,
                    'properties': [
                        {
                            'name': iconPosition === 'after' ? 'margin-left' : 'margin-right',
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
            id: 'iconSize',
            label: __('Icon Size', 'gutenverse-form'),
            component: SizeControl,
            allowDeviceControl: true,
            show: showIcon,
            units: {
                px: {
                    text: 'px',
                    min: 1,
                    max: 100,
                    step: 1
                },
                em: {
                    text: 'em',
                    min: 0.1,
                    max: 3,
                    step: 0.1
                },
            },
            liveStyle: [
                {
                    'type': 'unitPoint',
                    'id': 'iconSize',
                    'properties': [
                        {
                            'name': 'font-size',
                            'valueType': 'direct'
                        }
                    ],
                    'selector': `.${elementId} .guten-button i`,
                    'responsive': true
                }
            ]
        },
        {
            id: 'paddingButton',
            label: __('Button Padding', 'gutenverse-form'),
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
                rem: {
                    text: 'rem',
                    unit: 'rem'
                },
            },
        },
        {
            id: 'iconLineHeight',
            label: __('Remove Icon Line Height', 'gutenverse'),
            component: CheckboxControl,
        },
    ];
};