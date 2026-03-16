<?php
/**
 * Form Input Email Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Input_Email Block
 *
 * @package gutenverse-form\block
 */
class Form_Input_Email extends Block_Abstract {
	/**
	 * Render content
	 *
	 * @return string
	 */
	public function render_content() {
		$input_placeholder  = isset( $this->attributes['inputPlaceholder'] ) ? $this->attributes['inputPlaceholder'] : 'Email Placeholder';
		$input_name         = isset( $this->attributes['inputName'] ) ? $this->attributes['inputName'] : 'input-email';
		$required           = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_type    = isset( $this->attributes['validationType'] ) ? $this->attributes['validationType'] : '';
		$validation_min     = isset( $this->attributes['validationMin'] ) ? $this->attributes['validationMin'] : '';
		$validation_max     = isset( $this->attributes['validationMax'] ) ? $this->attributes['validationMax'] : '';
		$validation_warning = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic      = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';
		$display_logic      = isset( $this->attributes['displayLogic'] ) ? $this->attributes['displayLogic'] : array();
		$use_icon           = isset( $this->attributes['useIcon'] ) ? $this->attributes['useIcon'] : false;

		$validation = array(
			'type'              => 'email',
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

		$input_html = '<input
            data-validation=\'' . wp_json_encode( $validation ) . '\'
            placeholder="' . esc_attr( $input_placeholder ) . '"
            name="' . esc_attr( $input_name ) . '"
            class="gutenverse-input gutenverse-input-email"
            type="email"' . $additional_props . '/>';

		if ( $use_icon ) {
			$html  = '<div class="input-icon-wrapper input-email">';
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
		$icon            = isset( $this->attributes['icon'] ) ? $this->attributes['icon'] : 'gtn gtn-email-light';
		$icon_svg        = isset( $this->attributes['iconSVG'] ) ? $this->attributes['iconSVG'] : '';
		$image           = isset( $this->attributes['image'] ) ? $this->attributes['image'] : array();
		$image_alt       = isset( $this->attributes['imageAlt'] ) ? $this->attributes['imageAlt'] : '';
		$lazy_load       = isset( $this->attributes['lazyLoad'] ) ? $this->attributes['lazyLoad'] : false;

		$html = '';

		switch ( $icon_type ) {
			case 'icon':
			case 'svg':
				$html .= '<div class="form-input-email-icon type-icon">';
				$html .= '<div class="icon style-' . esc_attr( $icon_style_mode ) . '">';
				$html .= $this->render_icon( $icon_type, $icon, $icon_svg );
				$html .= '</div></div>';
				break;
			case 'image':
				if ( ! empty( $image ) ) {
					$image_url = isset( $image['url'] ) ? $image['url'] : '';
					$alt       = $image_alt ? $image_alt : ( isset( $image['alt'] ) ? $image['alt'] : '' );
					$loading   = $lazy_load ? ' loading="lazy"' : '';

					$html .= '<div class="form-input-email-icon type-image">';
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
		$element_id         = $this->get_element_id();
		$display_classes    = $this->set_display_classes();
		$animation_class    = $this->set_animation_classes();
		$custom_classes     = $this->get_custom_classes();
		$input_label        = isset( $this->attributes['inputLabel'] ) ? $this->attributes['inputLabel'] : 'Email';
		$input_helper       = isset( $this->attributes['inputHelper'] ) ? $this->attributes['inputHelper'] : 'Input Helper';
		$show_label         = isset( $this->attributes['showLabel'] ) ? $this->attributes['showLabel'] : true;
		$show_helper        = isset( $this->attributes['showHelper'] ) ? $this->attributes['showHelper'] : true;
		$position           = isset( $this->attributes['position'] ) ? $this->attributes['position'] : 'top';
		$required           = isset( $this->attributes['required'] ) ? $this->attributes['required'] : false;
		$validation_warning = isset( $this->attributes['validationWarning'] ) ? $this->attributes['validationWarning'] : 'Input Invalid';
		$default_logic      = isset( $this->attributes['defaultLogic'] ) ? $this->attributes['defaultLogic'] : '';

		$class_name = 'guten-element guten-form-input-email guten-form-input guten-input-position-' . $position . ' ' . $element_id . $display_classes . $animation_class . $custom_classes;

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
