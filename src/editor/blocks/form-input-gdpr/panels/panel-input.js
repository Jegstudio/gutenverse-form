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
            id: 'wrapperMargin',
            label: __('Wrapper Margin', 'gutenverse-form'),
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
                    selector: `.${elementId} .gutenverse-inner-input .guten-gdpr-wrapper`,
                    render: value => handleDimension(value, 'margin')
                }
            ]
        },
        {
            id: 'gdprSize',
            label: __('Checkbox Size', 'gutenverse-form'),
            component: RangeControl,
            unit: 'px',
            min: 1,
            max: 200,
            step: 1,
            style: [
                {
                    selector: `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .guten-gdpr-input-wrapper .check:before`,
                    render: value => `font-size: ${value}px;`
                }
            ]
        },
        {
            id: 'gdprSpace',
            label: __('Checkbox Space', 'gutenverse-form'),
            component: RangeControl,
            unit: 'px',
            min: 1,
            max: 200,
            step: 1,
            style: [
                {
                    selector: `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .guten-gdpr-input-wrapper .check:before`,
                    render: value => `margin-right: ${value}px;`
                }
            ]
        },
        {
            id: 'gdprLabelColor',
            label: __('Checkbox Label Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .gdpr-label`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'gdprTypography',
            label: __('Checkbox Label Typography', 'gutenverse-form'),
            component: TypographyControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .gdpr-label`,
                    hasChild: true,
                    render: (value, id) => handleTypography(value, props, id)
                }
            ],
        },
        {
            id: 'gdprLinkColor',
            label: __('Checkbox Link Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .gdpr-label a`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'gdprLinkTypography',
            label: __('Checkbox Link Typography', 'gutenverse-form'),
            component: TypographyControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .gdpr-label a`,
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
            id: 'gdprColor',
            show: !switcher.inputState || switcher.inputState === 'normal',
            label: __('Checkbox Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .guten-gdpr-input-wrapper .check:before`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
        {
            id: 'gdprActiveColor',
            show: switcher.inputState === 'active',
            label: __('Checkbox Active Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId}.guten-form-input-gdpr .main-wrapper .gutenverse-inner-input .guten-gdpr-wrapper .guten-gdpr-input-wrapper input:checked + .check:before`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
    ];
};