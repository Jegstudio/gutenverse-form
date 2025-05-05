import { BackgroundControl, SwitchControl } from 'gutenverse-core/controls';

export const buttonBackgroundPanel = (props) => {
    const {
        elementId,
        normalOptions,
        hoverOptions,
        switcher,
        setSwitcher
    } = props;

    return [
        {
            id: '__buttonBgHover',
            component: SwitchControl,
            options: [
                {
                    value: 'normal',
                    label: 'Normal'
                },
                {
                    value: 'hover',
                    label: 'Hover'
                }
            ],
            onChange: ({ __buttonBgHover }) => setSwitcher({ ...switcher, buttonBg: __buttonBgHover })
        },
        {
            id: 'buttonBackground',
            show: !switcher.buttonBg || switcher.buttonBg === 'normal',
            component: BackgroundControl,
            allowDeviceControl: true,
            options: normalOptions,
            liveStyle: [
                {
                    'type': 'background',
                    'id': 'buttonBackground',
                    'selector': `.${elementId}.guten-button-wrapper .guten-button`,
                }
            ]
        },
        {
            id: 'buttonBackgroundHover',
            show: switcher.buttonBg === 'hover',
            component: BackgroundControl,
            allowDeviceControl: true,
            options: hoverOptions,
            liveStyle: [
                {
                    'type': 'background',
                    'id': 'buttonBackgroundHover',
                    'selector': `.${elementId}.guten-button-wrapper .guten-button:hover`,
                }
            ]
        }
    ];
};