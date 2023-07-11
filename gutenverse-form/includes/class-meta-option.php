<?php
/**
 * Meta Option Class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form
 */

namespace Gutenverse_Form;

use Gutenverse\Framework\Meta_Option as Meta;

/**
 * Class Meta Option
 *
 * @package gutenverse-form
 */
class Meta_Option {
	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'gutenverse_check_update', array( $this, 'check_update' ) );
		add_action( 'gutenverse_initial_meta_option', array( $this, 'init_meta_option' ) );
	}

	/**
	 * Initial Option.
	 *
	 * @param array $options Options.
	 */
	public function init_meta_option( $options ) {
		$options['tracker'][ GUTENVERSE_FORM ] = array(
			'install_time'    => time(),
			'current_version' => '0.0.0',
			'version_history' => array(),
			'upgrade_time'    => null,
		);

		return $options;
	}

	/**
	 * Check if plugin has been upgraded.
	 */
	public function check_update() {
		$meta    = Meta::instance();
		$tracker = $meta->get_option( 'tracker', array() );

		if ( ! isset( $tracker[ GUTENVERSE_FORM ] ) ) {
			$tracker = $this->set_tracker( $meta, $tracker );
		}

		$version = $tracker[ GUTENVERSE_FORM ]['current_version'];

		if ( version_compare( $version, GUTENVERSE_FORM_VERSION, '<' ) ) {
			$meta->upgrade_plugin( $version, GUTENVERSE_FORM_VERSION, GUTENVERSE_FORM );
		}
	}

	/**
	 * Set tracker for who comes from older version
	 *
	 * @param object $meta Meta Option Framework.
	 * @param array  $tracker Plugin history tracker.
	 */
	public function set_tracker( $meta, $tracker ) {
		$tracker[ GUTENVERSE_FORM ] = array(
			'install_time'    => time(),
			'current_version' => GUTENVERSE_FORM_VERSION,
			'version_history' => array(),
			'upgrade_time'    => null,
		);

		$meta->set_option( 'tracker', $tracker );

		return $tracker;
	}
}
