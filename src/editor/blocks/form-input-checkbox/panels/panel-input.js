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
            style: [
                {
                    selector: `.${elementId} .gutenverse-inner-input label`,
                    render: value => handleDimension(value, 'margin')
                }
            ]
        },
        {
            id: 'checkboxSize',
            label: __('Checkbox Size', 'gutenverse-form'),
            component: RangeControl,
            min: 1,
            max: 200,
            step: 1,
            style: [
                {
                    selector: `.${elementId} .gutenverse-inner-input label .check:before`,
                    render: value => `font-size: ${value}px;`
                }
            ]
        },
        {
            id: 'checkboxSpace',
            label: __('Checkbox Space', 'gutenverse-form'),
            component: RangeControl,
            min: 1,
            max: 200,
            step: 1,
            style: [
                {
                    selector: `.${elementId} .gutenverse-inner-input label .check:before`,
                    render: value => `margin-right: ${value}px;`
                }
            ]
        },
        {
            id: 'checkboxLabelColor',
            label: __('Checkbox Label Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .gutenverse-inner-input label`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'checkboxTypography',
            label: __('Checkbox Label Typography', 'gutenverse-form'),
            component: TypographyControl,
            style: [
                {
                    selector: `.${elementId} .main-wrapper label .check`,
                    hasChild: true,
                    render: (value, id) => handleTypography(value, props, id)
                }
            ],
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
            style: [
                {
                    selector: `.${elementId} .gutenverse-inner-input label .check:before`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'checkboxActiveColor',
            show: switcher.inputState === 'active',
            label: __('Checkbox Active Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .gutenverse-inner-input label input:checked + .check:before`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
    ];
};