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

		$this->init_integrations();
	}

	/**
	 * Get list of available services
	 *
	 * @return array
	 */
	public static function get_services() {
		return array(
			array('service_name' => 'whatsapp', 'documentation_url' => 'https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started'),
			array('service_name' => 'telegram', 'documentation_url' => 'https://core.telegram.org/bots/api'),
			array('service_name' => 'discord', 'documentation_url' => 'https://discord.com/developers/docs/intro'),
			array('service_name' => 'mailchimp', 'documentation_url' => 'https://mailchimp.com/developer/'),
			array('service_name' => 'slack', 'documentation_url' => 'https://api.slack.com/'),
			array('service_name' => 'webhook', 'documentation_url' => 'https://api.slack.com/'),
			array('service_name' => 'get_response', 'documentation_url' => 'https://api.slack.com/'),
			array('service_name' => 'drip', 'documentation_url' => 'https://api.slack.com/'),
			array('service_name' => 'active_campaign', 'documentation_url' => 'https://api.slack.com/'),
			array('service_name' => 'convert_kit', 'documentation_url' => 'https://api.slack.com/'),
			array('service_name' => 'mailer', 'documentation_url' => 'https://api.slack.com/'),
			array('service_name' => 'google_sheets', 'documentation_url' => 'https://api.slack.com/'),
		);
	}

	/**
	 * Initialize all enabled integrations.
	 */
	public function init_integrations() {
		$services = self::get_services();
		foreach ( $services as $service ) {
			$this->get_service_instance( $service['service_name'] );
		}
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
				$allowed_services = self::get_services();
				$service_names    = array_column( $allowed_services, 'service_name' );
				$current_service  = in_array( $service, $service_names, true ) ? $service : '';

				$config['currentService'] = $current_service;

				if ( $current_service ) {
					$instance = $this->get_service_instance( $current_service );
					if ( $instance ) {
						$config['serviceFields']   = method_exists( $instance, 'get_fields' ) ? $instance->get_fields() : array();
						$config['serviceSettings'] = method_exists( $instance, 'get_settings' ) ? $instance->get_settings() : array();

						// Documentation URL
						foreach ( $allowed_services as $s ) {
							if ( $s['service_name'] === $current_service ) {
								$config['integrationDocumentationUrl'] = $s['documentation_url'];
								$config['serviceName']                 = $s['service_name'];
								break;
							}
						}
					}
				}

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
	/**
	 * Get service instance
	 *
	 * @param string $service .
	 *
	 * @return object|null
	 */
	public function get_service_instance( $service ) {
		$class_name = str_replace( '_', ' ', $service );
		$class_name = ucwords( $class_name );
		$class_name = str_replace( ' ', '_', $class_name );
		$class_name = '\\Gutenverse_Form\\Integrations\\' . $class_name;

		if ( class_exists( $class_name ) ) {
			return new $class_name();
		}

		return null;
	}

	/**
	 * Parse template string with form data and generic placeholders.
	 *
	 * @param string $template Template string.
	 * @param array  $data     Form data.
	 * @param int    $entry_id Entry ID.
	 * @param int    $form_id  Form ID.
	 * @return string
	 */
	public static function parse_template( $template, $data, $entry_id = 0, $form_id = 0 ) {
		if ( empty( $template ) ) {
			return '';
		}

		// Generic placeholders.
		$template = str_replace( '{form_id}', $form_id, $template );
		$template = str_replace( '{entry_id}', $entry_id, $template );
		$template = str_replace( '{form_title}', get_the_title( $form_id ), $template );
		$template = str_replace( '{site_title}', get_bloginfo( 'name' ), $template );

		// Field placeholders.
		$all_fields = '';
		foreach ( $data as $key => $value ) {
			$display_value = is_array( $value ) ? implode( ', ', $value ) : $value;
			$all_fields   .= "{$key}: {$display_value}\n";
			$template      = str_replace( '{' . $key . '}', $display_value, $template );
			$template      = str_replace( '{{' . $key . '}}', $display_value, $template );
		}

		$template = str_replace( '{all_fields}', trim( $all_fields ), $template );

		return $template;
	}
}
