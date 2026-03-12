<?php
/**
 * WhatsApp Integration Class.
 *
 * @package Gutenverse_Form
 */

namespace Gutenverse_Form\Integrations;

/**
 * Class Whatsapp
 */
class Whatsapp {
	/**
	 * Integration settings.
	 *
	 * @var array
	 */
	protected $settings;

	/**
	 * Set settings for WhatsApp.
	 *
	 * @param array $settings Integration settings.
	 */
	public function set_settings( $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Get fields for WhatsApp.
	 *
	 * @return array
	 */
	public function get_fields() {
		return array(
			'business_number_id' => array(
				'label'       => __( 'Business Number ID', 'gutenverse-form' ),
				'description' => __( 'Enter your WhatsApp Business Number ID', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => '1077649588754603',
			),
			'access_token'       => array(
				'label'       => __( 'Access Token', 'gutenverse-form' ),
				'description' => __( 'Enter your WhatsApp Access Token', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => 'EAAhYKCB...',
			),
			'recipient'          => array(
				'label'       => __( 'Recipient Number', 'gutenverse-form' ),
				'description' => __( 'Enter recipient phone number or {field_id}', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => '6282237741202',
			),
			'template_json'      => array(
				'label'       => __( 'Template JSON', 'gutenverse-form' ),
				'description' => __( 'Enter the WhatsApp template JSON', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => '{ "name": "order_confirmation", ... }',
			),
		);
	}

	/**
	 * Get saved settings.
	 *
	 * @return array
	 */
	public function get_settings() {
		return get_option( 'gutenverse_form_whatsapp_settings', array() );
	}

	/**
	 * Send data to WhatsApp Cloud API.
	 *
	 * @param array $data     Form data.
	 * @param int   $entry_id Entry ID.
	 * @param int   $form_id  Form ID.
	 * @return array|bool|\WP_Error
	 */
	public function send( $data, $entry_id = 0, $form_id = 0 ) {
		$business_id  = $this->settings['business_number_id'] ?? '';
		$access_token = $this->settings['access_token'] ?? '';
		$recipient    = \Gutenverse_Form\Integration::parse_template( $this->settings['recipient'] ?? '', $data, $entry_id, $form_id );

		if ( empty( $business_id ) || empty( $access_token ) || empty( $recipient ) ) {
			return false;
		}

		$template_json = $this->settings['template_json'] ?? '';
		if ( empty( $template_json ) ) {
			return false;
		}

		// Decode first to handle the structure.
		$template_data = json_decode( $template_json, true );

		if ( ! $template_data ) {
			// Fallback: if decode fails, try parsing template first (legacy/broken behavior but might work for simple strings).
			$parsed_json   = \Gutenverse_Form\Integration::parse_template( $template_json, $data, $entry_id, $form_id );
			$template_data = json_decode( $parsed_json, true );

			if ( ! $template_data ) {
				return false;
			}
		} else {
			// Parse templates recursively in the array to handle quotes safely.
			$template_data = $this->parse_template_recursive( $template_data, $data, $entry_id, $form_id );
		}

		/**
		 * Normalization for custom positional format.
		 * If 'parameter_format' is set to 'positional', we transform it to Meta's expected format.
		 */
		if ( isset( $template_data['parameter_format'] ) && 'positional' === $template_data['parameter_format'] ) {
			$normalized = array(
				'name'       => $template_data['name'] ?? '',
				'language'   => array(
					'code' => is_array( $template_data['language'] ?? null ) ? ( $template_data['language']['code'] ?? 'en_US' ) : ( $template_data['language'] ?? 'en_US' ),
				),
				'components' => array(),
			);

			if ( isset( $template_data['components'] ) && is_array( $template_data['components'] ) ) {
				foreach ( $template_data['components'] as $component ) {
					$new_comp = array( 'type' => $component['type'] ?? 'body' );
					if ( isset( $component['example']['body_text'][0] ) && is_array( $component['example']['body_text'][0] ) ) {
						$parameters = array();
						foreach ( $component['example']['body_text'][0] as $text ) {
							$parameters[] = array(
								'type' => 'text',
								'text' => (string) $text,
							);
						}
						$new_comp['parameters'] = $parameters;
					}
					$normalized['components'][] = $new_comp;
				}
			}
			$template_data = $normalized;
		}

		$template_json = wp_json_encode( $template_data );
		$debug         = defined( 'WP_DEBUG' ) && WP_DEBUG;

		return $this->send_whatsapp_template( $business_id, $recipient, $access_token, $template_json, $debug );
	}

	/**
	 * Parse template placeholders recursively in an array.
	 *
	 * @param mixed $input    Input data.
	 * @param array $data     Form data.
	 * @param int   $entry_id Entry ID.
	 * @param int   $form_id  Form ID.
	 * @return mixed
	 */
	protected function parse_template_recursive( $input, $data, $entry_id, $form_id ) {
		if ( is_array( $input ) ) {
			foreach ( $input as $key => $value ) {
				$input[ $key ] = $this->parse_template_recursive( $value, $data, $entry_id, $form_id );
			}
		} elseif ( is_string( $input ) ) {
			return \Gutenverse_Form\Integration::parse_template( $input, $data, $entry_id, $form_id );
		}
		return $input;
	}

	/**
	 * Send WhatsApp template message via Meta API.
	 *
	 * @param string  $number_id     Business Number ID.
	 * @param string  $phone_to      Recipient phone number.
	 * @param string  $auth_token    Access Token.
	 * @param string  $template_json Template JSON string.
	 * @param boolean $debug         Debug mode.
	 * @return array|\WP_Error
	 */
	protected function send_whatsapp_template( $number_id, $phone_to, $auth_token, $template_json, $debug = false ) {

		// Basic phone validation (numbers only).
		$phone_to = preg_replace( '/[^0-9]/', '', $phone_to );

		if ( empty( $phone_to ) ) {
			return new \WP_Error( 'invalid_phone', 'Phone number is invalid.' );
		}

		// Decode template JSON.
		$template_array = json_decode( $template_json, true );

		if ( ! $template_array || ! isset( $template_array['name'] ) ) {
			return new \WP_Error( 'invalid_template', 'Template JSON is invalid.' );
		}

		$url = "https://graph.facebook.com/v22.0/{$number_id}/messages";

		$body = array(
			'messaging_product' => 'whatsapp',
			'to'                => $phone_to,
			'type'              => 'template',
			'template'          => $template_array,
		);

		$args = array(
			'method'  => 'POST',
			'headers' => array(
				'Authorization' => 'Bearer ' . $auth_token,
				'Content-Type'  => 'application/json',
			),
			'body'    => wp_json_encode( $body ),
			'timeout' => 30,
		);

		$response = wp_remote_post( $url, $args );
		gutenverse_rlog( $args );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$status       = wp_remote_retrieve_response_code( $response );
		$body_raw     = wp_remote_retrieve_body( $response );
		$body_decoded = json_decode( $body_raw, true );

		// Meta API error detection.
		if ( $status >= 400 ) {

			$error_message = $body_decoded['error']['message'] ?? 'Unknown error';
			$error_code    = $body_decoded['error']['code'] ?? 'meta_error';

			if ( $debug ) {
				error_log( 'WhatsApp API Error: ' . print_r( $body_decoded, true ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
			}

			return new \WP_Error( $error_code, $error_message, $body_decoded );
		}

		if ( $debug ) {
			error_log( 'WhatsApp API Success: ' . $body_raw ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}

		return array(
			'success' => true,
			'status'  => $status,
			'data'    => $body_decoded,
		);
	}

	/**
	 * Whatsapp Constructor.
	 */
	public function __construct() {
		add_action( 'gutenverse_form_after_store', array( $this, 'after_store' ), 10, 4 );
	}

	/**
	 * Triggered after form data is stored.
	 *
	 * @param int    $entry_id     Entry ID.
	 * @param array  $params       Form parameters.
	 * @param array  $form_setting Form settings.
	 * @param object $request      Request object.
	 */
	public function after_store( $entry_id, $params, $form_setting, $request ) {
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

		// 1. Process Per-Block Integrations (Prioritize).
		$has_block_integration = false;
		if ( isset( $params['integrations']['actions'] ) && is_array( $params['integrations']['actions'] ) ) {
			foreach ( $params['integrations']['actions'] as $action ) {
				if ( 'whatsapp' === ( $action['type'] ?? '' ) ) {
					$has_block_integration = true;
					$this->set_settings( $action );
					$this->send( $data, $entry_id, $params['form-id'] );
				}
			}
		}

		// 2. Process Global & Per-Form Action Settings (Fallback).
		if ( ! $has_block_integration ) {
			$options         = get_option( 'gutenverse_form_integrations', array() );
			$global_settings = get_option( 'gutenverse_form_whatsapp_settings', array() );
			$global_enabled  = ! empty( $options['whatsapp'] );
			$apply_globally  = isset( $global_settings['apply_globally'] ) ? (bool) $global_settings['apply_globally'] : false;

			$local_settings = isset( $form_setting['integrations']['whatsapp'] ) ? $form_setting['integrations']['whatsapp'] : array();
			$local_enabled  = isset( $local_settings['enabled'] ) ? (bool) $local_settings['enabled'] : false;

			if ( ( $global_enabled && $apply_globally ) || $local_enabled ) {
				$settings = array_merge( $global_settings, $local_settings );
				$this->set_settings( $settings );
				$this->send( $data, $entry_id, $params['form-id'] );
			}
		}
	}
}
