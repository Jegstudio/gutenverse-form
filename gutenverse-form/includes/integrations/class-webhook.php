<?php

/**
 * Webhook class
 *
 * @author Jegstudio
 * @since 2.6.0
 * @package gutenverse-form
 */

namespace Gutenverse_Form\Integrations;

/**
 * Class Webhook
 *
 * @package gutenverse-form
 */
class Webhook {
	/**
	 * Integration settings.
	 *
	 * @var array
	 */
	protected $settings;

	/**
	 * Set settings for Webhook.
	 *
	 * @param array $settings Integration settings.
	 */
	public function set_settings( $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Get webhook URL from integration settings.
	 *
	 * @return string
	 */
	private function get_webhook_url() {
		return esc_url_raw( $this->settings['webhookUrl'] ?? $this->settings['webhook_url'] ?? '', array( 'https' ) );
	}

	/**
	 * Get webhook signing secret from integration settings.
	 *
	 * @return string
	 */
	private function get_signing_secret() {
		return (string) ( $this->settings['signingSecret'] ?? $this->settings['signing_secret'] ?? '' );
	}

	/**
	 * Build the webhook message payload.
	 *
	 * @param array $data     Form data.
	 * @param int   $entry_id Entry ID.
	 * @param int   $form_id  Form ID.
	 * @return string
	 */
	private function get_message( $data, $entry_id, $form_id ) {
		$content = ! empty( $this->settings['content'] )
			? $this->settings['content']
			: __( "New form submission:\n{all_fields}", 'gutenverse-form' );

		return \Gutenverse_Form\Integration::parse_template( $content, $data, $entry_id, $form_id );
	}

	/**
	 * Build a request signature for webhook verification.
	 *
	 * @param string $payload_json Encoded payload body.
	 * @param string $timestamp    Unix timestamp as a string.
	 * @return string
	 */
	private function build_signature( $payload_json, $timestamp ) {
		$secret = $this->get_signing_secret();

		if ( '' === $secret ) {
			return '';
		}

		return hash_hmac( 'sha256', $timestamp . '.' . $payload_json, $secret );
	}

	/**
	 * Send data to an external webhook.
	 *
	 * @param array $data         Form data.
	 * @param int   $entry_id     Entry ID.
	 * @param int   $form_id      Form ID.
	 * @param array $browser_data Browser metadata.
	 * @return array|\WP_Error|false
	 */
	public function send( $data, $entry_id = 0, $form_id = 0, $browser_data = array() ) {
		$webhook_url = $this->get_webhook_url();
		$message     = $this->get_message( $data, $entry_id, $form_id );

		if ( empty( $webhook_url ) || empty( trim( $message ) ) ) {
			return false;
		}

		$payload = array(
			'event'        => 'form_submitted',
			'message'      => $message,
			'entry_id'     => (int) $entry_id,
			'form_id'      => (int) $form_id,
			'form_title'   => get_the_title( $form_id ),
			'site_title'   => get_bloginfo( 'name' ),
			'site_url'     => home_url( '/' ),
			'submitted_at' => current_time( 'mysql', true ),
			'fields'       => $data,
			'browser_data' => is_array( $browser_data ) ? $browser_data : array(),
		);

		$payload_json = wp_json_encode( $payload );
		$timestamp    = (string) time();
		$signature    = $this->build_signature( $payload_json, $timestamp );

		$headers = array_filter(
			array(
				'Content-Type'                   => 'application/json',
				'X-Gutenverse-Event'             => 'form_submitted',
				'X-Gutenverse-Signature'         => '' !== $signature ? 'sha256=' . $signature : '',
				'X-Gutenverse-Timestamp'         => $timestamp,
				'X-Gutenverse-Signature-Version' => 'v1',
			),
			function ( $value ) {
				return '' !== $value;
			}
		);

		return wp_remote_post(
			$webhook_url,
			array(
				'headers' => $headers,
				'body'    => $payload_json,
				'timeout' => 15,
			)
		);
	}

	/**
	 * Webhook constructor.
	 */
	public function __construct() {
		add_action( 'gutenverse_form_after_store', array( $this, 'after_store' ), 10, 4 );
	}

	/**
	 * Triggered after form data is stored.
	 *
	 * @param int|string $entry_id     Entry ID.
	 * @param array      $params       Form parameters.
	 * @param array      $form_setting Form settings.
	 * @param object     $request      REST request object.
	 */
	public function after_store( $entry_id, $params, $form_setting, $request ) {
		$data             = \Gutenverse_Form\Integration::prepare_entry_data( $params );
		$browser_data     = isset( $params['browser-data'] ) && is_array( $params['browser-data'] ) ? $params['browser-data'] : array();
		$options          = get_option( 'gutenverse_form_integrations', array() );
		$global_settings  = get_option( 'gutenverse_form_webhook_settings', array() );
		$global_enabled   = ! empty( $options['webhook'] );
		$apply_globally   = isset( $global_settings['apply_globally'] ) ? (bool) $global_settings['apply_globally'] : false;
		$has_local_config = \Gutenverse_Form\Integration::has_local_service_config( 'webhook', $form_setting );
		$local_settings   = \Gutenverse_Form\Integration::get_local_service_settings( 'webhook', $form_setting );
		$local_enabled    = isset( $local_settings['enabled'] ) ? (bool) $local_settings['enabled'] : false;

		if ( $global_enabled && $apply_globally && ! $has_local_config ) {
			$settings = array_merge( $global_settings, $local_settings );
			if ( ! empty( $settings['webhookUrl'] ) || ! empty( $settings['webhook_url'] ) ) {
				$this->set_settings( $settings );
				\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'webhook', $this->send( $data, $entry_id, $params['form-id'], $browser_data ) );
			}
		}

		if ( $local_enabled ) {
			$settings = array_merge( $global_settings, $local_settings );
			if ( ! empty( $settings['webhookUrl'] ) || ! empty( $settings['webhook_url'] ) ) {
				$this->set_settings( $settings );
				\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'webhook', $this->send( $data, $entry_id, $params['form-id'], $browser_data ) );
			}
		}

