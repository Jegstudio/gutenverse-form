import { __ } from "@wordpress/i18n";
import { SelectControl, TextControl } from "gutenverse-core/controls";

export const inputValuePanel = (props) => {
	const { defaultValueType, loopDataType, userDataType } = props;

	return [
		{
			id: "defaultValueType",
			label: __("Default Value Type", "gutenverse-form"),
			component: SelectControl,
			options: [
				{
					label: __("Custom", "gutenverse-form"),
					value: "custom",
				},
				{
					label: __("Loop Data", "gutenverse-form"),
					value: "loop",
				},
				{
					label: __("Query Param", "gutenverse-form"),
					value: "query",
				},
				{
					label: __("Logged-in User Data", "gutenverse-form"),
					value: "user",
				},
			],
		},
		// Custom Type
		{
			id: "customDefaultValue",
			show: defaultValueType === "custom",
			label: __("Custom Default Value", "gutenverse-form"),
			component: TextControl,
		},
		// Loop Data Type
		{
			id: "loopDataType",
			show: defaultValueType === "loop",
			label: __("Loop Data Type", "gutenverse-form"),
			component: SelectControl,
			options: [
				{
					label: __("Post ID", "gutenverse-form"),
					value: "id",
				},
				{
					label: __("Post Title", "gutenverse-form"),
					value: "title",
				},
				{
					label: __("Post URL", "gutenverse-form"),
					value: "url",
				},
				{
					label: __("Custom Meta", "gutenverse-form"),
					value: "meta",
				},
				{
					label: __("Post Type", "gutenverse-form"),
					value: "type",
				},
				{
					label: __("Taxonomy", "gutenverse-form"),
					value: "taxonomy",
				},
			],
		},
		{
			id: "loopDataMetaKey",
			show: defaultValueType === "loop" && loopDataType === "meta",
			label: __("Meta Key", "gutenverse-form"),
			component: TextControl,
			placeholder: __("harga, sku, dll", "gutenverse-form"),
		},
		{
			id: "loopDataTaxonomySlug",
			show: defaultValueType === "loop" && loopDataType === "taxonomy",
			label: __("Taxonomy Slug", "gutenverse-form"),
			component: TextControl,
		},
		// Query Param Type
		{
			id: "queryParamKey",
			show: defaultValueType === "query",
			label: __("Parameter Key", "gutenverse-form"),
			component: TextControl,
			placeholder: __("product_id", "gutenverse-form"),
		},
		// User Data Type
		{
			id: "userDataType",
			show: defaultValueType === "user",
			label: __("User Data Type", "gutenverse-form"),
			component: SelectControl,
			options: [
				{
					label: __("User ID", "gutenverse-form"),
					value: "id",
				},
				{
					label: __("Username", "gutenverse-form"),
					value: "username",
				},
				{
					label: __("Display Name", "gutenverse-form"),
					value: "display_name",
				},
				{
					label: __("First Name", "gutenverse-form"),
					value: "first_name",
				},
				{
					label: __("Last Name", "gutenverse-form"),
					value: "last_name",
				},
				{
					label: __("Email", "gutenverse-form"),
					value: "email",
				},
				{
					label: __("User Role", "gutenverse-form"),
					value: "role",
				},
				{
					label: __("Custom User Meta", "gutenverse-form"),
					value: "meta",
				},
			],
		},
		{
			id: "userDataMetaKey",
			show: defaultValueType === "user" && userDataType === "meta",
			label: __("User Meta Key", "gutenverse-form"),
			component: TextControl,
		},
		// Fallback Value (for User Data or Query Param if empty)
		{
			id: "fallbackDefaultValue",
			show: ["query", "user", "loop"].includes(defaultValueType),
			label: __("Fallback Default Value", "gutenverse-form"),
			component: TextControl,
		},
	];
};
