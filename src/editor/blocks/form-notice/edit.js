import { compose } from "@wordpress/compose";
import {
	withMouseMoveEffect,
	withPartialRender,
	withPassRef,
} from "gutenverse-core/hoc";
import { panelList } from "./panels/panel-list";
import { recursiveParentBlock } from "../form-input/general/input-wrapper";
import { useRef, useMemo, useState, useEffect } from "@wordpress/element";

import { useAnimationEditor, useDisplayEditor } from "gutenverse-core/hooks";
import classnames from "classnames";
import { renderIcon } from "gutenverse-core/helper";
import { useDynamicStyle, useGenerateElementId } from "gutenverse-core/styling";
import getBlockStyle from "./styles/block-style";
import { BlockPanelController, PanelTutorial } from "gutenverse-core/controls";
import { CopyElementToolbar } from "gutenverse-core/components";

import { useBlockProps, RichText, InspectorControls } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { useSelect } from "@wordpress/data";

const FormNoticeBlock = compose(
	withMouseMoveEffect,
	withPartialRender,
	withPassRef,
)((props) => {
	const { attributes, setAttributes, clientId } = props;

	const {
		elementId,
		noticeStatus = 'success',
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
		hideNoticeEditor,
	} = attributes;

	const currentIcon = noticeStatus === "success" ? iconSuccess : iconError;
	const currentIconType =
		noticeStatus === "success" ? iconSuccessType : iconErrorType;
	const currentIconSVG =
		noticeStatus === "success" ? iconSuccessSVG : iconErrorSVG;
	const currentIconLayout =
		noticeStatus === "success" ? iconLayoutSuccess : iconLayoutError;

	const elementRef = useRef();
	const animationClass = useAnimationEditor(attributes);
	const displayClass = useDisplayEditor(attributes);

	useGenerateElementId(clientId, elementId, elementRef);
	useDynamicStyle(elementId, attributes, getBlockStyle, elementRef);

	// Get formData from parent Form Builder if possible
	const { formData, validParentState } = useSelect(
		(select) => {
			const { getBlockRootClientId, getBlockAttributes } =
				select("core/block-editor");
			const isValid = recursiveParentBlock(clientId);
			const rootClientId = getBlockRootClientId(clientId);
			let data = null;
			if (rootClientId) {
				// We might need to go up further to find form-builder if this is nested
				// But for simplicity let's try direct root first
				data = getBlockAttributes(rootClientId);
			}
			return {
				formData: data,
				validParentState: isValid,
			};
		},
		[clientId],
	);

	const [validParent, setValidParent] = useState(true);

	useEffect(() => {
		setValidParent(validParentState);
	}, [validParentState]);

	const displayMessage = useMemo(() => {
		if (messageSource === "custom") {
			return noticeStatus === "success" ? successMessage : errorMessage;
		}

		// This is tricky in editor as formData might not be fully available or in the same format
		// But per requirements, it uses formData['form_success_notice'] etc.
		// If not available, fallback to default labels
		if (formData) {
			return noticeStatus === "success"
				? formData.form_success_notice ||
						__(
							"Success message defined in Form Builder",
							"gutenverse-form",
						)
				: formData.form_error_notice ||
						__(
							"Error message defined in Form Builder",
							"gutenverse-form",
						);
		}

		return noticeStatus === "success" ? successMessage : errorMessage;
	}, [messageSource, noticeStatus, successMessage, errorMessage, formData]);

	const blockProps = useBlockProps({
		ref: elementRef,
		className: classnames(
			"guten-element",
			"guten-form-notice",
			hideNoticeEditor ? "" : "show-notice",
			`status-${noticeStatus}`,
			`notice-${noticeStatus}`,
			elementId,
			animationClass,
			displayClass,
		),
	});

	return (
		<>
			<CopyElementToolbar {...props} />
			<InspectorControls>
				<PanelTutorial
					title={__('Remove notice?', 'gutenverse-form')}
					list={[
						{
							title: __('Notice still appears after removing the "Form Notice"?', 'gutenverse-form'),
							description: __('Your form action may have a default notice message. Go to Admin Dashboard > Form > Form Action and delete the notice text.', 'gutenverse-form')
						},
					]}
					openDefault={false}
				/>
			</InspectorControls>
			<BlockPanelController
				panelList={panelList}
				props={props}
				elementRef={elementRef}
			/>
			<div {...blockProps}>
				{!validParent && (
					<h1 className="input-warning">
						{__(
							"Please put notice element inside Form Builder",
							"gutenverse-form",
						)}
					</h1>
				)}
				<div
					className={classnames(
						"guten-form-notice-wrapper",
						`layout-${currentIconLayout}`,
					)}
				>
					{currentIcon && (
						<div className="guten-form-notice-icon">
							{renderIcon(
								currentIcon,
								currentIconType,
								currentIconSVG,
							)}
						</div>
					)}

					<div className="guten-form-notice-content">
						{messageSource === "custom" ? (
							<RichText
								tagName="div"
								value={displayMessage}
								onChange={(value) => {
									if (noticeStatus === "success") {
										setAttributes({
											successMessage: value,
										});
									} else {
										setAttributes({ errorMessage: value });
									}
								}}
							/>
						) : (
							<div
								dangerouslySetInnerHTML={{
									__html: displayMessage,
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
});

export default FormNoticeBlock;
