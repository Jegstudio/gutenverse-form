import { __ } from '@wordpress/i18n';

import { AlignCenter, AlignLeft, AlignRight } from 'gutenverse-core/components';
import { CheckboxControl, DimensionControl, IconRadioControl, RangeControl, SelectControl, SizeControl } from 'gutenverse-core/controls';
import { deviceStyleValue, handleDimension, handleUnitPoint } from 'gutenverse-core/styling';
import { getDeviceType } from 'gutenverse-core/editor-helper';
import { isEmpty } from 'lodash';

export const buttonPanel = (props) => {
    const {
        elementId,
        showIcon,
        iconPosition,
        iconSpacing,
    } = props;

    const device = getDeviceType();

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
            style: [
                {
                    selector: `.${elementId}`,
                    render: value => `justify-content: ${value};`
                }
            ]
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
            style: [
                {
                    selector: `.${elementId} .guten-button`,
                    render: value => `width: ${value}%;`
                }
            ]
        },
        {
            id: 'showIcon',
            label: __('Show Icon', 'gutenverse-form'),
            component: CheckboxControl,
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
            style: [
                {
                    selector: `.${elementId} .guten-button i`,
                    updateID: 'iconSpacing-style-0',
                    render: value => !isEmpty(iconSpacing) && value === 'after' ? `margin-left: ${deviceStyleValue(device, iconPosition)}px;` : `margin-right: ${deviceStyleValue(device, iconPosition)}px;`
                }
            ]
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
            style: [
                {
                    selector: `.${elementId} .guten-button i`,
                    render: value => iconPosition === 'after' ? `margin-left: ${value}px;` : `margin-right: ${value}px;`
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
            style: [
                {
                    selector: `.${elementId} .guten-button i`,
                    render: value => handleUnitPoint(value, 'font-size')
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
            style: [
                {
                    selector: `.${elementId} .guten-button`,
                    render: value => handleDimension(value, 'padding')
                }
            ]
        },
        {
            id: 'iconLineHeight',
            label: __('Remove Icon Line Height', 'gutenverse'),
            component: CheckboxControl,
            style: [
                {
                    selector: `.editor-styles-wrapper .${elementId}.guten-button-wrapper .guten-button i`,
                    allowRender: value => value,
                    render: () => 'line-height: normal',
                }
            ]
        },
    ];
};