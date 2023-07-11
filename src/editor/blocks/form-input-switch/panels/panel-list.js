import { __ } from '@wordpress/i18n';
import { advancePanel, animationPanel, backgroundPanel, borderPanel, positioningPanel, responsivePanel } from 'gutenverse-core/controls';
import { contentPanel } from '../../form-input/general/panels/panel-content';
import { labelPanel } from '../../form-input/general/panels/panel-label';
import { mainPanel } from '../../form-input/general/panels/panel-main';
import { inputPanel } from './panel-input';
import { TabSetting, TabStyle } from 'gutenverse-core/controls';

export const panelList = () => {
    return [
        {
            title: __('Content', 'gutenverse'),
            panelArray: contentPanel,
            initialOpen: true,
            tabRole: TabSetting
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
                styleId: 'form-input-email-background',
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
                styleId: 'form-input-email-border',
            }),
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
                styleId: 'form-input-email-animation'
            }),
            tabRole: TabSetting
        },
        {
            title: __('Spacing', 'gutenverse'),
            initialOpen: false,
            panelArray: (props) => advancePanel({
                ...props,
                styleId: 'form-input-email-advance',
            }),
            tabRole: TabSetting
        }
    ];
};