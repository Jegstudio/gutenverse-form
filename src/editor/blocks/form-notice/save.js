import { useBlockProps } from "@wordpress/block-editor";
import classnames from "classnames";

export default function save({ attributes }) {
	const {
		elementId,
		messageSource,
		successMessage,
		errorMessage,
		iconSuccess,
		iconError,
		iconSuccessType,
		iconErrorType,
		iconSuccessSVG,
		iconErrorSVG,
		iconLayoutSuccess,
		iconLayoutError,
	} = attributes;

	const blockProps = useBlockProps.save({
		className: classnames("guten-element", "guten-form-notice", elementId),
		"data-notice": JSON.stringify({
			messageSource,
			successMessage,
			errorMessage,
			iconSuccess,
			iconError,
			iconSuccessType,
			iconErrorType,
			iconSuccessSVG,
			iconErrorSVG,
			iconLayoutSuccess,
			iconLayoutError,
		}),
	});

	return (
		<div {...blockProps}>
			<div
				className="guten-form-notice-wrapper"
				style={{ display: "none" }}
			>
				<div className="guten-form-notice-icon"></div>
				<div className="guten-form-notice-content"></div>
			</div>
		</div>
	);
}
