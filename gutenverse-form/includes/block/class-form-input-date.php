<?php
/**
 * Form Input Date Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Input_Date Block
 *
 * @package gutenverse-form\block
 */
class Form_Input_Date extends Block_Abstract {

	use Form_Input_Wrapper;

	/**
	 * Render content
	 *
	 * @return string
	 */
	public function render_content() {
		$input_placeholder  = isset( $this->attributes['inputPlaceholder'] ) ? $this->attributes['inputPlaceholder'] : 'Date Placeholder';
		$input_name         = isset( $this->attributes['inputName'] ) ? $this->attributes['inputName'] : 'input-date';
		$required           = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_type    = isset( $this->attributes['validationType'] ) ? $this->attributes['validationType'] : '';
		$validation_min     = isset( $this->attributes['validationMin'] ) ? $this->attributes['validationMin'] : '';
		$validation_max     = isset( $this->attributes['validationMax'] ) ? $this->attributes['validationMax'] : '';
		$validation_warning = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic      = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';
		$display_logic      = isset( $this->attributes['displayLogic'] ) ? $this->attributes['displayLogic'] : array();
		$date_format        = isset( $this->attributes['dateFormat'] ) ? $this->attributes['dateFormat'] : 'F j, Y';
		$date_start         = isset( $this->attributes['dateStart'] ) ? $this->attributes['dateStart'] : '';
		$date_end           = isset( $this->attributes['dateEnd'] ) ? $this->attributes['dateEnd'] : '';
		$date_range         = isset( $this->attributes['dateRange'] ) ? $this->attributes['dateRange'] : false;
		$use_icon           = isset( $this->attributes['useIcon'] ) ? $this->attributes['useIcon'] : false;

		$validation = array(
			'type'              => 'date',
			'required'          => $required,
			'validationType'    => $validation_type,
			'validationMin'     => $validation_min,
			'validationMax'     => $validation_max,
			'validationWarning' => $validation_warning,
		);

		$date_setting = array(
			'dateFormat' => $date_format,
		);

		if ( $date_start ) {
			$date_setting['minDate'] = $date_start;
		}
		if ( $date_end ) {
			$date_setting['maxDate'] = $date_end;
		}
		if ( $date_range ) {
			$date_setting['mode'] = 'range';
		}

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
            data-date="' . esc_attr( wp_json_encode( $date_setting ) ) . '"
            placeholder="' . esc_attr( $input_placeholder ) . '"
            name="' . esc_attr( $input_name ) . '"
            class="gutenverse-input gutenverse-input-date"
            type="text"' . $additional_props . '/>';

		if ( $use_icon ) {
			$html  = '<div class="input-icon-wrapper input-date">';
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
		$icon            = isset( $this->attributes['icon'] ) ? $this->attributes['icon'] : 'gtn gtn-calendar-1-light';
		$icon_svg        = isset( $this->attributes['iconSVG'] ) ? $this->attributes['iconSVG'] : '';
		$image           = isset( $this->attributes['image'] ) ? $this->attributes['image'] : array();
		$image_alt       = isset( $this->attributes['imageAlt'] ) ? $this->attributes['imageAlt'] : '';
		$lazy_load       = isset( $this->attributes['lazyLoad'] ) ? $this->attributes['lazyLoad'] : false;

		$html = '';

		switch ( $icon_type ) {
			case 'icon':
			case 'svg':
				$html .= '<div class="form-input-date-icon type-icon">';
				$html .= '<div class="icon style-' . esc_attr( $icon_style_mode ) . '">';
				$html .= $this->render_icon( $icon_type, $icon, $icon_svg );
				$html .= '</div></div>';
				break;
			case 'image':
				if ( ! empty( $image ) ) {
					$image_url = isset( $image['url'] ) ? $image['url'] : '';
					$alt       = $image_alt ? $image_alt : ( isset( $image['alt'] ) ? $image['alt'] : '' );
					$loading   = $lazy_load ? ' loading="lazy"' : '';

					$html .= '<div class="form-input-date-icon type-image">';
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
		$this->attributes['inputLabel'] = isset( $this->attributes['inputLabel'] ) ? $this->attributes['inputLabel'] : 'Date';
		return $this->render_wrapper( $this->render_content(), 'date' );
	}
}
