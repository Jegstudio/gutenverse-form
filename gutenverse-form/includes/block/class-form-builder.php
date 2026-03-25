<?php
/**
 * Form Builder Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Builder Block
 *
 * @package gutenverse-form\block
 */
class Form_Builder extends Block_Abstract {

	/**
	 * Render content (inner blocks + sticky data)
	 *
	 * @return string
	 */
	public function render_content() {
		$element_id = $this->get_element_id();
		$sticky     = isset( $this->attributes['sticky'] ) ? $this->attributes['sticky'] : array( 'Desktop' => false );
		$is_sticky  = isset( $sticky['Desktop'] ) && true === $sticky['Desktop'];

		$sticky_data_html = '';
		if ( $is_sticky ) {
			$id              = $element_id ? explode( '-', $element_id )[1] : '';
			$sticky_show_on  = isset( $this->attributes['stickyShowOn'] ) ? $this->attributes['stickyShowOn'] : 'both';
			$sticky_ease     = isset( $this->attributes['stickyEase'] ) ? $this->attributes['stickyEase'] : 'none';
			$sticky_position = isset( $this->attributes['stickyPosition'] ) ? $this->attributes['stickyPosition'] : 'top';
			$sticky_duration = isset( $this->attributes['stickyDuration'] ) ? $this->attributes['stickyDuration'] : 0.25;
			$top_sticky      = isset( $this->attributes['topSticky'] ) ? $this->attributes['topSticky'] : array();
			$bottom_sticky   = isset( $this->attributes['bottomSticky'] ) ? $this->attributes['bottomSticky'] : array();

			$sticky_data = array(
				'sticky'         => $sticky,
				'stickyShowOn'   => $sticky_show_on,
				'stickyPosition' => $sticky_position,
				'stickyEase'     => $sticky_ease,
				'stickyDuration' => $sticky_duration,
				'topSticky'      => $top_sticky,
				'bottomSticky'   => $bottom_sticky,
			);

			$sticky_data_html = '<div class="guten-data"><div data-var="stickyData' . esc_attr( $id ) . '" data-value=\'' . wp_json_encode( $sticky_data ) . '\'></div></div>';
		}

		return $sticky_data_html . $this->content;
	}

	/**
	 * Render view in editor
	 *
	 * @return string
	 */
	public function render_gutenberg() {
		return $this->render_content();
	}

	/**
	 * Render view in frontend
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

		$form_id         = isset( $this->attributes['formId'] ) ? $this->attributes['formId'] : null;
		$hide_after      = isset( $this->attributes['hideAfterSubmit'] ) ? $this->attributes['hideAfterSubmit'] : false;
		$redirect_to     = isset( $this->attributes['redirectTo'] ) ? $this->attributes['redirectTo'] : '';
		$sticky          = isset( $this->attributes['sticky'] ) ? $this->attributes['sticky'] : array( 'Desktop' => false );
		$sticky_position = isset( $this->attributes['stickyPosition'] ) ? $this->attributes['stickyPosition'] : 'top';
		$is_sticky       = isset( $sticky['Desktop'] ) && true === $sticky['Desktop'];
		$id              = $element_id ? explode( '-', $element_id )[1] : '';

		$class_name = implode(
			' ',
			array_filter(
				array(
					'guten-element',
					'guten-form-builder',
					$element_id,
					trim( $animation_class ),
					trim( $display_classes ),
					trim( $custom_classes ),
					$is_sticky ? 'guten-sticky' : '',
					$is_sticky ? 'sticky-' . esc_attr( $sticky_position ) : '',
				)
			)
		);

		$data_attrs  = ' data-form-id="' . esc_attr( isset( $form_id['value'] ) ? $form_id['value'] : '' ) . '"';
		$data_attrs .= ' data-hide-after="' . esc_attr( $hide_after ? 'true' : 'false' ) . '"';
		$data_attrs .= ' data-redirect="' . esc_url( $redirect_to ) . '"';

		if ( $is_sticky ) {
			$data_attrs .= ' data-id="' . esc_attr( $id ) . '"';
		}

		$html  = '<form style="display:none" class="' . esc_attr( trim( $class_name ) ) . '"' . $data_attrs . '>';
		$html .= $this->render_content();
		$html .= '</form>';

		$html = apply_filters( 'gutenverse_cursor_move_effect_script', $html, $this->attributes, $element_id );

		return $html;
	}
}
