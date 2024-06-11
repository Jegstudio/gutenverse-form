<?php
/**
 * Dashboard class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse
 */

namespace Gutenverse_Form;

/**
 * Class Dashboard
 *
 * @package gutenverse-form
 */
class Dashboard {
	/**
	 * Init constructor.
	 */
	public function __construct() {
		add_filter( 'gutenverse_dashboard_config', array( $this, 'dashboard_config' ) );
		add_filter( 'gutenverse_include_dashboard', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * Dashboard scripts.
	 */
	public function enqueue_scripts() {
		wp_enqueue_script( 'gutenverse-frontend-event' );

		$include = ( include GUTENVERSE_FORM_DIR . '/lib/dependencies/blocks.asset.php' )['dependencies'];

		wp_enqueue_script(
			'gutenverse-form-blocks',
			GUTENVERSE_FORM_URL . '/assets/js/blocks.js',
			$include,
			GUTENVERSE_FORM_VERSION,
			true
		);

		$include = ( include GUTENVERSE_FORM_DIR . '/lib/dependencies/dashboard.asset.php' )['dependencies'];

		wp_enqueue_script(
			'gutenverse-form-dashboard',
			GUTENVERSE_FORM_URL . '/assets/js/dashboard.js',
			$include,
			GUTENVERSE_FORM_VERSION,
			true
		);

		wp_enqueue_style(
			'gutenverse-form-dashboard',
			GUTENVERSE_FORM_URL . '/assets/css/update-notice.css',
			array(),
			GUTENVERSE_FORM_VERSION
		);
	}

	/**
	 * Editor config
	 *
	 * @param array $config Config.
	 */
	public function dashboard_config( $config ) {
		$config['gutenverseFormAssetURL']            = GUTENVERSE_FORM_URL . '/assets/';
		$config['pluginVersions'][ GUTENVERSE_FORM ] = array(
			'name'           => GUTENVERSE_FORM_NAME,
			'version'        => GUTENVERSE_FORM_VERSION,
			'currentNotice'  => GUTENVERSE_FORM_NOTICE_VERSION,
			'noticeVersions' => array( '1.0.0' ),
		);

		return $config;
	}
}