		foreach ( \Gutenverse_Form\Integration::get_service_actions( 'webhook', $params, $form_setting ) as $action ) {
			$settings = $global_settings;

			foreach ( $action as $key => $value ) {
				if ( ! empty( $value ) ) {
					$settings[ $key ] = $value;
				}
			}

			if ( ! empty( $settings['webhookUrl'] ) || ! empty( $settings['webhook_url'] ) ) {
				$this->set_settings( $settings );
				\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'webhook', $this->send( $data, $entry_id, $params['form-id'], $browser_data ) );
			}
		}
	}

	/**
	 * Get fields for Webhook integration.
	 *
	 * @return array
	 */
	public function get_fields() {
		return array(
			'webhookUrl' => array(
				'label'       => __( 'Webhook URL', 'gutenverse-form' ),
				'description' => __( 'Enter the external HTTPS endpoint that should receive the form_submitted event.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( 'https://example.com/wp-json/my-site/v1/form-webhook', 'gutenverse-form' ),
			),
			'signingSecret' => array(
				'label'       => __( 'Signing Secret', 'gutenverse-form' ),
				'description' => __( 'Use the same secret on the receiving site to verify the X-Gutenverse-Signature header.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( 'your-shared-webhook-secret', 'gutenverse-form' ),
			),
			'content'    => array(
				'label'       => __( 'Content Template', 'gutenverse-form' ),
				'description' => __( 'Use {field_id}, {all_fields}, {form_id}, {entry_id}, {form_title}, or {site_title} to build the notification message.', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => __( "New form submission:\n{all_fields}", 'gutenverse-form' ),
			),
		);
	}

	/**
	 * Get saved settings for Webhook.
	 *
	 * @return array
	 */
	public function get_settings() {
		return get_option( 'gutenverse_form_webhook_settings', array() );
	}
}
