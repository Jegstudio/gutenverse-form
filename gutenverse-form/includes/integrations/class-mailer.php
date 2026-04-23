<?php
/**
 * MailerLite Integration Class.
 *
 * @package Gutenverse_Form
 */

namespace Gutenverse_Form\Integrations;

/**
 * Handles syncing form submissions to MailerLite subscribers.
 */
class Mailer {
	/**
	 * Integration settings used when sending subscribers.
	 *
	 * @var array
	 */
	protected $settings;

	/**
	 * Register the MailerLite integration hook.
	 */
	public function __construct() {
		add_action( 'gutenverse_form_after_store', array( $this, 'after_store' ), 10, 4 );
	}

	/**
	 * Set settings for MailerLite.
	 *
	 * @param array $settings Integration settings.
	 */
	public function set_settings( $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Get the editable settings schema for the MailerLite integration UI.
	 *
	 * @return array<string, array<string, string|bool>>
	 */
	public function get_fields() {
		return array(
			'api_key'       => array(
				'label'       => __( 'API Token', 'gutenverse-form' ),
				'description' => __( 'Enter your MailerLite API token.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'sensitive'   => true,
				'placeholder' => __( 'MailerLite API token', 'gutenverse-form' ),
			),
			'email'         => array(
				'label'       => __( 'Email', 'gutenverse-form' ),
				'description' => __( 'Use a form field placeholder such as {input-email}.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( '{input-email}', 'gutenverse-form' ),
			),
			'name'          => array(
				'label'       => __( 'Name', 'gutenverse-form' ),
				'description' => __( 'Optional subscriber name placeholder, for example {input-text-name}.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( '{input-text-name}', 'gutenverse-form' ),
			),
			'groups'        => array(
				'label'       => __( 'Group IDs JSON', 'gutenverse-form' ),
				'description' => __( 'Optional JSON array of existing MailerLite group IDs.', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => '["12345678901234567"]',
			),
			'status'        => array(
				'label'       => __( 'Status', 'gutenverse-form' ),
				'description' => __( 'Optional subscriber status: active, unsubscribed, unconfirmed, bounced, or junk.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( 'active', 'gutenverse-form' ),
			),
		);
	}

	/**
	 * Get saved MailerLite settings.
	 *
	 * @return array
	 */
	public function get_settings() {
		return get_option( 'gutenverse_form_mailer_settings', array() );
	}

	/**
	 * Parse a string setting with form data placeholders.
	 *
	 * @param string $key      Setting key.
	 * @param array  $data     Prepared form data.
	 * @param int    $entry_id Entry ID.
	 * @param int    $form_id  Form ID.
	 *
	 * @return string
	 */
	private function parse_setting( $key, $data, $entry_id, $form_id ) {
		return \Gutenverse_Form\Integration::parse_template( $this->settings[ $key ] ?? '', $data, $entry_id, $form_id );
	}

	/**
	 * Parse a JSON array setting after placeholder replacement.
	 *
	 * @param string $key      Setting key.
	 * @param array  $data     Prepared form data.
	 * @param int    $entry_id Entry ID.
	 * @param int    $form_id  Form ID.
	 *
	 * @return array
	 */
	private function decode_json_array_setting( $key, $data, $entry_id, $form_id ) {
		$value = $this->parse_setting( $key, $data, $entry_id, $form_id );

		if ( empty( $value ) ) {
			return array();
		}

		$decoded = json_decode( $value, true );

		return is_array( $decoded ) ? array_values( array_filter( $decoded, 'is_scalar' ) ) : array();
	}

	/**
	 * Upsert a MailerLite subscriber.
	 *
	 * @param array $data     Prepared form data.
	 * @param int   $entry_id Entry ID.
	 * @param int   $form_id  Form ID.
	 *
	 * @return array|\WP_Error|false
	 */
	public function send( $data, $entry_id = 0, $form_id = 0 ) {
		$api_key       = trim( (string) ( $this->settings['api_key'] ?? '' ) );
		$email         = sanitize_email( $this->parse_setting( 'email', $data, $entry_id, $form_id ) );
		$name          = trim( $this->parse_setting( 'name', $data, $entry_id, $form_id ) );
		$status        = sanitize_key( $this->parse_setting( 'status', $data, $entry_id, $form_id ) );
		$groups        = array_values(
			array_filter(
				array_map(
					static function ( $group_id ) {
						return sanitize_text_field( (string) $group_id );
					},
					$this->decode_json_array_setting( 'groups', $data, $entry_id, $form_id )
				),
				static function ( $group_id ) {
					return '' !== $group_id;
				}
			)
		);

		if ( empty( $api_key ) || empty( $email ) ) {
			return false;
		}

		if ( ! empty( $status ) ) {
			$allowed_statuses = array( 'active', 'unsubscribed', 'unconfirmed', 'bounced', 'junk' );

			if ( ! in_array( $status, $allowed_statuses, true ) ) {
				$status = '';
			}
		}

		$body = array(
			'email' => $email,
		);

		if ( ! empty( $name ) ) {
			$body['fields'] = array(
				'name' => $name,
			);
		}

		if ( ! empty( $groups ) ) {
			$body['groups'] = $groups;
		}

		if ( ! empty( $status ) ) {
			$body['status'] = $status;
		}

		return wp_remote_post(
			'https://connect.mailerlite.com/api/subscribers',
			array(
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'  => 'application/json',
					'Accept'        => 'application/json',
				),
				'body'    => wp_json_encode( $body ),
			)
		);
	}

	/**
	 * Send form submissions to MailerLite after the entry has been stored.
	 *
	 * @param int|string       $entry_id     Entry ID.
	 * @param array            $params       Form submission parameters.
	 * @param array            $form_setting Form settings.
	 * @param \WP_REST_Request $request      REST request object.
	 * @return void
	 */
	public function after_store( $entry_id, $params, $form_setting, $request ) {
		$data               = \Gutenverse_Form\Integration::prepare_entry_data( $params );
		$options            = get_option( 'gutenverse_form_integrations', array() );
		$global_settings    = get_option( 'gutenverse_form_mailer_settings', array() );
		$global_enabled     = ! empty( $options['mailer'] );
		$has_request_actions = \Gutenverse_Form\Integration::request_has_integration_actions( $params );
		$actions            = \Gutenverse_Form\Integration::get_service_actions( 'mailer', $params, $form_setting );

		if ( $global_enabled && ! $has_request_actions ) {
			$this->set_settings( $global_settings );
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'mailer', $this->send( $data, $entry_id, $params['form-id'] ?? 0 ) );
		}

		foreach ( $actions as $action ) {
			$settings = $global_settings;

			foreach ( $action as $key => $value ) {
				if ( is_array( $value ) ) {
					if ( ! empty( $value ) ) {
						$settings[ $key ] = $value;
					}
					continue;
				}

				if ( '' !== trim( (string) $value ) ) {
					$settings[ $key ] = $value;
				}
			}

			$this->set_settings( $settings );
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'mailer', $this->send( $data, $entry_id, $params['form-id'] ?? 0 ) );
		}
	}
}
