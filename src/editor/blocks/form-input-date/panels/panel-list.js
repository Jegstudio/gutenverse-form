import { __ } from '@wordpress/i18n';
import { advancePanel, animationPanel, backgroundPanel, borderPanel, maskPanel, mouseMoveEffectPanel, positioningPanel, responsivePanel, transformPanel } from 'gutenverse-core/controls';
import { contentPanel } from '../../form-input/general/panels/panel-content';
import { labelPanel } from '../../form-input/general/panels/panel-label';
import { mainPanel } from '../../form-input/general/panels/panel-main';
import { inputPanel } from './panel-input';
import { panelInputSettings } from './panel-input-settings';
import { TabSetting, TabStyle } from 'gutenverse-core/controls';
import { panelLogic } from '../../form-input/general/panels/panel-logic';

export const panelList = () => {
    return [
        {
            title: __('Content', 'gutenverse-form'),
            panelArray: contentPanel,
            initialOpen: true,
            tabRole: TabSetting,
        },
        {
            title: __('Input Settings', 'gutenverse-form'),
            panelArray: panelInputSettings,
            initialOpen: false,
            tabRole: TabSetting,
        },
        {
            title: __('Logic', 'gutenverse-form'),
            panelArray: panelLogic,
            pro: true,
            initialOpen: false,
        },
        {
            title: __('Label Style', 'gutenverse-form'),
            panelArray: labelPanel,
            initialOpen: false,
            tabRole: TabStyle,
        },
        {
            title: __('Main Wrapper', 'gutenverse-form'),
            panelArray: mainPanel,
            initialOpen: false,
            tabRole: TabStyle,
        },
        {
            title: __('Input Style', 'gutenverse-form'),
            panelArray: inputPanel,
            initialOpen: false,
            tabRole: TabStyle,
        },
        {
            title: __('Background', 'gutenverse-form'),
            initialOpen: false,
            panelArray: (props) => backgroundPanel({
                ...props,
                styleId: 'form-input-text-background',
                normalOptions: ['default', 'gradient'],
                hoverOptions: ['default', 'gradient'],
            }),
            tabRole: TabStyle
        },
        {
            title: __('Border', 'gutenverse-form'),
            initialOpen: false,
            panelArray: (props) => borderPanel({
                ...props,
                styleId: 'form-input-text-border',
            }),
            tabRole: TabStyle
        },
        {
            title: __('Masking', 'gutenverse-form'),
            initialOpen: false,
            panelArray: maskPanel,
            tabRole: TabStyle
        },
        {
            title: __('Display', 'gutenverse-form'),
            initialOpen: false,
            panelArray: responsivePanel,
            tabRole: TabSetting
        },
        {
            title: __('Positioning', 'gutenverse-form'),
            initialOpen: false,
            panelArray: positioningPanel,
            tabRole: TabSetting
        },
        {
            title: __('Animation Effects', 'gutenverse-form'),
            initialOpen: false,
            panelArray: (props) => animationPanel({
                ...props,
                styleId: 'form-input-text-animation'
            }),
            tabRole: TabSetting
        },
        {
            title: __('Transform', 'gutenverse-form'),
            initialOpen: false,
            panelArray: transformPanel,
            pro: true
        },
        {
            title: __('Mouse Move Effect', 'gutenverse-form'),
            initialOpen: false,
            panelArray: mouseMoveEffectPanel,
            tabRole: TabSetting,
            pro: true,
        },
        {
            title: __('Spacing', 'gutenverse-form'),
            initialOpen: false,
            panelArray: (props) => advancePanel({
                ...props,
                styleId: 'form-input-text-advance',
            }),
            tabRole: TabSetting
        }
    ];
};