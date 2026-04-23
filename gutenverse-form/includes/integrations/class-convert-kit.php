<?php
/**
 * Kit Integration Class.
 *
 * @package Gutenverse_Form
 */

namespace Gutenverse_Form\Integrations;

/**
 * Handles syncing form submissions to Kit subscribers.
 */
class Convert_Kit {
	/**
	 * Integration settings.
	 *
	 * @var array
	 */
	protected $settings;

	/**
	 * Register the Kit integration hook.
	 */
	public function __construct() {
		add_action( 'gutenverse_form_after_store', array( $this, 'after_store' ), 10, 4 );
	}

	/**
	 * Set settings for Kit.
	 *
	 * @param array $settings Integration settings.
	 *
	 * @return void
	 */
	public function set_settings( $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Get fields for the Kit integration UI.
	 *
	 * @return array
	 */
	public function get_fields() {
		return array(
			'api_key'   => array(
				'label'       => __( 'API Key', 'gutenverse-form' ),
				'description' => __( 'Enter your Kit API key.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'sensitive'   => true,
				'placeholder' => __( 'kit_api_xxxxxxxxxxxxxxxxxxxx', 'gutenverse-form' ),
			),
			'email'     => array(
				'label'       => __( 'Email', 'gutenverse-form' ),
				'description' => __( 'Use a form field placeholder such as {input-email}.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( '{input-email}', 'gutenverse-form' ),
			),
			'first_name' => array(
				'label'       => __( 'First Name', 'gutenverse-form' ),
				'description' => __( 'Optional first name placeholder, for example {input-text-name}.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( '{input-text-name}', 'gutenverse-form' ),
			),
			'form_id'   => array(
				'label'       => __( 'Form ID', 'gutenverse-form' ),
				'description' => __( 'Optional Kit form ID. If set, the subscriber will also be added to this form.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( '1234567', 'gutenverse-form' ),
			),
			'tag_ids'   => array(
				'label'       => __( 'Tag IDs JSON', 'gutenverse-form' ),
				'description' => __( 'Optional JSON array of Kit tag IDs to apply after the subscriber is created.', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => '["123456","123457"]',
			),
		);
	}

	/**
	 * Get saved Kit settings.
	 *
	 * @return array
	 */
	public function get_settings() {
		return get_option( 'gutenverse_form_convert_kit_settings', array() );
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
	 * Build standard Kit request headers.
	 *
	 * @param string $api_key Kit API key.
	 *
	 * @return array
	 */
	private function get_headers( $api_key ) {
		return array(
			'X-Kit-Api-Key' => $api_key,
			'Content-Type'  => 'application/json',
			'Accept'        => 'application/json',
		);
	}

	/**
	 * Create or upsert the Kit subscriber.
	 *
	 * @param array  $data     Prepared form data.
	 * @param int    $entry_id Entry ID.
	 * @param int    $form_id  Form ID.
	 * @param string $api_key  Kit API key.
	 *
	 * @return array|\WP_Error|false
	 */
	private function create_subscriber( $data, $entry_id, $form_id, $api_key ) {
		$email      = sanitize_email( $this->parse_setting( 'email', $data, $entry_id, $form_id ) );
		$first_name = trim( $this->parse_setting( 'first_name', $data, $entry_id, $form_id ) );

		if ( empty( $api_key ) || empty( $email ) ) {
			return false;
		}

		$body = array(
			'email_address' => $email,
		);

		if ( '' !== $first_name ) {
			$body['first_name'] = $first_name;
		}

		return wp_remote_post(
			'https://api.kit.com/v4/subscribers',
			array(
				'headers' => $this->get_headers( $api_key ),
				'body'    => wp_json_encode( $body ),
			)
		);
	}

	/**
	 * Add the subscriber to a Kit form.
	 *
	 * @param string $api_key        Kit API key.
	 * @param string $subscriber_id  Kit subscriber ID.
	 * @param string $target_form_id Kit form ID.
	 *
	 * @return array|\WP_Error
	 */
	private function add_subscriber_to_form( $api_key, $subscriber_id, $target_form_id ) {
		return wp_remote_post(
			sprintf(
				'https://api.kit.com/v4/forms/%1$s/subscribers/%2$s',
				rawurlencode( $target_form_id ),
				rawurlencode( $subscriber_id )
			),
			array(
				'headers' => $this->get_headers( $api_key ),
				'body'    => wp_json_encode( array() ),
			)
		);
	}

	/**
	 * Tag the subscriber in Kit.
	 *
	 * @param string $api_key       Kit API key.
	 * @param string $subscriber_id Kit subscriber ID.
	 * @param string $tag_id        Kit tag ID.
	 *
	 * @return array|\WP_Error
	 */
	private function tag_subscriber( $api_key, $subscriber_id, $tag_id ) {
		return wp_remote_post(
			sprintf(
				'https://api.kit.com/v4/tags/%1$s/subscribers/%2$s',
				rawurlencode( $tag_id ),
				rawurlencode( $subscriber_id )
			),
			array(
				'headers' => $this->get_headers( $api_key ),
				'body'    => wp_json_encode( array() ),
			)
		);
	}

	/**
	 * Send the Kit subscriber request and optional follow-up actions.
	 *
	 * @param array $data     Prepared form data.
	 * @param int   $entry_id Entry ID.
	 * @param int   $form_id  Form ID.
	 *
	 * @return array|\WP_Error|false
	 */
	public function send( $data, $entry_id = 0, $form_id = 0 ) {
		$api_key        = trim( (string) ( $this->settings['api_key'] ?? '' ) );
		$target_form_id = trim( $this->parse_setting( 'form_id', $data, $entry_id, $form_id ) );
		$tag_ids        = array_values(
			array_filter(
				array_map(
					static function ( $tag_id ) {
						return sanitize_text_field( (string) $tag_id );
					},
					$this->decode_json_array_setting( 'tag_ids', $data, $entry_id, $form_id )
				),
				static function ( $tag_id ) {
					return '' !== $tag_id;
				}
			)
		);

		$response = $this->create_subscriber( $data, $entry_id, $form_id, $api_key );

		if ( false === $response || is_wp_error( $response ) ) {
			return $response;
		}

		$status_code = (int) wp_remote_retrieve_response_code( $response );
		if ( $status_code < 200 || $status_code >= 300 ) {
			return $response;
		}

		$body          = json_decode( wp_remote_retrieve_body( $response ), true );
		$subscriber_id = isset( $body['subscriber']['id'] ) ? sanitize_text_field( (string) $body['subscriber']['id'] ) : '';

		if ( '' === $subscriber_id ) {
			return new \WP_Error( 'convert_kit_missing_subscriber_id', __( 'Kit did not return a subscriber ID.', 'gutenverse-form' ) );
		}

		if ( '' !== $target_form_id ) {
			$form_response = $this->add_subscriber_to_form( $api_key, $subscriber_id, $target_form_id );

			if ( is_wp_error( $form_response ) ) {
				return $form_response;
			}

			$form_status_code = (int) wp_remote_retrieve_response_code( $form_response );
			if ( $form_status_code < 200 || $form_status_code >= 300 ) {
				return $form_response;
			}
		}

		foreach ( $tag_ids as $tag_id ) {
			$tag_response = $this->tag_subscriber( $api_key, $subscriber_id, $tag_id );

			if ( is_wp_error( $tag_response ) ) {
				return $tag_response;
			}

			$tag_status_code = (int) wp_remote_retrieve_response_code( $tag_response );
			if ( $tag_status_code < 200 || $tag_status_code >= 300 ) {
				return $tag_response;
			}
		}

		return $response;
	}

	/**
	 * Send form submissions to Kit after the entry has been stored.
	 *
	 * @param int|string       $entry_id     Entry ID.
	 * @param array            $params       Form submission parameters.
	 * @param array            $form_setting Form settings.
	 * @param \WP_REST_Request $request      REST request object.
	 * @return void
	 */
	public function after_store( $entry_id, $params, $form_setting, $request ) {
		$data                = \Gutenverse_Form\Integration::prepare_entry_data( $params );
		$options             = get_option( 'gutenverse_form_integrations', array() );
		$global_settings     = get_option( 'gutenverse_form_convert_kit_settings', array() );
		$global_enabled      = ! empty( $options['convert_kit'] );
		$has_request_actions = \Gutenverse_Form\Integration::request_has_integration_actions( $params );
		$actions             = \Gutenverse_Form\Integration::get_service_actions( 'convert_kit', $params, $form_setting );

		if ( $global_enabled && ! $has_request_actions ) {
			$this->set_settings( $global_settings );
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'convert_kit', $this->send( $data, $entry_id, $params['form-id'] ?? 0 ) );
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
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'convert_kit', $this->send( $data, $entry_id, $params['form-id'] ?? 0 ) );
		}
	}
}
