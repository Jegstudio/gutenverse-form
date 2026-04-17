<?php
/**
 * Mailchimp Integration Class.
 *
 * @package Gutenverse_Form
 */

namespace Gutenverse_Form\Integrations;

/**
 * Mailchimp class.
 */
class Mailchimp {
	/**
	 * Integration settings.
	 *
	 * @var array
	 */
	protected $settings;

	/**
	 * Register the Mailchimp integration hook.
	 */
	public function __construct() {
		add_action( 'gutenverse_form_after_store', array( $this, 'after_store' ), 10, 4 );
	}

	/**
	 * Set settings for Mailchimp.
	 *
	 * @param array $settings Integration settings.
	 */
	public function set_settings( $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Get fields for Mailchimp integration.
	 *
	 * @return array
	 */
	public function get_fields() {
		return array(
			'api_key'      => array(
				'label'       => __( 'API Key', 'gutenverse-form' ),
				'description' => __( 'Enter your Mailchimp API key.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( 'xxxxxx-us1', 'gutenverse-form' ),
			),
			'list_id'      => array(
				'label'       => __( 'Audience ID', 'gutenverse-form' ),
				'description' => __( 'Enter the Mailchimp audience/list ID.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( 'a1b2c3d4e5', 'gutenverse-form' ),
			),
			'email'        => array(
				'label'       => __( 'Email', 'gutenverse-form' ),
				'description' => __( 'Use a form field placeholder such as {email}.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( '{email}', 'gutenverse-form' ),
			),
			'name'         => array(
				'label'       => __( 'Name', 'gutenverse-form' ),
				'description' => __( 'Optional contact name or placeholder, for example {name}.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( '{name}', 'gutenverse-form' ),
			),
			'status'       => array(
				'label'       => __( 'Status', 'gutenverse-form' ),
				'description' => __( 'Optional member status for existing contacts, for example subscribed or pending.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( 'subscribed', 'gutenverse-form' ),
			),
			'status_if_new' => array(
				'label'       => __( 'Status If New', 'gutenverse-form' ),
				'description' => __( 'Required status for newly created contacts, usually subscribed or pending.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( 'subscribed', 'gutenverse-form' ),
			),
			'tags'         => array(
				'label'       => __( 'Tags JSON', 'gutenverse-form' ),
				'description' => __( 'Optional JSON array of tags. Example: ["lead","newsletter"]', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => '["lead","newsletter"]',
			),
			'merge_fields' => array(
				'label'       => __( 'Merge Fields JSON', 'gutenverse-form' ),
				'description' => __( 'Optional JSON object of Mailchimp merge fields. Example: {"FNAME":"{first_name}"}', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => '{"FNAME":"{first_name}","LNAME":"{last_name}"}',
			),
		);
	}

	/**
	 * Get saved Mailchimp settings.
	 *
	 * @return array
	 */
	public function get_settings() {
		return get_option( 'gutenverse_form_mailchimp_settings', array() );
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

		return is_array( $decoded ) ? $decoded : array();
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
	 * Build the API root from the Mailchimp API key suffix.
	 *
	 * @param string $api_key Mailchimp API key.
	 *
	 * @return string
	 */
	private function get_api_root( $api_key ) {
		if ( false === strpos( $api_key, '-' ) ) {
			return '';
		}

		$parts       = explode( '-', $api_key );
		$data_center = strtolower( trim( end( $parts ) ) );

		if ( empty( $data_center ) || ! preg_match( '/^[a-z0-9]+$/', $data_center ) ) {
			return '';
		}

		return sprintf( 'https://%s.api.mailchimp.com/3.0', $data_center );
	}

	/**
	 * Upsert a Mailchimp audience member.
	 *
	 * @param array $data     Form data.
	 * @param int   $entry_id Entry ID.
	 * @param int   $form_id  Form ID.
	 *
	 * @return array|\WP_Error|false
	 */
	public function send( $data, $entry_id = 0, $form_id = 0 ) {
		$api_key       = trim( (string) ( $this->settings['api_key'] ?? '' ) );
		$list_id       = trim( (string) ( $this->settings['list_id'] ?? '' ) );
		$email         = sanitize_email( $this->parse_setting( 'email', $data, $entry_id, $form_id ) );
		$name          = $this->parse_setting( 'name', $data, $entry_id, $form_id );
		$status        = sanitize_key( $this->parse_setting( 'status', $data, $entry_id, $form_id ) );
		$status_if_new = sanitize_key( $this->parse_setting( 'status_if_new', $data, $entry_id, $form_id ) );
		$merge_fields  = $this->decode_json_object_setting( 'merge_fields', $data, $entry_id, $form_id );
		$tags          = $this->decode_json_array_setting( 'tags', $data, $entry_id, $form_id );
		$api_root      = $this->get_api_root( $api_key );

		if ( empty( $api_key ) || empty( $list_id ) || empty( $email ) || empty( $api_root ) ) {
			return false;
		}

		if ( empty( $status_if_new ) ) {
			$status_if_new = 'subscribed';
		}

		$allowed_statuses = array( 'subscribed', 'unsubscribed', 'cleaned', 'pending', 'transactional' );
		if ( ! in_array( $status_if_new, $allowed_statuses, true ) ) {
			$status_if_new = 'subscribed';
		}

		if ( ! empty( $status ) && ! in_array( $status, $allowed_statuses, true ) ) {
			$status = '';
		}

		$subscriber_hash = md5( strtolower( $email ) );
		$body            = array(
			'email_address' => $email,
			'status_if_new' => $status_if_new,
		);

		if ( ! empty( $status ) ) {
			$body['status'] = $status;
		}

		if ( ! empty( $name ) ) {
			$body['full_name'] = $name;
		}

		if ( ! empty( $merge_fields ) ) {
			$body['merge_fields'] = $merge_fields;
		}

		$response = wp_remote_request(
			sprintf( '%1$s/lists/%2$s/members/%3$s', $api_root, rawurlencode( $list_id ), $subscriber_hash ),
			array(
				'method'  => 'PUT',
				'headers' => array(
					'Authorization' => 'Basic ' . base64_encode( 'gutenverse:' . $api_key ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
					'Content-Type'  => 'application/json',
				),
				'body'    => wp_json_encode( $body ),
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status_code = (int) wp_remote_retrieve_response_code( $response );
		if ( $status_code < 200 || $status_code >= 300 ) {
			return $response;
		}

		if ( empty( $tags ) ) {
			return $response;
		}

		$tag_response = wp_remote_post(
			sprintf( '%1$s/lists/%2$s/members/%3$s/tags', $api_root, rawurlencode( $list_id ), $subscriber_hash ),
			array(
				'headers' => array(
					'Authorization' => 'Basic ' . base64_encode( 'gutenverse:' . $api_key ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
					'Content-Type'  => 'application/json',
				),
				'body'    => wp_json_encode(
					array(
						'tags' => array_map(
							function ( $tag ) {
								return array(
									'name'   => sanitize_text_field( (string) $tag ),
									'status' => 'active',
								);
							},
							$tags
						),
					)
				),
			)
		);

		return is_wp_error( $tag_response ) ? $tag_response : $tag_response;
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
		$global_settings  = get_option( 'gutenverse_form_mailchimp_settings', array() );
		$global_enabled   = ! empty( $options['mailchimp'] );
		$apply_globally   = isset( $global_settings['apply_globally'] ) ? (bool) $global_settings['apply_globally'] : false;
		$has_local_config = \Gutenverse_Form\Integration::has_local_service_config( 'mailchimp', $form_setting );
		$local_settings   = \Gutenverse_Form\Integration::get_local_service_settings( 'mailchimp', $form_setting );
		$local_enabled    = isset( $local_settings['enabled'] ) ? (bool) $local_settings['enabled'] : false;

		if ( $global_enabled && $apply_globally && ! $has_local_config ) {
			$this->set_settings( array_merge( $global_settings, $local_settings ) );
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'mailchimp', $this->send( $data, $entry_id, $params['form-id'] ?? 0 ) );
		}

		if ( $local_enabled ) {
			$this->set_settings( array_merge( $global_settings, $local_settings ) );
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'mailchimp', $this->send( $data, $entry_id, $params['form-id'] ?? 0 ) );
		}

		foreach ( \Gutenverse_Form\Integration::get_service_actions( 'mailchimp', $params, $form_setting ) as $action ) {
			$this->set_settings( $action );
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'mailchimp', $this->send( $data, $entry_id, $params['form-id'] ?? 0 ) );
		}
	}
}
