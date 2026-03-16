<?php
/**
 * Form Input Multiselect Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Input_Multiselect Block
 *
 * @package gutenverse-form\block
 */
class Form_Input_Multiselect extends Block_Abstract {
	/**
	 * Render content
	 *
	 * @return string
	 */
	public function render_content() {
		$input_placeholder  = isset( $this->attributes['inputPlaceholder'] ) ? $this->attributes['inputPlaceholder'] : 'Text Placeholder';
		$input_name         = isset( $this->attributes['inputName'] ) ? $this->attributes['inputName'] : 'input-multi-select';
		$required           = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_type    = isset( $this->attributes['validationType'] ) ? $this->attributes['validationType'] : '';
		$validation_min     = isset( $this->attributes['validationMin'] ) ? $this->attributes['validationMin'] : '';
		$validation_max     = isset( $this->attributes['validationMax'] ) ? $this->attributes['validationMax'] : '';
		$validation_warning = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic      = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';
		$display_logic      = isset( $this->attributes['displayLogic'] ) ? $this->attributes['displayLogic'] : array();
		$select_options     = isset( $this->attributes['selectOptions'] ) ? $this->attributes['selectOptions'] : array();

		$validation = array(
			'type'              => 'multiselect',
			'required'          => $required,
			'validationType'    => $validation_type,
			'validationMin'     => $validation_min,
			'validationMax'     => $validation_max,
			'validationWarning' => $validation_warning,
		);

		$display_rule     = array(
			'type' => $default_logic,
			'rule' => $display_logic,
		);
		$additional_props = '';

		if ( ! empty( $default_logic ) && ! empty( $display_logic ) ) {
			$additional_props = ' data-display-rule=\'' . wp_json_encode( $display_rule ) . '\'';
		}

		$html = '<select name="' . esc_attr( $input_name ) . '[]" data-validation=\'' . wp_json_encode( $validation ) . '\' class="gutenverse-input gutenverse-input-multiselect" multiple' . $additional_props . '>';
		$html .= '<option value="" placeholder>' . esc_html( $input_placeholder ) . '</option>';

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
		$input_label        = isset( $this->attributes['inputLabel'] ) ? $this->attributes['inputLabel'] : 'Multi Select';
		$input_helper       = isset( $this->attributes['inputHelper'] ) ? $this->attributes['inputHelper'] : 'Input Helper';
		$show_label         = isset( $this->attributes['showLabel'] ) ? $this->attributes['showLabel'] : true;
		$show_helper        = isset( $this->attributes['showHelper'] ) ? $this->attributes['showHelper'] : true;
		$position           = isset( $this->attributes['position'] ) ? $this->attributes['position'] : 'top';
		$required           = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_warning = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic      = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';

		$class_name = 'guten-element guten-form-input-multiselect guten-form-input guten-input-position-' . $position . ' ' . $element_id . $display_classes . $animation_class . $custom_classes;

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
