import { __ } from "@wordpress/i18n";
import {
	BackgroundControl,
	BorderResponsiveControl,
	DimensionControl,
	SwitchControl,
    HeadingControl
} from "gutenverse-core/controls";

export const panelContainerStyle = (props) => {
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
					? "backgroundSuccess"
					: "backgroundError",
			label: noticeStatus === "success" ? __("Success Background", "gutenverse-form") : __("Error Background", "gutenverse-form"),
			component: BackgroundControl,
			options: ["default", "gradient"],
			liveStyle: [
				{
					type: "background",
					id:
						noticeStatus === "success"
							? "backgroundSuccess"
							: "backgroundError",
					selector: `.${elementId}.notice-${noticeStatus}`,
				},
			],
		},
		{
			id:
				noticeStatus === "success"
					? "borderResponsiveSuccess"
					: "borderResponsiveError",
			label: noticeStatus === "success" ? __("Success Border", "gutenverse-form") : __("Error Border", "gutenverse-form"),
			component: BorderResponsiveControl,
			allowDeviceControl: true,
		},
		{
			id: noticeStatus === "success" ? "paddingSuccess" : "paddingError",
			label: noticeStatus === "success" ? __("Success Padding", "gutenverse-form") : __("Error Padding", "gutenverse-form"),
			component: DimensionControl,
			position: ["top", "right", "bottom", "left"],
			allowDeviceControl: true,
			units: {
				px: { text: "px", unit: "px" },
				em: { text: "em", unit: "em" },
				rem: { text: "rem", unit: "rem" },
			},
		},
		{
			id: noticeStatus === "success" ? "marginSuccess" : "marginError",
			label: noticeStatus === "success" ? __("Success Margin", "gutenverse-form") : __("Error Margin", "gutenverse-form"),
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
