<?php
/**
 * Editor Assets class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse
 */

namespace Gutenverse_Form;

/**
 * Class Editor Assets
 *
 * @package gutenverse
 */
class Editor_Assets {
	/**
	 * Init constructor.
	 */
	public function __construct() {
		add_filter( 'gutenverse_block_config', array( $this, 'block_config' ) );
		add_action( 'gutenverse_include_block', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * Enqueue scripts
	 */
	public function enqueue_scripts() {
		// Register & Enqueue Style.
		wp_enqueue_style(
			'gutenverse-form-blocks',
			GUTENVERSE_FORM_URL . '/assets/css/blocks.css',
			array( 'wp-edit-blocks', 'fontawesome-gutenverse' ),
			GUTENVERSE_FORM_VERSION
		);

		wp_enqueue_style(
			'gutenverse-form-frontend',
			GUTENVERSE_FORM_URL . '/assets/css/frontend.css',
			array( 'gutenverse-iconlist', 'fontawesome-gutenverse' ),
			GUTENVERSE_FORM_VERSION
		);

		wp_enqueue_script( 'gutenverse-frontend-event' );

		$include   = ( include GUTENVERSE_FORM_DIR . '/lib/dependencies/blocks.asset.php' )['dependencies'];
		$include[] = 'gutenverse-frontend-event';

		wp_enqueue_script(
			'gutenverse-form-blocks',
			GUTENVERSE_FORM_URL . '/assets/js/blocks.js',
			$include,
			GUTENVERSE_FORM_VERSION,
			true
		);

		wp_set_script_translations(
			'gutenverse-form-blocks',
			'gutenverse-form',
			GUTENVERSE_FORM_LANG_DIR
		);
	}

	/**
	 * Editor config
	 *
	 * @param array $config Config.
	 */
	public function block_config( $config ) {
		$config['gutenverseFormImgDir']              = GUTENVERSE_FORM_URL . '/assets/img';
		$config['pluginVersions'][ GUTENVERSE_FORM ] = array(
			'name'           => GUTENVERSE_FORM_NAME,
			'version'        => GUTENVERSE_FORM_VERSION,
			'currentNotice'  => GUTENVERSE_FORM_NOTICE_VERSION,
			'noticeVersions' => array( '1.0.0' ),
		);

		return $config;
	}
}
