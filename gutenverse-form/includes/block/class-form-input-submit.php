<?php
/**
 * Form Input Submit Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Input_Submit Block
 *
 * @package gutenverse-form\block
 */
class Form_Input_Submit extends Block_Abstract {
	/**
	 * Render content
	 *
	 * @return string
	 */
	public function render_content() {
		$content        = isset( $this->attributes['content'] ) ? $this->attributes['content'] : '';
		$button_type    = isset( $this->attributes['buttonType'] ) ? $this->attributes['buttonType'] : 'default';
		$button_size    = isset( $this->attributes['buttonSize'] ) ? $this->attributes['buttonSize'] : 'sm';
		$show_icon      = isset( $this->attributes['showIcon'] ) ? $this->attributes['showIcon'] : false;
		$icon           = isset( $this->attributes['icon'] ) ? $this->attributes['icon'] : 'fab fa-wordpress';
		$icon_type      = isset( $this->attributes['iconType'] ) ? $this->attributes['iconType'] : 'icon';
		$icon_svg       = isset( $this->attributes['iconSVG'] ) ? $this->attributes['iconSVG'] : '';
		$icon_position  = isset( $this->attributes['iconPosition'] ) ? $this->attributes['iconPosition'] : 'before';
		$aria_label     = isset( $this->attributes['ariaLabel'] ) ? $this->attributes['ariaLabel'] : '';

		$button_class = 'guten-button gutenverse-input-submit';
		if ( 'default' !== $button_type ) {
			$button_class .= ' guten-button-' . $button_type;
		}
		if ( $button_size ) {
			$button_class .= ' guten-button-' . $button_size;
		}

		$icon_html = $show_icon ? $this->render_icon( $icon_type, $icon, $icon_svg ) : '';

		$html  = '<div class="form-notification"></div>';
		$html .= '<button class="' . esc_attr( $button_class ) . '" type="submit" aria-label="' . esc_attr( $aria_label ) . '">';

		if ( $show_icon && 'before' === $icon_position ) {
			$html .= $icon_html;
		}

		$html .= '<span>' . wp_kses_post( $content ) . '</span>';

		if ( $show_icon && 'after' === $icon_position ) {
			$html .= $icon_html;
		}

		$html .= '</button>';
		$html .= '<div class="gutenverse-input-submit-loader">';
		$html .= '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M272 112C272 85.5 293.5 64 320 64C346.5 64 368 85.5 368 112C368 138.5 346.5 160 320 160C293.5 160 272 138.5 272 112zM272 528C272 501.5 293.5 480 320 480C346.5 480 368 501.5 368 528C368 554.5 346.5 576 320 576C293.5 576 272 554.5 272 528zM112 272C138.5 272 160 293.5 160 320C160 346.5 138.5 368 112 368C85.5 368 64 346.5 64 320C64 293.5 85.5 272 112 272zM480 320C480 293.5 501.5 272 528 272C554.5 272 576 293.5 576 320C576 346.5 554.5 368 528 368C501.5 368 480 346.5 480 320zM139 433.1C157.8 414.3 188.1 414.3 206.9 433.1C225.7 451.9 225.7 482.2 206.9 501C188.1 519.8 157.8 519.8 139 501C120.2 482.2 120.2 451.9 139 433.1zM139 139C157.8 120.2 188.1 120.2 206.9 139C225.7 157.8 225.7 188.1 206.9 206.9C188.1 225.7 157.8 225.7 139 206.9C120.2 188.1 120.2 157.8 139 139zM501 433.1C519.8 451.9 519.8 482.2 501 501C482.2 519.8 451.9 519.8 433.1 501C414.3 482.2 414.3 451.9 433.1 433.1C451.9 414.3 482.2 414.3 501 433.1z"/></svg>';
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
		$element_id      = $this->get_element_id();
		$display_classes = $this->set_display_classes();
		$animation_class = $this->set_animation_classes();
		$custom_classes  = $this->get_custom_classes();

		$class_name = 'guten-element guten-button-wrapper guten-submit-wrapper ' . $element_id . $display_classes . $animation_class . $custom_classes;

		$html = '<div class="' . esc_attr( trim( $class_name ) ) . '">';
		$html .= $this->render_content();
		$html .= '</div>';

		return $html;
	}
}
