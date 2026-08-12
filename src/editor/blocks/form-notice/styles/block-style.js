import { isNotEmpty } from "gutenverse-core/helper";

const getBlockStyle = (elementId, attributes) => {
	let data = [];

	// Success Container Styles
	isNotEmpty(attributes["backgroundSuccess"]) &&
		data.push({
			type: "background",
			id: "backgroundSuccess",
			selector: `.${elementId}.notice-success`,
		});

	isNotEmpty(attributes["paddingSuccess"]) &&
		data.push({
			type: "dimension",
			id: "paddingSuccess",
			responsive: true,
			properties: [
				{
					name: "padding",
					valueType: "direct",
				},
			],
			selector: `.${elementId}.notice-success`,
		});

	isNotEmpty(attributes["marginSuccess"]) &&
		data.push({
			type: "dimension",
			id: "marginSuccess",
			responsive: true,
			properties: [
				{
					name: "margin",
					valueType: "direct",
				},
			],
			selector: `.${elementId}.notice-success`,
		});

	isNotEmpty(attributes["borderResponsiveSuccess"]) &&
		data.push({
			type: "borderResponsive",
			id: "borderResponsiveSuccess",
			selector: `.${elementId}.notice-success`,
			responsive: true,
		});

	// Error Container Styles
	isNotEmpty(attributes["backgroundError"]) &&
		data.push({
			type: "background",
			id: "backgroundError",
			selector: `.${elementId}.notice-error`,
		});

	isNotEmpty(attributes["paddingError"]) &&
		data.push({
			type: "dimension",
			id: "paddingError",
			responsive: true,
			properties: [
				{
					name: "padding",
					valueType: "direct",
				},
			],
			selector: `.${elementId}.notice-error`,
		});

	isNotEmpty(attributes["marginError"]) &&
		data.push({
			type: "dimension",
			id: "marginError",
			responsive: true,
			properties: [
				{
					name: "margin",
					valueType: "direct",
				},
			],
			selector: `.${elementId}.notice-error`,
		});

	isNotEmpty(attributes["borderResponsiveError"]) &&
		data.push({
			type: "borderResponsive",
			id: "borderResponsiveError",
			selector: `.${elementId}.notice-error`,
			responsive: true,
		});

	// Rest of styles
	isNotEmpty(attributes["zIndex"]) &&
		data.push({
			type: "plain",
			id: "zIndex",
			responsive: true,
			properties: [
				{
					name: "z-index",
					valueType: "direct",
				},
			],
			selector: `.${elementId}.guten-element`,
		});

	/* Icon Layout Success */
	isNotEmpty(attributes["iconLayoutSuccess"]) &&
		data.push({
			type: "plain",
			id: "iconLayoutSuccess",
			selector: `.${elementId}.notice-success .guten-form-notice-wrapper`,
			properties: [
				{
					name: "flex-direction",
					valueType: "pattern",
					pattern:
						attributes["iconLayoutSuccess"] === "right"
							? "row-reverse"
							: attributes["iconLayoutSuccess"] === "top"
								? "column"
								: attributes["iconLayoutSuccess"] === "bottom"
									? "column-reverse"
									: "row",
				},
				{
					name: "align-items",
					valueType: "direct",
					value: "center",
				},
				{
					name: "display",
					valueType: "direct",
					value: "flex",
				},
				{
					name: "gap",
					valueType: "direct",
					value: "10px",
				},
			],
		});

	/* Icon Layout Error */
	isNotEmpty(attributes["iconLayoutError"]) &&
		data.push({
			type: "plain",
			id: "iconLayoutError",
			selector: `.${elementId}.notice-error .guten-form-notice-wrapper`,
			properties: [
				{
					name: "flex-direction",
					valueType: "pattern",
					pattern:
						attributes["iconLayoutError"] === "right"
							? "row-reverse"
							: attributes["iconLayoutError"] === "top"
								? "column"
								: attributes["iconLayoutError"] === "bottom"
									? "column-reverse"
									: "row",
				},
				{
					name: "align-items",
					valueType: "direct",
					value: "center",
				},
				{
					name: "display",
					valueType: "direct",
					value: "flex",
				},
				{
					name: "gap",
					valueType: "direct",
					value: "10px",
				},
			],
		});

	/* Icon Styles Success */
	isNotEmpty(attributes["iconColorSuccess"]) &&
		data.push({
			type: "color",
			id: "iconColorSuccess",
			selector: `.${elementId}.notice-success .guten-form-notice-icon i, .${elementId}.notice-success .guten-form-notice-icon svg`,
			properties: [
				{
					name: "color",
					valueType: "direct",
				},
			],
		});

	isNotEmpty(attributes["iconSizeSuccess"]) &&
		data.push({
			type: "plain",
			id: "iconSizeSuccess",
			responsive: true,
			selector: `.${elementId}.notice-success .guten-form-notice-icon i, .${elementId}.notice-success .guten-form-notice-icon svg`,
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
		});

	isNotEmpty(attributes["iconBackgroundSuccess"]) &&
		data.push({
			type: "background",
			id: "iconBackgroundSuccess",
			selector: `.${elementId}.notice-success .guten-form-notice-icon`,
		});

	isNotEmpty(attributes["iconBorderSuccess"]) &&
		data.push({
			type: "borderResponsive",
			id: "iconBorderSuccess",
			selector: `.${elementId}.notice-success .guten-form-notice-icon`,
			responsive: true,
		});

	isNotEmpty(attributes["iconPaddingSuccess"]) &&
		data.push({
			type: "dimension",
			id: "iconPaddingSuccess",
			properties: [
				{
					name: "padding",
					valueType: "direct",
				},
			],
			selector: `.${elementId}.notice-success .guten-form-notice-icon`,
			responsive: true,
		});

	/* Icon Styles Error */
	isNotEmpty(attributes["iconColorError"]) &&
		data.push({
			type: "color",
			id: "iconColorError",
			selector: `.${elementId}.notice-error .guten-form-notice-icon i, .${elementId}.notice-error .guten-form-notice-icon svg`,
			properties: [
				{
					name: "color",
					valueType: "direct",
				},
			],
		});

	isNotEmpty(attributes["iconSizeError"]) &&
		data.push({
			type: "plain",
			id: "iconSizeError",
			responsive: true,
			selector: `.${elementId}.notice-error .guten-form-notice-icon i, .${elementId}.notice-error .guten-form-notice-icon svg`,
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
		});

	isNotEmpty(attributes["iconBackgroundError"]) &&
		data.push({
			type: "background",
			id: "iconBackgroundError",
			selector: `.${elementId}.notice-error .guten-form-notice-icon`,
		});

	isNotEmpty(attributes["iconBorderError"]) &&
		data.push({
			type: "borderResponsive",
			id: "iconBorderError",
			selector: `.${elementId}.notice-error .guten-form-notice-icon`,
			responsive: true,
		});

	isNotEmpty(attributes["iconPaddingError"]) &&
		data.push({
			type: "dimension",
			id: "iconPaddingError",
			properties: [
				{
					name: "padding",
					valueType: "direct",
				},
			],
			selector: `.${elementId}.notice-error .guten-form-notice-icon`,
			responsive: true,
		});

	/* Content Styles Success */
	isNotEmpty(attributes["textColorSuccess"]) &&
		data.push({
			type: "color",
			id: "textColorSuccess",
			selector: `.${elementId}.notice-success .guten-form-notice-content`,
			properties: [
				{
					name: "color",
					valueType: "direct",
				},
			],
		});

	isNotEmpty(attributes["typographySuccess"]) &&
		data.push({
			type: "typography",
			id: "typographySuccess",
			selector: `.${elementId}.notice-success .guten-form-notice-content`,
			properties: [
				{
					name: "typography",
					valueType: "direct",
				},
			],
		});

	isNotEmpty(attributes["contentMarginSuccess"]) &&
		data.push({
			type: "dimension",
			id: "contentMarginSuccess",
			properties: [
				{
					name: "margin",
					valueType: "direct",
				},
			],
			selector: `.${elementId}.notice-success .guten-form-notice-content`,
			responsive: true,
		});

	/* Content Styles Error */
	isNotEmpty(attributes["textColorError"]) &&
		data.push({
			type: "color",
			id: "textColorError",
			selector: `.${elementId}.notice-error .guten-form-notice-content`,
			properties: [
				{
					name: "color",
					valueType: "direct",
				},
			],
		});

	isNotEmpty(attributes["typographyError"]) &&
		data.push({
			type: "typography",
			id: "typographyError",
			selector: `.${elementId}.notice-error .guten-form-notice-content`,
			properties: [
				{
					name: "typography",
					valueType: "direct",
				},
			],
		});

	isNotEmpty(attributes["contentMarginError"]) &&
		data.push({
			type: "dimension",
			id: "contentMarginError",
			properties: [
				{
					name: "margin",
					valueType: "direct",
				},
			],
			selector: `.${elementId}.notice-error .guten-form-notice-content`,
			responsive: true,
		});

	// Positioning
	isNotEmpty(attributes["positioningType"]) &&
		data.push({
			type: "positioning",
			id: "positioningType",
			selector: `.${elementId}.guten-element`,
			skipDeviceType: "first",
			attributeType: "type",
			multiAttr: {
				positioningType: attributes["positioningType"],
				inBlock: attributes["inBlock"],
			},
		});

	isNotEmpty(attributes["positioningType"]) &&
		isNotEmpty(attributes["positioningWidth"]) &&
		data.push({
			type: "positioning",
			id: "positioningType",
			selector: `.${elementId}.guten-element`,
			skipDeviceType: "second",
			attributeType: "type",
			multiAttr: {
				positioningWidth: attributes["positioningWidth"],
				positioningType: attributes["positioningType"],
				inBlock: attributes["inBlock"],
			},
		});

	isNotEmpty(attributes["positioningWidth"]) &&
		isNotEmpty(attributes["positioningType"]) &&
		data.push({
			type: "positioning",
			id: "positioningWidth",
			selector: `.${elementId}.guten-element`,
			skipDeviceType: "first",
			attributeType: "width",
			multiAttr: {
				positioningWidth: attributes["positioningWidth"],
				positioningType: attributes["positioningType"],
				inBlock: attributes["inBlock"],
			},
		});

	isNotEmpty(attributes["positioningAlign"]) &&
		isNotEmpty(attributes["positioningType"]) &&
		data.push({
			type: "positioning",
			id: "positioningAlign",
			selector: `.${elementId}.guten-element`,
			skipDeviceType: "first",
			attributeType: "align",
			multiAttr: {
				positioningAlign: attributes["positioningAlign"],
				positioningType: attributes["positioningType"],
				inBlock: attributes["inBlock"],
			},
		});

	// Positioning manual
	isNotEmpty(attributes["positioningLocation"]) &&
		isNotEmpty(attributes["positioningType"]) &&
		data.push({
			type: "positioning",
			id: "positioningLocation",
			selector: `.${elementId}.guten-element`,
			skipDeviceType: "first",
			attributeType: "location",
			multiAttr: {
				positioningLocation: attributes["positioningLocation"],
				positioningType: attributes["positioningType"],
				inBlock: attributes["inBlock"],
			},
		});

	isNotEmpty(attributes["positioningLeft"]) &&
		isNotEmpty(attributes["positioningType"]) &&
		data.push({
			type: "positioning",
			id: "positioningLeft",
			selector: `.${elementId}.guten-element`,
			skipDeviceType: "first",
			attributeType: "left",
			multiAttr: {
				positioningLeft: attributes["positioningLeft"],
				positioningType: attributes["positioningType"],
				inBlock: attributes["inBlock"],
			},
		});

	isNotEmpty(attributes["positioningRight"]) &&
		isNotEmpty(attributes["positioningType"]) &&
		data.push({
			type: "positioning",
			id: "positioningRight",
			selector: `.${elementId}.guten-element`,
			skipDeviceType: "first",
			attributeType: "right",
			multiAttr: {
				positioningRight: attributes["positioningRight"],
				positioningType: attributes["positioningType"],
				inBlock: attributes["inBlock"],
			},
		});

	isNotEmpty(attributes["positioningTop"]) &&
		isNotEmpty(attributes["positioningType"]) &&
		data.push({
			type: "positioning",
			id: "positioningTop",
			selector: `.${elementId}.guten-element`,
			skipDeviceType: "first",
			attributeType: "top",
			multiAttr: {
				positioningTop: attributes["positioningTop"],
				positioningType: attributes["positioningType"],
				inBlock: attributes["inBlock"],
			},
		});

	isNotEmpty(attributes["positioningBottom"]) &&
		isNotEmpty(attributes["positioningType"]) &&
		data.push({
			type: "positioning",
			id: "positioningBottom",
			selector: `.${elementId}.guten-element`,
			skipDeviceType: "first",
			attributeType: "bottom",
			multiAttr: {
				positioningBottom: attributes["positioningBottom"],
				positioningType: attributes["positioningType"],
				inBlock: attributes["inBlock"],
			},
		});

	return data;
};

export default getBlockStyle;
