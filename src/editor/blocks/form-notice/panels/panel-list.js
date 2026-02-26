import { __ } from "@wordpress/i18n";
import {
	TabSetting,
	TabStyle,
	backgroundPanel,
	borderPanel,
	positioningPanel,
	animationPanel,
	transformPanel,
	advancePanel,
	responsivePanel,
	conditionPanel,
	ControlHeadingSimple,
} from "gutenverse-core/controls";

import { panelSettings } from "./panel-settings";
import { panelIconStyle } from "./panel-icon-style";
import { panelContentStyle } from "./panel-content-style";
import { panelContainerStyle } from "./panel-container-style";

export const panelList = () => {
	return [
		{
			title: __("Notice Settings", "gutenverse-form"),
			panelArray: panelSettings,
			initialOpen: true,
			tabRole: TabSetting,
		},
		{
			title: __("Display", "gutenverse-form"),
			panelArray: responsivePanel,
			initialOpen: false,
			tabRole: TabSetting,
		},
		{
			title: __("Positioning", "gutenverse-form"),
			panelArray: positioningPanel,
			initialOpen: false,
			tabRole: TabSetting,
		},
		{
			title: __("Animation Effects", "gutenverse-form"),
			panelArray: (props) =>
				animationPanel({
					...props,
					styleId: "form-notice-animation",
				}),
			initialOpen: false,
			tabRole: TabSetting,
		},
		{
			title: __("Spacing", "gutenverse-form"),
			panelArray: (props) =>
				advancePanel({
					...props,
					styleId: "form-notice-advance",
				}),
			initialOpen: false,
			tabRole: TabSetting,
		},
		{
			title: __("Container Style", "gutenverse-form"),
			initialOpen: false,
			tabRole: TabStyle,
			panelArray: panelContainerStyle,
		},
		{
			title: __("Icon Style", "gutenverse-form"),
			panelArray: panelIconStyle,
			initialOpen: false,
			tabRole: TabStyle,
		},
		{
			title: __("Content Style", "gutenverse-form"),
			panelArray: panelContentStyle,
			initialOpen: false,
			tabRole: TabStyle,
		},
		{
			title: __("Transform", "gutenverse-form"),
			panelArray: transformPanel,
			initialOpen: false,
			pro: true,
		},
		{
			title: __("Condition", "gutenverse"),
			panelArray: conditionPanel,
			initialOpen: false,
			pro: true,
		},
	];
};
