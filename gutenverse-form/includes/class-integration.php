<?php
/**
 * Integration class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse
 */

namespace Gutenverse_Form;

/**
 * Class Integration
 *
 * @package gutenverse-form
 */
class Integration {
	/**
	 * Init constructor.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'integration_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * Enqueue Scripts
	 */
	public function enqueue_scripts() {
		$screen = get_current_screen();

		if ( 'form_page_form_integration' === $screen->id ) {
			$asset_file = GUTENVERSE_FORM_DIR . 'lib/dependencies/integration.asset.php';

			if ( file_exists( $asset_file ) ) {
				$asset = require $asset_file;

				$dependencies = array_merge( $asset['dependencies'], array( 'gutenverse-core-event', 'gutenverse-components-event' ) );

				wp_enqueue_script(
					'gutenverse-form-integration',
					GUTENVERSE_FORM_URL . '/assets/js/integration.js',
					$dependencies,
					$asset['version'],
					true
				);

				$config = \Gutenverse\Framework\Init::instance()->editor_assets->gutenverse_config();
				if ( ! isset( $config['plugins'] ) ) {
					$config['plugins'] = array();
				}
				if ( ! isset( $config['imgDir'] ) ) {
					$config['imgDir'] = '';
				}

				if ( ! current_user_can( 'manage_options' ) ) {
					return;
				}

				$config['integrations'] = get_option( 'gutenverse_form_integrations', array() );

				$service          = isset( $_GET['service'] ) ? sanitize_key( wp_unslash( $_GET['service'] ) ) : '';
				$allowed_services = array(
					'whatsapp',
					'telegram',
					'discord',
					'mailchimp',
					'slack',
					'webhook',
					'get_response',
					'drip',
					'active_campaign',
					'convert_kit',
					'mailer',
					'google_sheets',
				);

				$config['currentService'] = in_array( $service, $allowed_services, true ) ? $service : '';

				wp_localize_script(
					'gutenverse-form-integration',
					'GutenverseConfig',
					$config
				);

				wp_enqueue_style(
					'gutenverse-form-integration',
					GUTENVERSE_FORM_URL . '/assets/css/integration.css',
					array(),
					$asset['version']
				);

				wp_set_script_translations( 'gutenverse-form-integration', 'gutenverse-form', GUTENVERSE_FORM_LANG_DIR );
			}
		}
	}

	/**
	 * Integration Menu
	 */
	public function integration_menu() {
		add_submenu_page(
			Form::POST_TYPE,
			esc_html__( 'Integration', 'gutenverse-form' ),
			esc_html__( 'Integration', 'gutenverse-form' ),
			'manage_options',
			'form_integration',
			array( $this, 'integration_page' )
		);
	}

	/**
	 * Integration Page
	 */
	public function integration_page() {
		?>
		<div class="wrap">
			<div id="gutenverse-form-integration"></div>
		</div>
		<?php
	}
}
