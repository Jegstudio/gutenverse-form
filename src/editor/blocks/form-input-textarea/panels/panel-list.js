import { __ } from '@wordpress/i18n';
import { advancePanel, animationPanel, backgroundPanel, borderPanel, maskPanel, positioningPanel, responsivePanel, transformPanel } from 'gutenverse-core/controls';
import { contentPanel } from '../../form-input/general/panels/panel-content';
import { labelPanel } from '../../form-input/general/panels/panel-label';
import { mainPanel } from '../../form-input/general/panels/panel-main';
import { panelRules } from './panel-rules';
import { inputPanel } from './panel-input';
import { TabSetting, TabStyle } from 'gutenverse-core/controls';
import { panelLogic } from '../../form-input/general/panels/panel-logic';


export const panelList = () => {
    return [
        {
            title: __('Content', 'gutenverse'),
            panelArray: contentPanel,
            initialOpen: true,
            tabRole: TabSetting
        },
        {
            title: __('Validation', 'gutenverse'),
            panelArray: panelRules,
            initialOpen: false,
            tabRole: TabSetting
        },
        {
            title: __('Logic', 'gutenverse'),
            panelArray: panelLogic,
            pro: true,
            initialOpen: false,
        },
        {
            title: __('Label Style', 'gutenverse'),
            panelArray: labelPanel,
            initialOpen: false,
            tabRole: TabStyle
        },
        {
            title: __('Main Wrapper', 'gutenverse'),
            panelArray: mainPanel,
            initialOpen: false,
            tabRole: TabStyle
        },
        {
            title: __('Input Style', 'gutenverse'),
            panelArray: inputPanel,
            initialOpen: false,
            tabRole: TabStyle
        },
        /* Put Your List Here */
        {
            title: __('Background', 'gutenverse'),
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
            title: __('Border', 'gutenverse'),
            initialOpen: false,
            panelArray: (props) => borderPanel({
                ...props,
                styleId: 'form-input-text-border',
            }),
            tabRole: TabStyle
        },
        {
            title: __('Masking', 'gutenverse'),
            initialOpen: false,
            panelArray: maskPanel,
            tabRole: TabStyle
        },
        {
            title: __('Display', 'gutenverse'),
            initialOpen: false,
            panelArray: responsivePanel,
            tabRole: TabSetting
        },
        {
            title: __('Positioning', 'gutenverse'),
            initialOpen: false,
            panelArray: positioningPanel,
            tabRole: TabSetting
        },
        {
            title: __('Animation Effects', 'gutenverse'),
            initialOpen: false,
            panelArray: (props) => animationPanel({
                ...props,
                styleId: 'form-input-text-animation'
            }),
            tabRole: TabSetting
        },
        {
            title: __('Transform', 'gutenverse'),
            initialOpen: false,
            panelArray: transformPanel,
            pro: true
        },
        {
            title: __('Spacing', 'gutenverse'),
            initialOpen: false,
            panelArray: (props) => advancePanel({
                ...props,
                styleId: 'form-input-text-advance',
            }),
            tabRole: TabSetting
        }
    ];
};