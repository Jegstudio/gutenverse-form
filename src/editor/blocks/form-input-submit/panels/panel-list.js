import { __ } from '@wordpress/i18n';
import { advancePanel, animationPanel, backgroundPanel, borderPanel, positioningPanel, responsivePanel, buttonStylePanel, transformPanel } from 'gutenverse-core/controls';
import { buttonPanel } from './panel-button';
import { buttonBackgroundPanel } from './panel-button-background';
import { loadingPanel } from './panel-loading';
import { buttonBorderPanel } from './panel-button-border';
import { TabSetting, TabStyle } from 'gutenverse-core/controls';

export const panelList = () => {
    return [
        {
            title: __('Button', 'gutenverse'),
            panelArray: buttonPanel,
            tabRole: TabSetting,
        },
        {
            title: __('Style', 'gutenverse'),
            panelArray: buttonStylePanel,
            initialOpen: false,
            tabRole: TabStyle,
        },
        {
            title: __('Loading Indicator', 'gutenverse'),
            panelArray: loadingPanel,
            initialOpen: false,
            tabRole: TabSetting,
        },
        {
            title: __('Button Background', 'gutenverse'),
            initialOpen: false,
            panelArray: (props) => buttonBackgroundPanel({
                ...props,
                styleId: 'button-background',
                normalOptions: [ 'default', 'gradient' ],
                hoverOptions: [ 'default', 'gradient' ],
            }),
            tabRole: TabStyle,
        },
        {
            title: __('Button Border', 'gutenverse'),
            initialOpen: false,
            panelArray: buttonBorderPanel,
            tabRole: TabStyle,
        },
        {
            title: __('Background', 'gutenverse'),
            initialOpen: false,
            panelArray: (props) => backgroundPanel({
                ...props,
                styleId: 'element-background',
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
                styleId: 'element-border',
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
                styleId: 'element-animation'
            }),
            tabRole: TabSetting
        },
        {
            title: __('Transform', 'gutenverse'),
            initialOpen: false,
            panelArray: props => transformPanel({
                ...props,
                selector: `.${props.elementId} .gutenverse-input-submit`,
                hoverSelector: `.${props.elementId} .gutenverse-input-submit:hover`
            }),
            pro: true
        },
        {
            title: __('Spacing', 'gutenverse'),
            initialOpen: false,
            panelArray: (props) => advancePanel({
                ...props,
                styleId: 'element-advance',
            }),
            tabRole: TabSetting
        }
    ];
};