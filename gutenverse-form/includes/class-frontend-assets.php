<?php
/**
 * Frontend Assets class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse
 */

namespace Gutenverse_Form;

/**
 * Class Frontend Assets
 *
 * @package gutenverse-form
 */
class Frontend_Assets {
	/**
	 * Init constructor.
	 */
	public function __construct() {
		add_filter( 'gutenverse_include_frontend', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * Frontend Script
	 */
	public function enqueue_scripts() {
		$include   = ( include GUTENVERSE_FORM_DIR . '/lib/dependencies/frontend.asset.php' )['dependencies'];
		$include[] = 'gutenverse-frontend-event';

		wp_enqueue_script(
			'gutenverse-form-frontend',
			GUTENVERSE_FORM_URL . '/assets/js/frontend.js',
			$include,
			GUTENVERSE_FORM_VERSION,
			true
		);

		wp_enqueue_style(
			'gutenverse-form-frontend',
			GUTENVERSE_FORM_URL . '/assets/css/frontend.css',
			array( 'fontawesome-gutenverse', 'gutenverse-iconlist' ),
			GUTENVERSE_FORM_VERSION
		);
	}
}
