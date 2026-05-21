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
		$config['hasIntegrationPro']                 = Integration::has_pro_integration_runtime();
		$config['integrationUpgradeUrl']             = apply_filters( 'gutenverse_form_integration_upgrade_url', admin_url( 'admin.php?page=gutenverse-dashboard#/upgrade-pro' ) );
		$config['integrations']                      = get_option( 'gutenverse_form_integrations', array() );

		if ( current_user_can( 'manage_options' ) ) {
			$service          = isset( $_GET['service'] ) ? sanitize_key( wp_unslash( $_GET['service'] ) ) : '';
			$allowed_services = Integration::get_services();
			$service_names    = array_column( $allowed_services, 'service_name' );
			$current_service  = in_array( $service, $service_names, true ) ? $service : '';

			$config['currentService'] = $current_service;

			if ( $current_service ) {
				$integration = Init::instance()->integration;
				$instance    = $integration ? $integration->get_service_instance( $current_service ) : null;

				if ( $instance ) {
					$fields   = method_exists( $instance, 'get_fields' ) ? $instance->get_fields() : array();
					$settings = method_exists( $instance, 'get_settings' ) ? $instance->get_settings() : array();

					$config['serviceFields']   = $integration->prepare_service_fields_for_ui( $fields, $settings );
					$config['serviceSettings'] = $integration->prepare_service_settings_for_ui( $fields, $settings );

					foreach ( $allowed_services as $allowed_service ) {
						if ( $allowed_service['service_name'] === $current_service ) {
							$config['integrationDocumentationUrl'] = $allowed_service['documentation_url'];
							$config['integrationApiVersion']       = $allowed_service['api_version'] ?? '';
							$config['serviceName']                 = $allowed_service['service_name'];
							break;
						}
					}
				}
			}
		}

		$config['pluginVersions'][ GUTENVERSE_FORM ] = array(
			'name'           => GUTENVERSE_FORM_NAME,
			'version'        => GUTENVERSE_FORM_VERSION,
			'currentNotice'  => GUTENVERSE_FORM_NOTICE_VERSION,
			'noticeVersions' => array( '1.0.0' ),
		);

		return $config;
	}
}
