import { __ } from "@wordpress/i18n";
import {
	SelectControl,
	SwitchControl,
	TextControl,
	IconSVGControl,
	CheckboxControl,
    HeadingControl,
} from "gutenverse-core/controls";

export const panelSettings = (props) => {
	const {
			noticeStatus = 'success',
			messageSource,
		} = props;

	return [
		{
			id: "hideNoticeEditor",
			label: __("Temporarily Hide Notice", "gutenverse-form"),
			component: CheckboxControl,
			description: __(
				"Hides the notice in the editor while editing. This setting resets after reloading the page.",
				"gutenverse-form",
			),
		},
		{
			id: "messageSource",
			label: __("Message Source", "gutenverse-form"),
			component: SelectControl,
			options: [
				{
					value: "default",
					label: __("Default Message", "gutenverse-form"),
				},
				{
					value: "custom",
					label: __("Custom Message", "gutenverse-form"),
				},
			],
		},
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
			id: "successMessage",
			label: __("Success Message", "gutenverse-form"),
			component: TextControl,
			show: messageSource === "custom" && noticeStatus === "success",
		},
		{
			id: "errorMessage",
			label: __("Error Message", "gutenverse-form"),
			component: TextControl,
			show: messageSource === "custom" && noticeStatus === "error",
		},
		{
			id: "iconSuccess",
			label: __("Icon Success", "gutenverse-form"),
			component: IconSVGControl,
			show: noticeStatus === "success",
		},
		{
			id: "iconError",
			label: __("Icon Error", "gutenverse-form"),
			component: IconSVGControl,
			show: noticeStatus === "error",
		},
		{
			id: "iconLayoutSuccess",
			label: __("Icon Position Suceess", "gutenverse-form"),
			component: SelectControl,
			show: noticeStatus === "success",
			options: [
				{
					value: "left",
					label: __("Left (Default)", "gutenverse-form"),
				},
				{
					value: "right",
					label: __("Right", "gutenverse-form"),
				},
				{
					value: "top",
					label: __("Top", "gutenverse-form"),
				},
				{
					value: "bottom",
					label: __("Bottom", "gutenverse-form"),
				},
			],
		},
		{
			id: "iconLayoutError",
			label: __("Icon Position Error", "gutenverse-form"),
			component: SelectControl,
			show: noticeStatus === "error",
			options: [
				{
					value: "left",
					label: __("Left (Default)", "gutenverse-form"),
				},
				{
					value: "right",
					label: __("Right", "gutenverse-form"),
				},
				{
					value: "top",
					label: __("Top", "gutenverse-form"),
				},
				{
					value: "bottom",
					label: __("Bottom", "gutenverse-form"),
				},
			],
		},
	];
};
