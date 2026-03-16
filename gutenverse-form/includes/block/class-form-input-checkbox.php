<?php
/**
 * Form Input Checkbox Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Input_Checkbox Block
 *
 * @package gutenverse-form\block
 */
class Form_Input_Checkbox extends Block_Abstract {
	/**
	 * Render content
	 *
	 * @return string
	 */
	public function render_content() {
		$input_name         = isset( $this->attributes['inputName'] ) ? $this->attributes['inputName'] : 'input-checkbox';
		$required           = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_warning = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic      = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';
		$display_logic      = isset( $this->attributes['displayLogic'] ) ? $this->attributes['displayLogic'] : array();
		$checkbox_options   = isset( $this->attributes['checkboxOptions'] ) ? $this->attributes['checkboxOptions'] : array();
		$display_block      = isset( $this->attributes['displayBlock'] ) ? $this->attributes['displayBlock'] : 'default';

		$inner_class = 'gutenverse-inner-input ' . $display_block;

		$validation = array(
			'type'              => 'checkbox',
			'required'          => $required,
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

		$html  = '<div class="' . esc_attr( $inner_class ) . '">';
		$html .= '<div hidden name="' . esc_attr( $input_name ) . '" class="gutenverse-input" data-validation=\'' . wp_json_encode( $validation ) . '\'' . $additional_props . '></div>';

		foreach ( $checkbox_options as $item ) {
			$id    = $input_name . '-' . $item['value'];
			$html .= '<label for="' . esc_attr( $id ) . '">';
			$html .= '<input name="' . esc_attr( $input_name ) . '" value="' . esc_attr( $item['value'] ) . '" class="gutenverse-input-checkbox" type="checkbox" id="' . esc_attr( $id ) . '"/>';
			$html .= '<span class="check">' . esc_html( $item['label'] ) . '</span>';
			$html .= '</label>';
		}

		$html .= '</div>';

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
		$input_label        = isset( $this->attributes['inputLabel'] ) ? $this->attributes['inputLabel'] : 'Checkbox';
		$input_helper       = isset( $this->attributes['inputHelper'] ) ? $this->attributes['inputHelper'] : 'Input Helper';
		$show_label         = isset( $this->attributes['showLabel'] ) ? $this->attributes['showLabel'] : true;
		$show_helper        = isset( $this->attributes['showHelper'] ) ? $this->attributes['showHelper'] : true;
		$position           = isset( $this->attributes['position'] ) ? $this->attributes['position'] : 'top';
		$required           = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_warning = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic      = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';

		$class_name = 'guten-element guten-form-input-checkbox guten-form-input guten-input-position-' . $position . ' ' . $element_id . $display_classes . $animation_class . $custom_classes;

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
		$html  = apply_filters( 'gutenverse_cursor_move_effect_script', $html, $this->attributes, $element_id );

		return $html;
	}
}
