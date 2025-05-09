import { __ } from '@wordpress/i18n';
import { BackgroundControl, BorderResponsiveControl, BoxShadowControl, ColorControl, DimensionControl, SwitchControl, TypographyControl } from 'gutenverse-core/controls';
import { getDeviceType } from 'gutenverse-core/editor-helper';

export const optionPanel = props => {
    const {
        elementId,
        setSwitcher,
        switcher
    } = props;

    const device = getDeviceType();

    return [
        {
            id: 'choicesPadding',
            label: __('Options Padding', 'gutenverse-form'),
            component: DimensionControl,
            position: ['top', 'right', 'bottom', 'left'],
            allowDeviceControl: true,
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
        },
        {
            id: 'choicesMargin',
            label: __('Options Margin', 'gutenverse-form'),
            component: DimensionControl,
            position: ['top', 'right', 'bottom', 'left'],
            allowDeviceControl: true,
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
        },
        {
            id: 'choicesTypography',
            label: __('Options Typography', 'gutenverse-form'),
            component: TypographyControl,
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
                    value: 'hover',
                    label: 'Hover'
                },
                {
                    value: 'selected',
                    label: 'Selected'
                },
            ],
            onChange: ({ __itemState }) => setSwitcher({ ...switcher, choicesState: __itemState })
        },
        //normal
        {
            id: 'choicesColorNormal',
            show: !switcher.choicesState || switcher.choicesState === 'normal',
            label: __('Options Text Color Normal', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'choicesColorNormal',
                    'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                    'responsive': true,
                }
            ]
        },
        {
            id: 'choicesBackgroundNormal',
            show: (!switcher.choicesState || switcher.choicesState === 'normal'),
            component: BackgroundControl,
            allowDeviceControl: true,
            options: ['default', 'gradient'],
            liveStyle: [
                {
                    'id': 'choicesBackgroundNormal',
                    'type': 'background',
                    'responsive': true,
                    'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable`,
                }
            ],
        },
        {
            id: 'choicesBorderNormal',
            show: (!switcher.choicesState || switcher.choicesState === 'normal'),
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
        },
        //hover
        {
            id: 'choicesColorHover',
            show: switcher.choicesState === 'hover',
            label: __('Options Text Color Hover', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'choicesColorHover',
                    'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-highlighted`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                    'responsive': true,
                }
            ]
        },
        {
            id: 'choicesBackgroundHover',
            show: switcher.choicesState === 'hover',
            component: BackgroundControl,
            allowDeviceControl: true,
            options: ['default', 'gradient'],
            liveStyle: [
                {
                    'id': 'choicesBackgroundHover',
                    'type': 'background',
                    'responsive': true,
                    'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-highlighted`,
                }
            ],
        },
        {
            id: 'choicesBorderHover',
            show: switcher.choicesState === 'hover',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
        },
        //Selected
        {
            id: 'choicesColorSelected',
            show: switcher.choicesState === 'selected',
            label: __('Options Text Color Selected', 'gutenverse-form'),
            component: ColorControl,
            allowDeviceControl: true,
            liveStyle: [
                {
                    'type': 'color',
                    'id': 'choicesColorSelected',
                    'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-selected`,
                    'properties': [
                        {
                            'name': 'color',
                            'valueType': 'direct'
                        }
                    ],
                    'responsive': true,
                }
            ]
        },
        {
            id: 'choicesBackgroundSelected',
            show: switcher.choicesState === 'selected',
            component: BackgroundControl,
            allowDeviceControl: true,
            options: ['default', 'gradient'],
            liveStyle: [
                {
                    'id': 'choicesBackgroundSelected',
                    'type': 'background',
                    'responsive': true,
                    'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-selected`,
                }
            ],
        },
        {
            id: 'choicesBorderSelected',
            show: switcher.choicesState === 'selected',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
        },
    ];
};