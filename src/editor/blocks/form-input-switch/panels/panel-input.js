import { __ } from '@wordpress/i18n';
import { ColorControl, RangeControl, TextControl, TypographyControl } from 'gutenverse-core/controls';
import { handleColor, handleTypography } from 'gutenverse-core/styling';

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
            min: 1,
            max: 200,
            step: 1,
            style: [
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch`,
                    render: value => `width: ${value}px;`
                },
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper input:checked + .switch::after`,
                    render: value => {
                        const result = parseInt(value) - parseInt(switcherHeight);
                        return `transform: translate3d(${result}px, -50%, 0);`;
                    }
                },
            ]
        },
        {
            id: 'switcherHeight',
            label: __('Switcher Height', 'gutenverse-form'),
            component: RangeControl,
            min: 1,
            max: 200,
            step: 1,
            style: [
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch`,
                    render: value => `height: ${value}px;`
                },
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch::after`,
                    render: value => `height: ${value - 4}px;`
                },
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch::after`,
                    render: value => `width: ${value - 4}px;`
                },
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper input:checked + .switch::after`,
                    updateID: 'switcherWidth-style-1',
                    render: value => {
                        const result = parseInt(switcherWidth) - parseInt(value);
                        return `transform: translate3d(${result}px, -50%, 0);`;
                    }
                },
            ]
        },
        {
            id: 'switchTypography',
            label: __('Input Typography', 'gutenverse-form'),
            component: TypographyControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch::before`,
                    hasChild: true,
                    render: (value, id) => handleTypography(value, props, id)
                },
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper input:checked + .switch::before`,
                    hasChild: true,
                    render: (value, id) => handleTypography(value, props, id)
                }
            ],
        },


        {
            id: 'offBackground',
            label: __('Off Background Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch`,
                    render: value => handleColor(value, 'background-color')
                }
            ],
        },
        {
            id: 'offButton',
            label: __('Off Button Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch::after`,
                    render: value => handleColor(value, 'background-color')
                }
            ],
        },
        {
            id: 'offTextColor',
            label: __('Off Text Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper .switch`,
                    render: value => handleColor(value, 'color')
                }
            ],
        },
        {
            id: 'onBackground',
            label: __('On Background Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper input:checked + .switch`,
                    render: value => handleColor(value, 'background-color')
                }
            ],
        },
        {
            id: 'onButton',
            label: __('On Button Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper input:checked + .switch::after`,
                    render: value => handleColor(value, 'background-color')
                }
            ],
        },
        {
            id: 'onTextColor',
            label: __('On Text Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input.guten-form-input-switch .switch-wrapper input:checked + .switch::before`,
                    render: value => handleColor(value, 'color')
                }
            ],
        },
    ];
};