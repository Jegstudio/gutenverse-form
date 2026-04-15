<?php
/**
 * Form Notice Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Notice Block
 *
 * @package gutenverse-form\block
 */
class Form_Notice extends Block_Abstract {
	/**
	 * Render notice data attribute.
	 *
	 * @return string
	 */
	private function render_notice_data() {
		$data = array(
			'messageSource'     => isset( $this->attributes['messageSource'] ) ? $this->attributes['messageSource'] : 'default',
			'successMessage'    => isset( $this->attributes['successMessage'] ) ? $this->attributes['successMessage'] : 'Form submitted successfully.',
			'errorMessage'      => isset( $this->attributes['errorMessage'] ) ? $this->attributes['errorMessage'] : 'There was an error submitting the form.',
			'iconSuccess'       => isset( $this->attributes['iconSuccess'] ) ? $this->attributes['iconSuccess'] : 'fas fa-check-circle',
			'iconError'         => isset( $this->attributes['iconError'] ) ? $this->attributes['iconError'] : 'gtn gtn-warning-light',
			'iconSuccessType'   => isset( $this->attributes['iconSuccessType'] ) ? $this->attributes['iconSuccessType'] : 'icon',
			'iconErrorType'     => isset( $this->attributes['iconErrorType'] ) ? $this->attributes['iconErrorType'] : 'icon',
			'iconSuccessSVG'    => isset( $this->attributes['iconSuccessSVG'] ) ? $this->attributes['iconSuccessSVG'] : '',
			'iconErrorSVG'      => isset( $this->attributes['iconErrorSVG'] ) ? $this->attributes['iconErrorSVG'] : '',
			'iconLayoutSuccess' => isset( $this->attributes['iconLayoutSuccess'] ) ? $this->attributes['iconLayoutSuccess'] : 'left',
			'iconLayoutError'   => isset( $this->attributes['iconLayoutError'] ) ? $this->attributes['iconLayoutError'] : 'left',
		);

		return esc_attr( wp_json_encode( $data ) );
	}

	/**
	 * Render view in frontend.
	 *
	 * @return string
	 */
	public function render_frontend() {
		if ( ! empty( trim( $this->block_data->inner_html ) ) && apply_filters( 'gutenverse_force_dynamic', false ) ) {
			return $this->content;
		}

		$element_id      = $this->get_element_id();
		$display_classes = $this->set_display_classes();
		$animation_class = $this->set_animation_classes();
		$custom_classes  = $this->get_custom_classes();

		$class_name = 'guten-element guten-form-notice ' . $element_id . $display_classes . $animation_class . $custom_classes;

		$html  = '<div class="' . esc_attr( trim( $class_name ) ) . '" data-notice="' . $this->render_notice_data() . '">';
		$html .= '<div class="guten-form-notice-wrapper" style="display: none;">';
		$html .= '<div class="guten-form-notice-icon"></div>';
		$html .= '<div class="guten-form-notice-content"></div>';
		$html .= '</div>';
		$html .= '</div>';

		return $html;
	}
}
