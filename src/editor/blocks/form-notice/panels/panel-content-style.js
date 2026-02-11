import { __ } from "@wordpress/i18n";
import {
	ColorControl,
	TypographyControl,
	DimensionControl,
	SwitchControl,
    HeadingControl
} from "gutenverse-core/controls";

export const panelContentStyle = (props) => {
	const { elementId, noticeStatus = 'success' } = props;

	return [
        {
            id: 'submenuSplitter1',
            component: HeadingControl,
            label: __("Notice Status (Preview)", "gutenverse-form"),
        },
		{
            id: "__noticeStatusState",
            component: SwitchControl,
            description: __("Frontend status is set automatically after submission.", "gutenverse-form"),
			options: [
				{
					value: "success",
					label: __("Success", "gutenverse-form"),
				},
				{
					value: "error",
					label: __("Error", "gutenverse-form"),
				},
			],
			onChange: ({ __noticeStatusState }) => {
				props.setSwitcher({
					...props.switcher,
					state: __noticeStatusState,
				});
				props.setAttributes({ noticeStatus: __noticeStatusState });
			},
		},
		{
			id:
				noticeStatus === "success"
					? "textColorSuccess"
					: "textColorError",
			label: noticeStatus === "success" ? __("Success Text Color", "gutenverse-form") : __("Error Text Color", "gutenverse-form"),
			component: ColorControl,
			liveStyle: [
				{
					type: "color",
					id:
						noticeStatus === "success"
							? "textColorSuccess"
							: "textColorError",
					selector: `.${elementId}.notice-${noticeStatus} .guten-form-notice-content`,
					properties: [
						{
							name: "color",
							valueType: "direct",
						},
					],
				},
			],
		},
		{
			id:
				noticeStatus === "success"
					? "typographySuccess"
					: "typographyError",
			label: noticeStatus === "success" ? __("Success Typography", "gutenverse-form") : __("Error Typography", "gutenverse-form"),
			component: TypographyControl,
		},
		{
			id:
				noticeStatus === "success"
					? "contentMarginSuccess"
					: "contentMarginError",
			label: noticeStatus === "success" ? __("Success Content Margin", "gutenverse-form") : __("Error Content Margin", "gutenverse-form"),
			component: DimensionControl,
			position: ["top", "right", "bottom", "left"],
			allowDeviceControl: true,
			units: {
				px: { text: "px", unit: "px" },
				em: { text: "em", unit: "em" },
				rem: { text: "rem", unit: "rem" },
			},
		},
	];
};
