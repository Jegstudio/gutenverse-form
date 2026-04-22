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

	use Form_Input_Wrapper;

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
			$additional_props = ' data-display-rule="' . esc_attr( wp_json_encode( $display_rule ) ) . '"';
		}

		$html  = '<div class="' . esc_attr( $inner_class ) . '">';
		$html .= '<div hidden name="' . esc_attr( $input_name ) . '" class="gutenverse-input" data-validation="' . esc_attr( wp_json_encode( $validation ) ) . '"' . $additional_props . '></div>';

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
		if ( ! empty( trim( $this->block_data->inner_html ) ) && apply_filters( 'gutenverse_force_dynamic', false ) ) {
			return $this->content;
		}
		$this->attributes['inputLabel'] = isset( $this->attributes['inputLabel'] ) ? $this->attributes['inputLabel'] : 'Checkbox';
		return $this->render_wrapper( $this->render_content(), 'checkbox' );
	}
}
