import { __ } from '@wordpress/i18n';
import { AlignCenter, AlignLeft, AlignRight } from 'gutenverse-core/components';
import { ColorControl, DimensionControl, IconRadioControl, RangeControl, SelectControl, SwitchControl, TextControl, TypographyControl } from 'gutenverse-core/controls';

export const settingsPanel = props => {
    const {
        elementId,
        setSwitcher,
        switcher
    } = props;

    return [
        {
            id: 'alignment',
            label: __('Alignment', 'gutenverse-form'),
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
            id: 'buttonText',
            label: __('Text Button', 'gutenverse-form'),
            component: TextControl,
        },
        {
            id: 'inputPlaceholder',
            label: __('Placeholder', 'gutenverse-form'),
            component: TextControl,
        },
    ];
};