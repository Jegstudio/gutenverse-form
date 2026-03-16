<?php
/**
 * Form Input Recaptcha Block class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form\block
 */

namespace Gutenverse_Form\Block;

use Gutenverse\Framework\Block\Block_Abstract;

/**
 * Class Form_Input_Recaptcha Block
 *
 * @package gutenverse-form\block
 */
class Form_Input_Recaptcha extends Block_Abstract {
	/**
	 * Render content
	 *
	 * @return string
	 */
	public function render_content() {
		$site_key = isset( $this->attributes['siteKey'] ) ? $this->attributes['siteKey'] : '';

		$class_names = array(
			'guten-element',
			'gutenverse-recaptcha',
			'guten-form-input-recaptcha',
			'g-recaptcha',
		);

		return '<div class="' . esc_attr( implode( ' ', $class_names ) ) . '" data-sitekey="' . esc_attr( $site_key ) . '"></div>';
	}

	/**
	 * Render view in frontend
	 */
	public function render_frontend() {
		return $this->render_content();
	}
}
