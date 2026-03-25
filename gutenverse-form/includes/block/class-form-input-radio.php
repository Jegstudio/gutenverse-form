<?php
/**
 * Form Input Radio Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Input_Radio Block
 *
 * @package gutenverse-form\block
 */
class Form_Input_Radio extends Block_Abstract {

	use Form_Input_Wrapper;

	/**
	 * Render content
	 *
	 * @return string
	 */
	public function render_content() {
		$input_name         = isset( $this->attributes['inputName'] ) ? $this->attributes['inputName'] : 'input-radio';
		$required           = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_warning = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic      = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';
		$display_logic      = isset( $this->attributes['displayLogic'] ) ? $this->attributes['displayLogic'] : array();
		$radio_options      = isset( $this->attributes['radioOptions'] ) ? $this->attributes['radioOptions'] : array();
		$display_block      = isset( $this->attributes['displayBlock'] ) ? $this->attributes['displayBlock'] : 'default';

		$inner_class = 'gutenverse-inner-input ' . $display_block;

		$validation = array(
			'type'              => 'radio',
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

		foreach ( $radio_options as $item ) {
			$html .= '<label>';
			$html .= '<input name="' . esc_attr( $input_name ) . '" value="' . esc_attr( $item['value'] ) . '" class="gutenverse-input-radio" type="radio"/>';
			$html .= '<span class="radio">' . esc_html( $item['label'] ) . '</span>';
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
		$this->attributes['inputLabel'] = isset( $this->attributes['inputLabel'] ) ? $this->attributes['inputLabel'] : 'Radio';
		return $this->render_wrapper( $this->render_content(), 'radio' );
	}
}
