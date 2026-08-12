import { __ } from "@wordpress/i18n";
import {
	ColorControl,
	RangeControl,
	BackgroundControl,
	BorderResponsiveControl,
	DimensionControl,
	SwitchControl,
    HeadingControl
} from "gutenverse-core/controls";

export const panelIconStyle = (props) => {
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
					? "iconColorSuccess"
					: "iconColorError",
			label: noticeStatus === "success" ? __("Success Icon Color", "gutenverse-form") : __("Error Icon Color", "gutenverse-form"),
			component: ColorControl,
			liveStyle: [
				{
					type: "color",
					id:
						noticeStatus === "success"
							? "iconColorSuccess"
							: "iconColorError",
					selector: `.${elementId}.notice-${noticeStatus} .guten-form-notice-icon i, .${elementId}.notice-${noticeStatus} .guten-form-notice-icon svg`,
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
					? "iconSizeSuccess"
					: "iconSizeError",
			label: noticeStatus === "success" ? __("Success Icon Size", "gutenverse-form") : __("Error Icon Size", "gutenverse-form"),
			component: RangeControl,
			allowDeviceControl: true,
			min: 1,
			max: 100,
			step: 1,
			liveStyle: [
				{
					type: "fontSize",
					id:
						noticeStatus === "success"
							? "iconSizeSuccess"
							: "iconSizeError",
					selector: `.${elementId}.notice-${noticeStatus} .guten-form-notice-icon i, .${elementId}.notice-${noticeStatus} .guten-form-notice-icon svg`,
					properties: [
                        {
                            name: "font-size",
                            valueType: "pattern",
                            pattern: "{value}px",
                            patternValues: {
                                value: {
                                    type: "direct",
                                },
                            },
                        },
                    ],
				},
			],
		},
		{
			id:
				noticeStatus === "success"
					? "iconBackgroundSuccess"
					: "iconBackgroundError",
			label: noticeStatus === "success" ? __("Success Icon Background", "gutenverse-form") : __("Error Icon Background", "gutenverse-form"),
			component: BackgroundControl,
            options: ["default", "gradient"],
			liveStyle: [
				{
					type: "background",
					id:
						noticeStatus === "success"
							? "iconBackgroundSuccess"
							: "iconBackgroundError",
					selector: `.${elementId}.notice-${noticeStatus} .guten-form-notice-icon`,
				},
			],
		},
		{
			id:
				noticeStatus === "success"
					? "iconBorderSuccess"
					: "iconBorderError",
			label: noticeStatus === "success" ? __("Success Icon Border", "gutenverse-form") : __("Error Icon Border", "gutenverse-form"),
			component: BorderResponsiveControl,
			allowDeviceControl: true,
		},
		{
			id:
				noticeStatus === "success"
					? "iconPaddingSuccess"
					: "iconPaddingError",
			label: noticeStatus === "success" ? __("Success Icon Padding", "gutenverse-form") : __("Error Icon Padding", "gutenverse-form"),
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
