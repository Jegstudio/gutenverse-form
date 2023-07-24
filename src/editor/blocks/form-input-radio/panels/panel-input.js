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
            label: __('Option Display', 'gutenverse'),
            description: __('Select how options are stacked', 'gutenverse'),
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
            label: __('Label Space', 'gutenverse'),
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
            id: 'radioSize',
            label: __('Radio Size', 'gutenverse'),
            component: RangeControl,
            min: 1,
            max: 200,
            step: 1,
            style: [
                {
                    selector: `.${elementId} .gutenverse-inner-input label .radio:before`,
                    render: value => `font-size: ${value}px;`
                }
            ]
        },
        {
            id: 'radioSpace',
            label: __('Radio Space', 'gutenverse'),
            component: RangeControl,
            min: 1,
            max: 200,
            step: 1,
            style: [
                {
                    selector: `.${elementId} .gutenverse-inner-input label .radio:before`,
                    render: value => `margin-right: ${value}px;`
                }
            ]
        },
        {
            id: 'radioLabelColor',
            label: __('Radio Label Color', 'gutenverse'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .gutenverse-inner-input label`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'radioTypography',
            label: __('Radio Typography', 'gutenverse'),
            component: TypographyControl,
            style: [
                {
                    selector: `.${elementId} .main-wrapper label .radio`,
                    hasChild: true,
                    render: (value,id) => handleTypography(value, props, id)
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
            id: 'radioColor',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Radio Color', 'gutenverse'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .gutenverse-inner-input label .radio:before`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'radioActiveColor',
            show: switcher.inputState === 'active',
            label: __('Radio Active Color', 'gutenverse'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .gutenverse-inner-input label input:checked + .radio:before`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
    ];
};