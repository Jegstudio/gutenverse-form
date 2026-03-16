<?php
/**
 * Form Input Select Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Input_Select Block
 *
 * @package gutenverse-form\block
 */
class Form_Input_Select extends Block_Abstract {
	/**
	 * Render content
	 *
	 * @return string
	 */
	public function render_content() {
		$input_placeholder     = isset( $this->attributes['inputPlaceholder'] ) ? $this->attributes['inputPlaceholder'] : 'Text Placeholder';
		$input_name            = isset( $this->attributes['inputName'] ) ? $this->attributes['inputName'] : 'input-select';
		$required              = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_type       = isset( $this->attributes['validationType'] ) ? $this->attributes['validationType'] : '';
		$validation_min        = isset( $this->attributes['validationMin'] ) ? $this->attributes['validationMin'] : '';
		$validation_max        = isset( $this->attributes['validationMax'] ) ? $this->attributes['validationMax'] : '';
		$validation_warning    = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic         = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';
		$display_logic         = isset( $this->attributes['displayLogic'] ) ? $this->attributes['displayLogic'] : array();
		$select_options        = isset( $this->attributes['selectOptions'] ) ? $this->attributes['selectOptions'] : array();
		$use_custom_dropdown   = isset( $this->attributes['useCustomDropdown'] ) ? $this->attributes['useCustomDropdown'] : false;
		$drop_down_icon_open   = isset( $this->attributes['dropDownIconOpen'] ) ? $this->attributes['dropDownIconOpen'] : 'gtn gtn-down-arrow1-light';
		$drop_down_icon_close  = isset( $this->attributes['dropDownIconClose'] ) ? $this->attributes['dropDownIconClose'] : 'gtn gtn-up-arrow1-light';
		$drop_down_icon_open_type  = isset( $this->attributes['dropDownIconOpenType'] ) ? $this->attributes['dropDownIconOpenType'] : 'icon';
		$drop_down_icon_close_type = isset( $this->attributes['dropDownIconCloseType'] ) ? $this->attributes['dropDownIconCloseType'] : 'icon';
		$drop_down_icon_open_svg   = isset( $this->attributes['dropDownIconOpenSVG'] ) ? $this->attributes['dropDownIconOpenSVG'] : '';
		$drop_down_icon_close_svg  = isset( $this->attributes['dropDownIconCloseSVG'] ) ? $this->attributes['dropDownIconCloseSVG'] : '';

		$validation = array(
			'type'              => 'select',
			'required'          => $required,
			'validationType'    => $validation_type,
			'validationMin'     => $validation_min,
			'validationMax'     => $validation_max,
			'validationWarning' => $validation_warning,
		);

		$display_rule = array(
			'type' => $default_logic,
			'rule' => $display_logic,
		);

		$dropdown_variable = array(
			'iconClose'         => $this->render_icon( $drop_down_icon_close_type, $drop_down_icon_close, $drop_down_icon_close_svg ),
			'iconOpen'          => $this->render_icon( $drop_down_icon_open_type, $drop_down_icon_open, $drop_down_icon_open_svg ),
			'useCustomDropdown' => $use_custom_dropdown,
		);

		$additional_props = '';

		if ( ! empty( $default_logic ) && ! empty( $display_logic ) ) {
			$additional_props .= ' data-display-rule=\'' . wp_json_encode( $display_rule ) . '\'';
		}

		if ( $use_custom_dropdown ) {
			$additional_props .= ' data-dropdown=\'' . wp_json_encode( $dropdown_variable ) . '\'';
		}

		$html = '<select name="' . esc_attr( $input_name ) . '" data-validation=\'' . wp_json_encode( $validation ) . '\' class="gutenverse-input gutenverse-input-select"' . $additional_props . '>';
		$html .= '<option value="">' . esc_html( $input_placeholder ) . '</option>';

		foreach ( $select_options as $opt ) {
			$selected = ( isset( $opt['selected'] ) && $opt['selected'] ) ? ' selected="selected"' : '';
			$disabled = ( isset( $opt['disabled'] ) && $opt['disabled'] ) ? ' disabled="disabled"' : '';
			$html    .= '<option value="' . esc_attr( $opt['value'] ) . '"' . $selected . $disabled . '>' . esc_html( $opt['label'] ) . '</option>';
		}

		$html .= '</select>';

		return $html;
	}

	/**
	 * Render view in frontend
	 */
	public function render_frontend() {
		$element_id         = $this->get_element_id();
		$display_classes    = $this->set_display_classes();
		$animation_class    = $this->set_animation_classes();
		$custom_classes     = $this->get_custom_classes();
		$input_label        = isset( $this->attributes['inputLabel'] ) ? $this->attributes['inputLabel'] : 'Select';
		$input_helper       = isset( $this->attributes['inputHelper'] ) ? $this->attributes['inputHelper'] : 'Input Helper';
		$show_label         = isset( $this->attributes['showLabel'] ) ? $this->attributes['showLabel'] : true;
		$show_helper        = isset( $this->attributes['showHelper'] ) ? $this->attributes['showHelper'] : true;
		$position           = isset( $this->attributes['position'] ) ? $this->attributes['position'] : 'top';
		$required           = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_warning = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic      = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';

		$class_name = 'guten-element guten-form-input-select guten-form-input guten-input-position-' . $position . ' ' . $element_id . $display_classes . $animation_class . $custom_classes;

		if ( ! $show_label ) {
			$class_name .= ' hide-label';
		}
		if ( ! $show_helper ) {
			$class_name .= ' hide-helper';
		}

		$additional_props = '';
		if ( ! empty( $default_logic ) ) {
			$additional_props = ' data-guten-input-rule="' . esc_attr( $default_logic ) . '"';
		}

		$html = '<div class="' . esc_attr( trim( $class_name ) ) . '"' . $additional_props . '>';

		// Label Wrapper.
		$html .= '<div class="label-wrapper">';
		if ( $show_label ) {
			$html .= '<label class="input-label">' . wp_kses_post( $input_label ) . '</label>';
		}
		if ( $required ) {
			$html .= '<span class="required-badge">*</span>';
		}
		$html .= '</div>';

		// Main Wrapper.
		$html .= '<div class="main-wrapper">';
		$html .= $this->render_content();
		$html .= '<div class="validation-error">' . esc_html( $validation_warning ) . '</div>';
		if ( $show_helper ) {
			$html .= '<span class="input-helper">' . wp_kses_post( $input_helper ) . '</span>';
		}
		$html .= '</div>';

		$html .= '</div>';

		return $html;
	}
}
