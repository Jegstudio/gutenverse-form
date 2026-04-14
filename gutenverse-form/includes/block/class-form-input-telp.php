<?php
/**
 * Form Input Telp Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Input_Telp Block
 *
 * @package gutenverse-form\block
 */
class Form_Input_Telp extends Block_Abstract {

	use Form_Input_Wrapper;

	/**
	 * Render content
	 *
	 * @return string
	 */
	public function render_content() {
		$input_placeholder  = isset( $this->attributes['inputPlaceholder'] ) ? $this->attributes['inputPlaceholder'] : '+1 800-555-666';
		$input_name         = isset( $this->attributes['inputName'] ) ? $this->attributes['inputName'] : 'input-phone';
		$required           = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_type    = isset( $this->attributes['validationType'] ) ? $this->attributes['validationType'] : '';
		$validation_min     = isset( $this->attributes['validationMin'] ) ? $this->attributes['validationMin'] : '';
		$validation_max     = isset( $this->attributes['validationMax'] ) ? $this->attributes['validationMax'] : '';
		$validation_warning = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic      = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';
		$display_logic      = isset( $this->attributes['displayLogic'] ) ? $this->attributes['displayLogic'] : array();
		$input_pattern      = isset( $this->attributes['inputPattern'] ) ? $this->attributes['inputPattern'] : '';
		$use_icon           = isset( $this->attributes['useIcon'] ) ? $this->attributes['useIcon'] : false;

		$validation = array(
			'type'              => 'telp',
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

		$input_html = '<input
            data-validation="' . esc_attr( wp_json_encode( $validation ) ) . '"
            placeholder="' . esc_attr( $input_placeholder ) . '"
            name="' . esc_attr( $input_name ) . '"
            class="gutenverse-input gutenverse-input-tel"
            type="tel"
            pattern="' . esc_attr( $input_pattern ) . '"' . $additional_props . '/>';

		if ( $use_icon ) {
			$html  = '<div class="input-icon-wrapper input-telp">';
			$html .= $this->icon_content();
			$html .= $input_html;
			$html .= '</div>';
		} else {
			$html = $input_html;
		}

		return $html;
	}

	/**
	 * Render Icon Content
	 *
	 * @return string
	 */
	protected function icon_content() {
		$icon_type       = isset( $this->attributes['iconType'] ) ? $this->attributes['iconType'] : 'icon';
		$icon_style_mode = isset( $this->attributes['iconStyleMode'] ) ? $this->attributes['iconStyleMode'] : '';
		$icon            = isset( $this->attributes['icon'] ) ? $this->attributes['icon'] : 'gtn gtn-smartphone-light';
		$icon_svg        = isset( $this->attributes['iconSVG'] ) ? $this->attributes['iconSVG'] : '';
		$image           = isset( $this->attributes['image'] ) ? $this->attributes['image'] : array();
		$image_alt       = isset( $this->attributes['imageAlt'] ) ? $this->attributes['imageAlt'] : '';
		$lazy_load       = isset( $this->attributes['lazyLoad'] ) ? $this->attributes['lazyLoad'] : false;

		$html = '';

		switch ( $icon_type ) {
			case 'icon':
			case 'svg':
				$html .= '<div class="form-input-telp-icon type-icon">';
				$html .= '<div class="icon style-' . esc_attr( $icon_style_mode ) . '">';
				$html .= $this->render_icon( $icon_type, $icon, $icon_svg );
				$html .= '</div></div>';
				break;
			case 'image':
				if ( ! empty( $image ) ) {
					$image_url = isset( $image['url'] ) ? $image['url'] : '';
					$alt       = $image_alt ? $image_alt : ( isset( $image['alt'] ) ? $image['alt'] : '' );
					$loading   = $lazy_load ? ' loading="lazy"' : '';

					$html .= '<div class="form-input-telp-icon type-image">';
					$html .= '<div class="icon style-' . esc_attr( $icon_style_mode ) . '">';
					$html .= '<img src="' . esc_url( $image_url ) . '" alt="' . esc_attr( $alt ) . '"' . $loading . '/>';
					$html .= '</div></div>';
				}
				break;
		}

		return $html;
	}

	/**
	 * Render view in frontend
	 */
	public function render_frontend() {
		if ( ! empty( trim( $this->block_data->inner_html ) ) && apply_filters( 'gutenverse_force_dynamic', false ) ) {
			return $this->content;
		}
		$this->attributes['inputLabel'] = isset( $this->attributes['inputLabel'] ) ? $this->attributes['inputLabel'] : 'Phone';
		return $this->render_wrapper( $this->render_content(), 'telp' );
	}
}
