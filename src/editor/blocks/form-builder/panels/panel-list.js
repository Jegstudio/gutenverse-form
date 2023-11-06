import { __ } from '@wordpress/i18n';
import { advancePanel, animationPanel, backgroundPanel, borderPanel, maskPanel, responsivePanel, transformPanel } from 'gutenverse-core/controls';
import { errorNoticePanel } from './panel-error-notice';
import { formPanel } from './panel-form';
import { stickyPanel } from './panel-sticky';
import { successNoticePanel } from './panel-success-notice';
import { TabSetting, TabStyle } from 'gutenverse-core/controls';

export const panelList = () => {
    return [
        {
            title: __('Form Setting', 'gutenverse'),
            panelArray: formPanel,
            tabRole: TabSetting
        },
        {
            title: __('Success Notice Styling', 'gutenverse'),
            panelArray: successNoticePanel,
            tabRole: TabStyle
        },
        {
            title: __('Error Notice Styling', 'gutenverse'),
            panelArray: errorNoticePanel,
            tabRole: TabStyle
        },
        {
            title: __('Sticky', 'gutenverse'),
            initialOpen: false,
            panelArray: stickyPanel,
            pro: true
        },
        {
            title: __('Background', 'gutenverse'),
            initialOpen: false,
            panelArray: (props) => backgroundPanel({
                ...props,
                styleId: 'form-builder-background',
                normalOptions: [ 'default', 'gradient' ],
                hoverOptions: [ 'default', 'gradient' ],
            }),
            tabRole: TabStyle
        },
        {
            title: __('Border', 'gutenverse'),
            initialOpen: false,
            panelArray: (props) => borderPanel({
                ...props,
                styleId: 'form-builder-border',
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
            title: __('Animation Effects', 'gutenverse'),
            initialOpen: false,
            panelArray: (props) => animationPanel({
                ...props,
                styleId: 'form-builder-animation'
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
                styleId: 'form-builder-advance',
            }),
            tabRole: TabSetting
        }
    ];
};