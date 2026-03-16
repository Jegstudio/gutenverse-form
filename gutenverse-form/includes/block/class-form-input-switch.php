<?php
/**
 * Form Input Switch Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Input_Switch Block
 *
 * @package gutenverse-form\block
 */
class Form_Input_Switch extends Block_Abstract {

	use Form_Input_Wrapper;

	/**
	 * Render content
	 *
	 * @return string
	 */
	public function render_content() {
		$element_id    = $this->attributes['elementId'];
		$input_name    = isset( $this->attributes['inputName'] ) ? $this->attributes['inputName'] : 'input-switch';
		$on_text       = isset( $this->attributes['onText'] ) ? $this->attributes['onText'] : 'ON';
		$off_text      = isset( $this->attributes['offText'] ) ? $this->attributes['offText'] : 'OFF';
		$default_logic = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';
		$display_logic = isset( $this->attributes['displayLogic'] ) ? $this->attributes['displayLogic'] : array();

		$display_rule     = array(
			'type' => $default_logic,
			'rule' => $display_logic,
		);
		$additional_props = '';

		if ( ! empty( $default_logic ) && ! empty( $display_logic ) ) {
			$additional_props = ' data-display-rule=\'' . wp_json_encode( $display_rule ) . '\'';
		}

		$html  = '<label class="switch-wrapper" for="' . esc_attr( $element_id ) . '">';
		$html .= '<input id="' . esc_attr( $element_id ) . '" name="' . esc_attr( $input_name ) . '" class="gutenverse-input gutenverse-input-switch" type="checkbox" hidden' . $additional_props . '/>';
		$html .= '<span class="switch" data-on="' . esc_attr( $on_text ) . '" data-off="' . esc_attr( $off_text ) . '"></span>';
		$html .= '</label>';

		return $html;
	}

	/**
	 * Render view in frontend
	 */
	public function render_frontend() {
		$this->attributes['inputLabel'] = isset( $this->attributes['inputLabel'] ) ? $this->attributes['inputLabel'] : 'Switch';
		return $this->render_wrapper( $this->render_content(), 'switch' );
	}
}
