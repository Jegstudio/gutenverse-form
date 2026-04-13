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

	use Form_Input_Wrapper;

	/**
	 * Get dropdown icon data.
	 *
	 * @param string $icon Icon class.
	 * @param string $type Icon type.
	 * @param string $svg  SVG data.
	 *
	 * @return array|string
	 */
	private function get_dropdown_icon_data( $icon, $type, $svg ) {
		if ( 'svg' === $type && ! empty( $svg ) ) {
			return array(
				'type' => 'svg',
				'svg'  => $svg,
			);
		}

		return $icon;
	}

	/**
	 * Render content
	 *
	 * @return string
	 */
	public function render_content() {
		$input_placeholder         = isset( $this->attributes['inputPlaceholder'] ) ? $this->attributes['inputPlaceholder'] : 'Text Placeholder';
		$input_name                = isset( $this->attributes['inputName'] ) ? $this->attributes['inputName'] : 'input-select';
		$required                  = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_type           = isset( $this->attributes['validationType'] ) ? $this->attributes['validationType'] : '';
		$validation_min            = isset( $this->attributes['validationMin'] ) ? $this->attributes['validationMin'] : '';
		$validation_max            = isset( $this->attributes['validationMax'] ) ? $this->attributes['validationMax'] : '';
		$validation_warning        = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic             = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';
		$display_logic             = isset( $this->attributes['displayLogic'] ) ? $this->attributes['displayLogic'] : array();
		$select_options            = isset( $this->attributes['selectOptions'] ) ? $this->attributes['selectOptions'] : array();
		$use_custom_dropdown       = isset( $this->attributes['useCustomDropdown'] ) ? $this->attributes['useCustomDropdown'] : false;
		$drop_down_icon_open       = isset( $this->attributes['dropDownIconOpen'] ) ? $this->attributes['dropDownIconOpen'] : 'gtn gtn-down-arrow1-light';
		$drop_down_icon_close      = isset( $this->attributes['dropDownIconClose'] ) ? $this->attributes['dropDownIconClose'] : 'gtn gtn-up-arrow1-light';
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
			'iconClose'         => $this->get_dropdown_icon_data( $drop_down_icon_close, $drop_down_icon_close_type, $drop_down_icon_close_svg ),
			'iconOpen'          => $this->get_dropdown_icon_data( $drop_down_icon_open, $drop_down_icon_open_type, $drop_down_icon_open_svg ),
			'useCustomDropdown' => $use_custom_dropdown,
		);

		$additional_props = '';

		if ( ! empty( $default_logic ) && ! empty( $display_logic ) ) {
			$additional_props .= ' data-display-rule="' . esc_attr( wp_json_encode( $display_rule ) ) . '"';
		}

		if ( $use_custom_dropdown ) {
			$additional_props .= ' data-dropdown="' . esc_attr( wp_json_encode( $dropdown_variable ) ) . '"';
		}

		$html  = '<select name="' . esc_attr( $input_name ) . '" data-validation="' . esc_attr( wp_json_encode( $validation ) ) . '" class="gutenverse-input gutenverse-input-select"' . $additional_props . '>';
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
		if ( ! empty( trim( $this->block_data->inner_html ) ) && apply_filters( 'gutenverse_force_dynamic', false ) ) {
			return $this->content;
		}
		$this->attributes['inputLabel'] = isset( $this->attributes['inputLabel'] ) ? $this->attributes['inputLabel'] : 'Select';
		return $this->render_wrapper( $this->render_content(), 'select' );
	}
}
