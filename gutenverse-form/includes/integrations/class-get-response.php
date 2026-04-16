<?php
/**
 * GetRespond Integration Class.
 *
 * @package Gutenverse_Form
 */

namespace Gutenverse_Form\Integrations;

/**
 * Handles syncing form submissions to GetResponse contacts.
 */
class Get_Response {
	/**
	 * Integration settings used when sending contacts.
	 *
	 * @var array
	 */
	protected $settings;

	/**
	 * Set settings for GetResponse.
	 *
	 * @param array $settings Integration settings.
	 */
	public function set_settings( $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Prepare form data for template parsing.
	 *
	 * Converts the submitted entry data list into a keyed array that can be
	 * consumed by Integration::parse_template().
	 *
	 * @param array $params Form submission parameters.
	 * @return array<string, string> Parsed form values keyed by field id.
	 */
	private function prepare_data( $params ) {
		$data = array();

		if ( isset( $params['entry-data'] ) && is_array( $params['entry-data'] ) ) {
			foreach ( $params['entry-data'] as $item ) {
				if ( isset( $item['id'] ) && isset( $item['value'] ) ) {
					$value = $item['value'];
					if ( is_array( $value ) ) {
						$value = implode( ', ', $value );
					}
					$data[ $item['id'] ] = $value;
				}
			}
		}

		return $data;
	}

	/**
	 * Parse a setting value by replacing placeholders with submitted form data.
	 *
	 * @param string $key      Setting key.
	 * @param array  $data     Prepared form data keyed by field id.
	 * @param int    $entry_id Entry ID.
	 * @param int    $form_id  Form ID.
	 * @return string Parsed setting value.
	 */
	private function parse_setting( $key, $data, $entry_id, $form_id ) {
		return \Gutenverse_Form\Integration::parse_template( $this->settings[ $key ] ?? '', $data, $entry_id, $form_id );
	}

	/**
	 * Parse a JSON-based setting after placeholder replacement.
	 *
	 * Invalid or empty JSON returns an empty array.
	 *
	 * @param string $key      Setting key.
	 * @param array  $data     Prepared form data keyed by field id.
	 * @param int    $entry_id Entry ID.
	 * @param int    $form_id  Form ID.
	 * @return array Decoded JSON data.
	 */
	private function decode_json_setting( $key, $data, $entry_id, $form_id ) {
		$value = $this->parse_setting( $key, $data, $entry_id, $form_id );

		if ( empty( $value ) ) {
			return array();
		}

		$decoded = json_decode( $value, true );

		return is_array( $decoded ) ? $decoded : array();
	}

	/**
	 * Send a contact payload to the GetResponse contacts API.
	 *
	 * Requires the API key, campaign ID, and email setting to be present.
	 *
	 * @param array $data     Prepared form data keyed by field id.
	 * @param int   $entry_id Entry ID.
	 * @param int   $form_id  Form ID.
	 * @return array|\WP_Error|false False when required settings are missing,
	 *                               otherwise the wp_remote_post() result.
	 */
	public function send( $data, $entry_id = 0, $form_id = 0 ) {
		$api_key     = $this->settings['api_key'] ?? '';
		$campaign_id = $this->settings['campaign_id'] ?? '';
		$email       = $this->parse_setting( 'email', $data, $entry_id, $form_id );
		$name        = $this->parse_setting( 'name', $data, $entry_id, $form_id );
		$day         = $this->settings['day_of_cycle'] ?? '';
		$ip_address  = $this->parse_setting( 'ip_address', $data, $entry_id, $form_id );

		if ( empty( $api_key ) || empty( $campaign_id ) || empty( $email ) ) {
			return false;
		}

		$body = array(
			'email'    => $email,
			'campaign' => array(
				'campaignId' => $campaign_id,
			),
		);

		if ( ! empty( $name ) ) {
			$body['name'] = $name;
		}

		if ( '' !== $day && is_numeric( $day ) ) {
			$body['dayOfCycle'] = (int) $day;
		}

		if ( ! empty( $ip_address ) ) {
			$body['ipAddress'] = $ip_address;
		}

		$tags = $this->decode_json_setting( 'tags', $data, $entry_id, $form_id );
		if ( ! empty( $tags ) ) {
			$body['tags'] = $tags;
		}

		$custom_field_values = $this->decode_json_setting( 'custom_field_values', $data, $entry_id, $form_id );
		if ( ! empty( $custom_field_values ) ) {
			$body['customFieldValues'] = $custom_field_values;
		}

		return wp_remote_post(
			'https://api.getresponse.com/v3/contacts',
			array(
				'headers' => array(
					'Content-Type' => 'application/json',
					'X-Auth-Token' => 'api-key ' . $api_key,
				),
				'body'    => wp_json_encode( $body ),
			)
		);
	}

	/**
	 * Register the GetResponse integration hook.
	 */
	public function __construct() {
		add_action( 'gutenverse_form_after_store', array( $this, 'after_store' ), 10, 4 );
	}

	/**
	 * Send form submissions to GetResponse after the entry has been stored.
	 *
	 * Uses global integration settings when enabled and marked to apply
	 * globally, then processes any form-level GetResponse actions attached to
	 * the submission payload.
	 *
	 * @param int|string       $entry_id     Entry ID.
	 * @param array            $params       Form submission parameters.
	 * @param array            $form_setting Form settings.
	 * @param \WP_REST_Request $request      REST request object.
	 * @return void
	 */
	public function after_store( $entry_id, $params, $form_setting, $request ) {
		$data = $this->prepare_data( $params );

		$options         = get_option( 'gutenverse_form_integrations', array() );
		$global_settings = get_option( 'gutenverse_form_get_response_settings', array() );
		$global_enabled  = ! empty( $options['get_response'] );
		$apply_globally  = isset( $global_settings['apply_globally'] ) ? (bool) $global_settings['apply_globally'] : false;

		$local_settings = isset( $form_setting['integrations']['get_response'] ) ? $form_setting['integrations']['get_response'] : array();
		$local_enabled  = isset( $local_settings['enabled'] ) ? (bool) $local_settings['enabled'] : false;

		if ( ( $global_enabled && $apply_globally ) || $local_enabled ) {
			$settings = array_merge( $global_settings, $local_settings );
			$this->set_settings( $settings );
			$this->send( $data, $entry_id, $params['form-id'] ?? 0 );
		}

		if ( isset( $params['integrations']['actions'] ) && is_array( $params['integrations']['actions'] ) ) {
			foreach ( $params['integrations']['actions'] as $action ) {
				if ( 'get_response' === ( $action['type'] ?? '' ) ) {
					$this->set_settings( $action );
					$this->send( $data, $entry_id, $params['form-id'] ?? 0 );
				}
			}
		}
	}

	/**
	 * Get the editable settings schema for the GetResponse integration UI.
	 *
	 * @return array<string, array<string, string>> Field definitions.
	 */
	public function get_fields() {
		return array(
			'api_key'             => array(
				'label'       => __( 'API Key', 'gutenverse-form' ),
				'description' => __( 'Enter your GetResponse API key.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( 'GetResponse API key', 'gutenverse-form' ),
			),
			'campaign_id'         => array(
				'label'       => __( 'Campaign ID', 'gutenverse-form' ),
				'description' => __( 'Enter the GetResponse campaign/list token.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( 'p86zQ', 'gutenverse-form' ),
			),
			'email'               => array(
				'label'       => __( 'Email', 'gutenverse-form' ),
				'description' => __( 'Use a form field placeholder such as {email}.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( '{email}', 'gutenverse-form' ),
			),
			'name'                => array(
				'label'       => __( 'Name', 'gutenverse-form' ),
				'description' => __( 'Optional. Use form field placeholders such as {name}.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( '{name}', 'gutenverse-form' ),
			),
			'day_of_cycle'        => array(
				'label'       => __( 'Day of Cycle', 'gutenverse-form' ),
				'description' => __( 'Optional autoresponder cycle day.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( '0', 'gutenverse-form' ),
			),
			'tags'                => array(
				'label'       => __( 'Tags JSON', 'gutenverse-form' ),
				'description' => __( 'Optional GetResponse tags JSON array.', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => '["y8inp","y8inq"]',
			),
			'custom_field_values' => array(
				'label'       => __( 'Custom Field Values JSON', 'gutenverse-form' ),
				'description' => __( 'Optional customFieldValues JSON array. Use custom field IDs from GetResponse.', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => '[{"customFieldId":"z9Kgt","value":["City"]}]',
			),
			'ip_address'          => array(
				'label'       => __( 'IP Address', 'gutenverse-form' ),
				'description' => __( 'Optional contact IP address.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( '192.168.0.1', 'gutenverse-form' ),
			),
		);
	}

	/**
	 * Get saved global settings for GetResponse.
	 *
	 * @return array Saved GetResponse settings.
	 */
	public function get_settings() {
		return get_option( 'gutenverse_form_get_response_settings', array() );
	}
}
