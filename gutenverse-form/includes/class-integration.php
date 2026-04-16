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
	 * Max number of log records stored per service on an entry.
	 */
	const MAX_LOG_RECORDS = 20;
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
			array(
				'service_name'      => 'whatsapp',
				'documentation_url' => 'https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started',
			),
			array(
				'service_name'      => 'telegram',
				'documentation_url' => 'https://core.telegram.org/bots/api',
			),
			array(
				'service_name'      => 'discord',
				'documentation_url' => 'https://discord.com/developers/docs/intro',
			),
			array(
				'service_name'      => 'mailchimp',
				'documentation_url' => 'https://mailchimp.com/developer/',
			),
			array(
				'service_name'      => 'slack',
				'documentation_url' => 'https://api.slack.com/',
			),
			array(
				'service_name'      => 'webhook',
				'documentation_url' => 'https://api.slack.com/',
			),
			array(
				'service_name'      => 'get_response',
				'documentation_url' => 'https://apidocs.getresponse.com/',
			),
			array(
				'service_name'      => 'drip',
				'documentation_url' => 'https://api.slack.com/',
			),
			array(
				'service_name'      => 'active_campaign',
				'documentation_url' => 'https://api.slack.com/',
			),
			array(
				'service_name'      => 'convert_kit',
				'documentation_url' => 'https://api.slack.com/',
			),
			array(
				'service_name'      => 'mailer',
				'documentation_url' => 'https://api.slack.com/',
			),
			array(
				'service_name'      => 'google_sheets',
				'documentation_url' => 'https://api.slack.com/',
			),
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

						// Documentation URL.
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

	/**
	 * Prepare entry data for template parsing.
	 *
	 * @param array $params Submission params.
	 *
	 * @return array
	 */
	public static function prepare_entry_data( $params ) {
		$data = array();

		if ( isset( $params['entry-data'] ) && is_array( $params['entry-data'] ) ) {
			foreach ( $params['entry-data'] as $item ) {
				if ( isset( $item['id'] ) && isset( $item['value'] ) ) {
					$value = $item['value'];

					if ( is_array( $value ) ) {
						$value = implode( ', ', array_map( 'strval', $value ) );
					}

					$data[ sanitize_key( $item['id'] ) ] = is_scalar( $value ) ? (string) $value : '';
				}
			}
		}

		return $data;
	}

	/**
	 * Determine whether saved builder data exists for a service.
	 *
	 * @param string $service      Service name.
	 * @param array  $form_setting Saved form settings.
	 *
	 * @return bool
	 */
	public static function has_local_service_config( $service, $form_setting ) {
		$service_settings = self::get_local_service_settings( $service, $form_setting );
		if ( ! empty( $service_settings ) ) {
			return true;
		}

		return ! empty( self::get_service_actions( $service, array(), $form_setting ) );
	}

	/**
	 * Get per-form settings for a service.
	 *
	 * @param string $service      Service name.
	 * @param array  $form_setting Saved form settings.
	 *
	 * @return array
	 */
	public static function get_local_service_settings( $service, $form_setting ) {
		if ( isset( $form_setting['integrations'][ $service ] ) && is_array( $form_setting['integrations'][ $service ] ) ) {
			return $form_setting['integrations'][ $service ];
		}

		return array();
	}

	/**
	 * Get block action settings for a service.
	 *
	 * Prefer the server-side saved form configuration over request payloads.
	 *
	 * @param string $service      Service name.
	 * @param array  $params       Submission params.
	 * @param array  $form_setting Saved form settings.
	 *
	 * @return array
	 */
	public static function get_service_actions( $service, $params, $form_setting ) {
		$actions = array();

		if ( isset( $form_setting['integrations']['actions'] ) && is_array( $form_setting['integrations']['actions'] ) ) {
			$actions = $form_setting['integrations']['actions'];
		} elseif ( isset( $params['integrations']['actions'] ) && is_array( $params['integrations']['actions'] ) ) {
			$actions = $params['integrations']['actions'];
		}

		return array_values(
			array_filter(
				$actions,
				function ( $action ) use ( $service ) {
					return is_array( $action ) && ( $action['type'] ?? '' ) === $service;
				}
			)
		);
	}

	/**
	 * Log an integration result on the entry and PHP error log.
	 *
	 * @param int    $entry_id Entry ID.
	 * @param string $service  Service name.
	 * @param string $status   success|error|skipped.
	 * @param string $message  Log message.
	 * @param array  $context  Extra context.
	 *
	 * @return void
	 */
	public static function log_result( $entry_id, $service, $status, $message, $context = array() ) {
		$record = array(
			'time'    => current_time( 'mysql', true ),
			'status'  => sanitize_key( $status ),
			'message' => sanitize_text_field( $message ),
		);

		if ( ! empty( $context ) ) {
			$record['context'] = self::sanitize_log_context( $context );
		}

		if ( $entry_id > 0 ) {
			$logs = get_post_meta( $entry_id, 'integration_logs', true );
			$logs = is_array( $logs ) ? $logs : array();
			$logs[ $service ]   = isset( $logs[ $service ] ) && is_array( $logs[ $service ] ) ? $logs[ $service ] : array();
			$logs[ $service ][] = $record;
			$logs[ $service ]   = array_slice( $logs[ $service ], -self::MAX_LOG_RECORDS );

			update_post_meta( $entry_id, 'integration_logs', $logs );
		}

		error_log( // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			sprintf(
				'[Gutenverse Form][%1$s][entry:%2$d][%3$s] %4$s',
				$service,
				(int) $entry_id,
				$record['status'],
				$record['message']
			)
		);
	}

	/**
	 * Normalize a remote request result and log it.
	 *
	 * @param int                  $entry_id Entry ID.
	 * @param string               $service  Service name.
	 * @param array|bool|\WP_Error $response Request result.
	 *
	 * @return bool
	 */
	public static function handle_send_result( $entry_id, $service, $response ) {
		if ( false === $response ) {
			self::log_result( $entry_id, $service, 'skipped', __( 'Integration skipped because the configuration is incomplete or invalid.', 'gutenverse-form' ) );
			return false;
		}

		if ( is_wp_error( $response ) ) {
			self::log_result(
				$entry_id,
				$service,
				'error',
				$response->get_error_message(),
				array(
					'error_code' => $response->get_error_code(),
				)
			);
			return false;
		}

		$status_code = (int) wp_remote_retrieve_response_code( $response );
		$body        = wp_remote_retrieve_body( $response );

		if ( $status_code < 200 || $status_code >= 300 ) {
			self::log_result(
				$entry_id,
				$service,
				'error',
				sprintf(
					/* translators: %d: HTTP status code. */
					__( 'Integration request failed with HTTP %d.', 'gutenverse-form' ),
					$status_code
				),
				array(
					'status_code' => $status_code,
					'body'        => wp_strip_all_tags( self::shorten_text( $body ) ),
				)
			);
			return false;
		}

		self::log_result(
			$entry_id,
			$service,
			'success',
			sprintf(
				/* translators: %d: HTTP status code. */
				__( 'Integration request completed with HTTP %d.', 'gutenverse-form' ),
				$status_code
			),
			array(
				'status_code' => $status_code,
			)
		);

		return true;
	}

	/**
	 * Sanitize log context.
	 *
	 * @param array $context Log context.
	 *
	 * @return array
	 */
	private static function sanitize_log_context( $context ) {
		$sanitized = array();

		foreach ( $context as $key => $value ) {
			$key = sanitize_key( $key );

			if ( is_scalar( $value ) || null === $value ) {
				$sanitized[ $key ] = sanitize_text_field( (string) $value );
			} elseif ( is_array( $value ) ) {
				$sanitized[ $key ] = array_map(
					function ( $item ) {
						return is_scalar( $item ) || null === $item ? sanitize_text_field( (string) $item ) : '';
					},
					$value
				);
			}
		}

		return $sanitized;
	}

	/**
	 * Shorten log text.
	 *
	 * @param string $text Text to shorten.
	 *
	 * @return string
	 */
	private static function shorten_text( $text ) {
		$text = is_string( $text ) ? trim( $text ) : '';

		if ( strlen( $text ) <= 400 ) {
			return $text;
		}

		return substr( $text, 0, 397 ) . '...';
	}
}
