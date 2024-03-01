import { __ } from '@wordpress/i18n';
import { advancePanel, animationPanel, backgroundPanel, borderPanel, positioningPanel, responsivePanel, buttonStylePanel, transformPanel, maskPanel, mouseMoveEffectPanel, conditionPanel } from 'gutenverse-core/controls';
import { buttonPanel } from './panel-button';
import { buttonBackgroundPanel } from './panel-button-background';
import { loadingPanel } from './panel-loading';
import { buttonBorderPanel } from './panel-button-border';
import { TabSetting, TabStyle } from 'gutenverse-core/controls';

export const panelList = () => {
    return [
        {
            title: __('Button', 'gutenverse-form'),
            panelArray: buttonPanel,
            tabRole: TabSetting,
        },
        {
            title: __('Style', 'gutenverse-form'),
            panelArray: buttonStylePanel,
            initialOpen: false,
            tabRole: TabStyle,
        },
        {
            title: __('Loading Indicator', 'gutenverse-form'),
            panelArray: loadingPanel,
            initialOpen: false,
            tabRole: TabSetting,
        },
        {
            title: __('Button Background', 'gutenverse-form'),
            initialOpen: false,
            panelArray: (props) => buttonBackgroundPanel({
                ...props,
                styleId: 'button-background',
                normalOptions: ['default', 'gradient'],
                hoverOptions: ['default', 'gradient'],
            }),
            tabRole: TabStyle,
        },
        {
            title: __('Button Border', 'gutenverse-form'),
            initialOpen: false,
            panelArray: buttonBorderPanel,
            tabRole: TabStyle,
        },
        {
            title: __('Background', 'gutenverse-form'),
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
            title: __('Border', 'gutenverse-form'),
            initialOpen: false,
            panelArray: (props) => borderPanel({
                ...props,
                styleId: 'element-border',
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
            panelArray: (props) => positioningPanel({
                ...props,
                inBlock: false
            }),
            tabRole: TabSetting
        },
        {
            title: __('Animation Effects', 'gutenverse-form'),
            initialOpen: false,
            panelArray: (props) => animationPanel({
                ...props,
                styleId: 'element-animation'
            }),
            tabRole: TabSetting
        },
        {
            title: __('Transform', 'gutenverse-form'),
            initialOpen: false,
            panelArray: props => transformPanel({
                ...props,
                selector: `.${props.elementId} .gutenverse-input-submit`,
                hoverSelector: `.${props.elementId} .gutenverse-input-submit:hover`
            }),
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
                styleId: 'element-advance',
            }),
            tabRole: TabSetting
        },
        {
            title: __('Condition', 'gutenverse'),
            panelArray: conditionPanel,
            initialOpen: false,
            pro: true
        },
    ];
};