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

	use Form_Input_Wrapper;

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
			$additional_props = ' data-display-rule="' . esc_attr( wp_json_encode( $display_rule ) ) . '"';
		}

		$html  = '<select name="' . esc_attr( $input_name ) . '[]" data-validation="' . esc_attr( wp_json_encode( $validation ) ) . '" class="gutenverse-input gutenverse-input-multiselect" multiple' . $additional_props . '>';
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
		if ( ! empty( trim( $this->block_data->inner_html ) ) && apply_filters( 'gutenverse_force_dynamic', false ) ) {
			return $this->content;
		}
		$this->attributes['inputLabel'] = isset( $this->attributes['inputLabel'] ) ? $this->attributes['inputLabel'] : 'Multi Select';
		return $this->render_wrapper( $this->render_content(), 'multiselect' );
	}
}
