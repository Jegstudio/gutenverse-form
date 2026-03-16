<?php
/**
 * Form Input GDPR Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Input_Gdpr Block
 *
 * @package gutenverse-form\block
 */
class Form_Input_Gdpr extends Block_Abstract {
	/**
	 * Render content
	 *
	 * @return string
	 */
	public function render_content() {
		$input_name         = isset( $this->attributes['inputName'] ) ? $this->attributes['inputName'] : 'input-gdpr';
		$required           = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_warning = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic      = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';
		$display_logic      = isset( $this->attributes['displayLogic'] ) ? $this->attributes['displayLogic'] : array();
		$display_block      = isset( $this->attributes['displayBlock'] ) ? $this->attributes['displayBlock'] : 'default';
		$gdpr_value         = isset( $this->attributes['gdprValue'] ) ? $this->attributes['gdprValue'] : false;
		$gdpr_form_value    = isset( $this->attributes['gdprFormValue'] ) ? $this->attributes['gdprFormValue'] : 'Yes, I Agree';
		$gdpr_label         = isset( $this->attributes['gdprLabel'] ) ? $this->attributes['gdprLabel'] : 'Yes, I Agree';

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

		$inner_class = 'gutenverse-inner-input ' . $display_block;

		$html  = '<div class="' . esc_attr( $inner_class ) . '">';
		$html .= '<div class="guten-gdpr-wrapper">';
		$html .= '<div class="guten-gdpr-input-wrapper">';
		$html .= '<input name="' . esc_attr( $input_name ) . '"' . ( $gdpr_value ? ' checked="checked"' : '' ) . ' data-validation=\'' . wp_json_encode( $validation ) . '\'' . $additional_props . ' class="gutenverse-input gutenverse-input-gdpr" type="checkbox" data-value="' . esc_attr( $gdpr_form_value ) . '"/>';
		$html .= '<span class="check"></span>';
		$html .= '</div>';
		$html .= '<div class="gdpr-label">' . wp_kses_post( $gdpr_label ) . '</div>';
		$html .= '</div></div>';

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
		$input_label        = isset( $this->attributes['inputLabel'] ) ? $this->attributes['inputLabel'] : 'GDPR Agreement';
		$input_helper       = isset( $this->attributes['inputHelper'] ) ? $this->attributes['inputHelper'] : 'Input Helper';
		$show_label         = isset( $this->attributes['showLabel'] ) ? $this->attributes['showLabel'] : true;
		$show_helper        = isset( $this->attributes['showHelper'] ) ? $this->attributes['showHelper'] : true;
		$position           = isset( $this->attributes['position'] ) ? $this->attributes['position'] : 'top';
		$required           = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_warning = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic      = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';

		$class_name = 'guten-element guten-form-input-gdpr guten-form-input guten-input-position-' . $position . ' ' . $element_id . $display_classes . $animation_class . $custom_classes;

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
