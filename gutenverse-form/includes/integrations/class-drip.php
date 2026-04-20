<?php
/**
 * Drip Integration Class.
 *
 * @package Gutenverse_Form
 */

namespace Gutenverse_Form\Integrations;

/**
 * Handles syncing form submissions to Drip subscribers.
 */
class Drip {
	/**
	 * Integration settings.
	 *
	 * @var array
	 */
	protected $settings;

	/**
	 * Register the Drip integration hook.
	 */
	public function __construct() {
		add_action( 'gutenverse_form_after_store', array( $this, 'after_store' ), 10, 4 );
	}

	/**
	 * Set settings for Drip.
	 *
	 * @param array $settings Integration settings.
	 *
	 * @return void
	 */
	public function set_settings( $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Get fields for the Drip integration UI.
	 *
	 * @return array
	 */
	public function get_fields() {
		return array(
			'api_key'            => array(
				'label'       => __( 'API Key', 'gutenverse-form' ),
				'description' => __( 'Enter your Drip API token.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'sensitive'   => true,
				'placeholder' => __( 'drip_xxxxxxxxxxxxxxxxxxxx', 'gutenverse-form' ),
			),
			'account_id'         => array(
				'label'       => __( 'Account ID', 'gutenverse-form' ),
				'description' => __( 'Enter your Drip account ID.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( '1234567', 'gutenverse-form' ),
			),
			'email'              => array(
				'label'       => __( 'Email', 'gutenverse-form' ),
				'description' => __( 'Use a form field placeholder such as {email}. Should be the same as input-name in input form', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( '{email}', 'gutenverse-form' ),
			),
			'first_name'         => array(
				'label'       => __( 'First Name', 'gutenverse-form' ),
				'description' => __( 'Optional first name placeholder, for example {first_name}. Should be the same as input-name in input form', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( '{first_name}', 'gutenverse-form' ),
			),
			'last_name'          => array(
				'label'       => __( 'Last Name', 'gutenverse-form' ),
				'description' => __( 'Optional last name placeholder, for example {last_name}. Should be the same as input-name in input form', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( '{last_name}', 'gutenverse-form' ),
			),
			'tags'               => array(
				'label'       => __( 'Tags JSON', 'gutenverse-form' ),
				'description' => __( 'Optional JSON array of Drip tags. Example: ["lead","newsletter"]', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => '["lead","newsletter"]',
			),
			'custom_fields'      => array(
				'label'       => __( 'Custom Fields JSON', 'gutenverse-form' ),
				'description' => __( 'Optional JSON object of Drip custom fields. Example: {"company":"{company}"}', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => '{"company":"{company}","plan":"{plan}"}',
			),
			'double_optin'       => array(
				'label'       => __( 'Double Opt-In', 'gutenverse-form' ),
				'description' => __( 'Optional boolean. Use true to send a confirmation email.', 'gutenverse-form' ),
				'type'        => 'select',
				'options'     => array(
					array(
						'label' => __( 'Yes', 'gutenverse-form' ),
						'value' => 'true',
					),
					array(
						'label' => __( 'No', 'gutenverse-form' ),
						'value' => 'false',
					),
				),
			),
			'prospect'           => array(
				'label'       => __( 'Prospect', 'gutenverse-form' ),
				'description' => __( 'Optional boolean. Use false to avoid creating a lead score.', 'gutenverse-form' ),
				'type'        => 'select',
				'options'     => array(
					array(
						'label' => __( 'Yes', 'gutenverse-form' ),
						'value' => 'true',
					),
					array(
						'label' => __( 'No', 'gutenverse-form' ),
						'value' => 'false',
					),
				),
			),
			'eu_consent'         => array(
				'label'       => __( 'EU Consent', 'gutenverse-form' ),
				'description' => __( 'Optional. Use granted or denied.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( 'granted', 'gutenverse-form' ),
			),
			'eu_consent_message' => array(
				'label'       => __( 'EU Consent Message', 'gutenverse-form' ),
				'description' => __( 'Optional consent message saved with the subscriber.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( 'I agree to receive product updates.', 'gutenverse-form' ),
			),
		);
	}

	/**
	 * Get saved Drip settings.
	 *
	 * @return array
	 */
	public function get_settings() {
		return get_option( 'gutenverse_form_drip_settings', array() );
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
	 * Parse a JSON object setting after placeholder replacement.
	 *
	 * @param string $key      Setting key.
	 * @param array  $data     Prepared form data.
	 * @param int    $entry_id Entry ID.
	 * @param int    $form_id  Form ID.
	 *
	 * @return array
	 */
	private function decode_json_object_setting( $key, $data, $entry_id, $form_id ) {
		$value = $this->parse_setting( $key, $data, $entry_id, $form_id );

		if ( empty( $value ) ) {
			return array();
		}

		$decoded = json_decode( $value, true );

		return is_array( $decoded ) && array_values( $decoded ) !== $decoded ? $decoded : array();
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
	 * Parse a string setting as a boolean.
	 *
	 * Returns null when the value is not set or cannot be interpreted.
	 *
	 * @param string $key      Setting key.
	 * @param array  $data     Prepared form data.
	 * @param int    $entry_id Entry ID.
	 * @param int    $form_id  Form ID.
	 *
	 * @return bool|null
	 */
	private function parse_boolean_setting( $key, $data, $entry_id, $form_id ) {
		$value = strtolower( trim( $this->parse_setting( $key, $data, $entry_id, $form_id ) ) );

		if ( '' === $value ) {
			return null;
		}

		if ( in_array( $value, array( '1', 'true', 'yes', 'on' ), true ) ) {
			return true;
		}

		if ( in_array( $value, array( '0', 'false', 'no', 'off' ), true ) ) {
			return false;
		}

		return null;
	}

	/**
	 * Send a subscriber payload to Drip.
	 *
	 * @param array $data     Form data.
	 * @param int   $entry_id Entry ID.
	 * @param int   $form_id  Form ID.
	 *
	 * @return array|\WP_Error|false
	 */
	public function send( $data, $entry_id = 0, $form_id = 0 ) {
		$api_key            = trim( (string) ( $this->settings['api_key'] ?? '' ) );
		$account_id         = preg_replace( '/[^0-9]/', '', (string) ( $this->settings['account_id'] ?? '' ) );
		$email              = sanitize_email( $this->parse_setting( 'email', $data, $entry_id, $form_id ) );
		$first_name         = sanitize_text_field( $this->parse_setting( 'first_name', $data, $entry_id, $form_id ) );
		$last_name          = sanitize_text_field( $this->parse_setting( 'last_name', $data, $entry_id, $form_id ) );
		$eu_consent         = sanitize_key( $this->parse_setting( 'eu_consent', $data, $entry_id, $form_id ) );
		$eu_consent_message = sanitize_text_field( $this->parse_setting( 'eu_consent_message', $data, $entry_id, $form_id ) );
		$tags               = $this->decode_json_array_setting( 'tags', $data, $entry_id, $form_id );
		$custom_fields      = $this->decode_json_object_setting( 'custom_fields', $data, $entry_id, $form_id );
		$double_optin       = $this->parse_boolean_setting( 'double_optin', $data, $entry_id, $form_id );
		$prospect           = $this->parse_boolean_setting( 'prospect', $data, $entry_id, $form_id );

		if ( empty( $api_key ) || empty( $account_id ) || empty( $email ) ) {
			return false;
		}

		$subscriber = array(
			'email' => $email,
		);

		if ( ! empty( $first_name ) ) {
			$subscriber['first_name'] = $first_name;
		}

		if ( ! empty( $last_name ) ) {
			$subscriber['last_name'] = $last_name;
		}

		if ( ! empty( $tags ) ) {
			$subscriber['tags'] = array_map(
				function ( $tag ) {
					return sanitize_text_field( (string) $tag );
				},
				$tags
			);
		}

		if ( ! empty( $custom_fields ) ) {
			$subscriber['custom_fields'] = array_map(
				function ( $value ) {
					if ( is_scalar( $value ) || null === $value ) {
						return (string) $value;
					}

					return '';
				},
				$custom_fields
			);
		}

		if ( null !== $double_optin ) {
			$subscriber['double_optin'] = $double_optin;
		}

		if ( null !== $prospect ) {
			$subscriber['prospect'] = $prospect;
		}

		if ( in_array( $eu_consent, array( 'granted', 'denied' ), true ) ) {
			$subscriber['eu_consent'] = $eu_consent;
		}

		if ( ! empty( $eu_consent_message ) ) {
			$subscriber['eu_consent_message'] = $eu_consent_message;
		}

		return wp_remote_post(
			sprintf( 'https://api.getdrip.com/v2/%s/subscribers/batches', rawurlencode( $account_id ) ),
			array(
				'headers' => array(
					'Authorization' => 'Basic ' . base64_encode( $api_key . ':' ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
					'Content-Type'  => 'application/json',
					'User-Agent'    => sprintf( '%1$s/%2$s (%3$s)', GUTENVERSE_FORM_NAME, GUTENVERSE_FORM_VERSION, home_url( '/' ) ),
				),
				'body'    => wp_json_encode(
					array(
						'batches' => array(
							array(
								'subscribers' => array( $subscriber ),
							),
						),
					)
				),
			)
		);
	}

	/**
	 * Triggered after form data is stored.
	 *
	 * @param int              $entry_id     Stored form entry ID.
	 * @param array            $params       Submitted form parameters.
	 * @param array            $form_setting Saved form settings.
	 * @param \WP_REST_Request $request      REST request instance for the submission.
	 *
	 * @return void
	 */
	public function after_store( $entry_id, $params, $form_setting, $request ) {
		$data             = \Gutenverse_Form\Integration::prepare_entry_data( $params );
		$options          = get_option( 'gutenverse_form_integrations', array() );
		$global_settings  = get_option( 'gutenverse_form_drip_settings', array() );
		$global_enabled   = ! empty( $options['drip'] );
		$has_local_config = \Gutenverse_Form\Integration::has_local_service_config( 'drip', $form_setting );
		$local_settings   = \Gutenverse_Form\Integration::get_local_service_settings( 'drip', $form_setting );
		$local_enabled    = isset( $local_settings['enabled'] ) ? (bool) $local_settings['enabled'] : false;

		if ( $global_enabled && ! $has_local_config ) {
			$this->set_settings( array_merge( $global_settings, $local_settings ) );
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'drip', $this->send( $data, $entry_id, $params['form-id'] ?? 0 ) );
		}

		if ( $local_enabled ) {
			$this->set_settings( array_merge( $global_settings, $local_settings ) );
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'drip', $this->send( $data, $entry_id, $params['form-id'] ?? 0 ) );
		}

		foreach ( \Gutenverse_Form\Integration::get_service_actions( 'drip', $params, $form_setting ) as $action ) {
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
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'drip', $this->send( $data, $entry_id, $params['form-id'] ?? 0 ) );
		}
	}
}
