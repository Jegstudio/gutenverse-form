import { __ } from '@wordpress/i18n';
import { BackgroundControl, BorderResponsiveControl, BoxShadowControl, DimensionControl, SwitchControl } from 'gutenverse-core/controls';
import { getDeviceType } from 'gutenverse-core/editor-helper';

export const optionPanelWrapper = props => {
    const {
        elementId,
        setSwitcher,
        switcher
    } = props;

    const device = getDeviceType();

    return [
        {
            id: 'choicesWrapperPadding',
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
            id: 'choicesWrapperMargin',
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
            id: '__wrapperState',
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
            ],
            onChange: ({ __wrapperState }) => setSwitcher({ ...switcher, choicesWrapperState: __wrapperState })
        },
        //normal
        {
            id: 'choicesWrapperBackgroundNormal',
            show: (!switcher.choicesWrapperState || switcher.choicesWrapperState === 'normal'),
            component: BackgroundControl,
            allowDeviceControl: true,
            options: ['default', 'gradient'],
            liveStyle: [
                {
                    'id': 'choicesWrapperBackgroundNormal',
                    'type': 'background',
                    'responsive': true,
                    'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable`,
                }
            ],
        },
        {
            id: 'choicesWrapperBorderNormal',
            show: (!switcher.choicesWrapperState || switcher.choicesWrapperState === 'normal'),
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
        },
        {
            id: 'choicesWrapperShadowNormal',
            show: (!switcher.choicesWrapperState || switcher.choicesWrapperState === 'normal'),
            label: __('Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
            liveStyle: [
                {
                    'type': 'boxShadow',
                    'id': 'choicesWrapperShadowNormal',
                    'properties': [
                        {
                            'name': 'box-shadow',
                            'valueType': 'direct'
                        }
                    ],
                    'selector': `.${elementId} .choices .choices__inner, .${elementId} .choices .choices__list.choices__list--dropdown`,
                }
            ]
        },
        //hover
        {
            id: 'choicesWrapperBackgroundHover',
            show: switcher.choicesWrapperState === 'hover',
            component: BackgroundControl,
            allowDeviceControl: true,
            options: ['default', 'gradient'],
            liveStyle: [
                {
                    'id': 'choicesWrapperBackgroundHover',
                    'type': 'background',
                    'responsive': true,
                    'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-highlighted`,
                }
            ],
        },
        {
            id: 'choicesWrapperBorderHover',
            show: switcher.choicesWrapperState === 'hover',
            label: __('Border', 'gutenverse-form'),
            component: BorderResponsiveControl,
            allowDeviceControl: true,
        },
        {
            id: 'choicesWrapperShadowHover',
            show: switcher.choicesWrapperState === 'hover',
            label: __('Box Shadow', 'gutenverse-form'),
            component: BoxShadowControl,
            liveStyle: [
                {
                    'type': 'boxShadow',
                    'id': 'choicesWrapperShadowHover',
                    'properties': [
                        {
                            'name': 'box-shadow',
                            'valueType': 'direct'
                        }
                    ],
                    'selector': `.${elementId} .choices .choices__inner, .${elementId} .choices .choices__list.choices__list--dropdown`,
                }
            ]
        },
    ];
};