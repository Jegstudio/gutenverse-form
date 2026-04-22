<?php
/**
 * ActiveCampaign Integration Class.
 *
 * @package Gutenverse_Form
 */

namespace Gutenverse_Form\Integrations;

/**
 * Handles syncing form submissions to ActiveCampaign contacts.
 */
class Active_Campaign {
	/**
	 * Integration settings.
	 *
	 * @var array
	 */
	protected $settings;

	/**
	 * Register the ActiveCampaign integration hook.
	 */
	public function __construct() {
		add_action( 'gutenverse_form_after_store', array( $this, 'after_store' ), 10, 4 );
	}

	/**
	 * Set settings for ActiveCampaign.
	 *
	 * @param array $settings Integration settings.
	 *
	 * @return void
	 */
	public function set_settings( $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Get fields for the ActiveCampaign integration UI.
	 *
	 * @return array
	 */
	public function get_fields() {
		return array(
			'api_url'      => array(
				'label'       => __( 'API URL', 'gutenverse-form' ),
				'description' => __( 'Enter your ActiveCampaign account URL, for example https://youraccountname.api-us1.com.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => 'https://youraccountname.api-us1.com',
			),
			'api_key'      => array(
				'label'       => __( 'API Key', 'gutenverse-form' ),
				'description' => __( 'Enter your ActiveCampaign API token.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( 'ActiveCampaign API token', 'gutenverse-form' ),
			),
			'list_id'      => array(
				'label'       => __( 'List ID', 'gutenverse-form' ),
				'description' => __( 'Optional. Subscribe the contact to this ActiveCampaign list ID after syncing.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => '1',
			),
			'email'        => array(
				'label'       => __( 'Email', 'gutenverse-form' ),
				'description' => __( 'Use a form field placeholder such as {email}.', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( '{email}', 'gutenverse-form' ),
			),
			'first_name'   => array(
				'label'       => __( 'First Name', 'gutenverse-form' ),
				'description' => __( 'Optional first name placeholder, for example {first_name}.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( '{first_name}', 'gutenverse-form' ),
			),
			'last_name'    => array(
				'label'       => __( 'Last Name', 'gutenverse-form' ),
				'description' => __( 'Optional last name placeholder, for example {last_name}.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( '{last_name}', 'gutenverse-form' ),
			),
			'phone'        => array(
				'label'       => __( 'Phone', 'gutenverse-form' ),
				'description' => __( 'Optional phone placeholder, for example {phone}.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( '{phone}', 'gutenverse-form' ),
			),
			'tag_ids'      => array(
				'label'       => __( 'Tag IDs JSON', 'gutenverse-form' ),
				'description' => __( 'Optional JSON array of existing ActiveCampaign tag IDs.', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => '[1,2,3]',
			),
			'field_values' => array(
				'label'       => __( 'Field Values JSON', 'gutenverse-form' ),
				'description' => __( 'Optional JSON array of ActiveCampaign custom field values. Example: [{"field":"1","value":"{company}"}].', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => '[{"field":"1","value":"{company}"}]',
			),
			'automation_id' => array(
				'label'       => __( 'Automation ID', 'gutenverse-form' ),
				'description' => __( 'Optional. Add the synced contact to this automation ID.', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => '1',
			),
		);
	}

	/**
	 * Get saved ActiveCampaign settings.
	 *
	 * @return array
	 */
	public function get_settings() {
		return get_option( 'gutenverse_form_active_campaign_settings', array() );
	}

	/**
	 * Normalize the configured base API URL.
	 *
	 * @return string
	 */
	private function get_api_url() {
		$api_url = trim( (string) ( $this->settings['api_url'] ?? '' ) );
		if ( empty( $api_url ) ) {
			return '';
		}

		return untrailingslashit( esc_url_raw( $api_url, array( 'https' ) ) );
	}

	/**
	 * Build common request arguments.
	 *
	 * @param array $body Optional request body.
	 *
	 * @return array
	 */
	private function get_request_args( $body = null ) {
		$args = array(
			'headers' => array(
				'Api-Token'    => trim( (string) ( $this->settings['api_key'] ?? '' ) ),
				'Content-Type' => 'application/json',
			),
		);

		if ( null !== $body ) {
			$args['body'] = wp_json_encode( $body );
		}

		return $args;
	}

	/**
	 * Parse a setting with form placeholders.
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
	 * Decode a JSON array setting after placeholder replacement.
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

		return is_array( $decoded ) ? $decoded : array();
	}

	/**
	 * Check whether a remote response completed successfully.
	 *
	 * @param array|\WP_Error $response Remote response.
	 *
	 * @return bool
	 */
	private function is_success_response( $response ) {
		if ( is_wp_error( $response ) ) {
			return false;
		}

		$status_code = (int) wp_remote_retrieve_response_code( $response );

		return $status_code >= 200 && $status_code < 300;
	}

	/**
	 * Extract the contact ID from the sync response.
	 *
	 * @param array|\WP_Error $response Remote response.
	 *
	 * @return int
	 */
	private function get_contact_id_from_response( $response ) {
		if ( is_wp_error( $response ) ) {
			return 0;
		}

		$body    = wp_remote_retrieve_body( $response );
		$decoded = json_decode( $body, true );

		if ( isset( $decoded['contact']['id'] ) ) {
			return (int) $decoded['contact']['id'];
		}

		if ( isset( $decoded['id'] ) ) {
			return (int) $decoded['id'];
		}

		return 0;
	}

	/**
	 * Log a detailed ActiveCampaign step result.
	 *
	 * @param int    $entry_id Entry ID.
	 * @param string $status   success|error|skipped.
	 * @param string $message  Log message.
	 * @param array  $context  Extra context.
	 *
	 * @return void
	 */
	private function log_step( $entry_id, $status, $message, $context = array() ) {
		\Gutenverse_Form\Integration::log_result( $entry_id, 'active_campaign', $status, $message, $context );
	}

	/**
	 * Synchronize a contact to ActiveCampaign.
	 *
	 * @param array $contact Contact payload.
	 *
	 * @return array|\WP_Error
	 */
	private function sync_contact( $contact ) {
		return wp_remote_post(
			$this->get_api_url() . '/api/3/contact/sync',
			$this->get_request_args(
				array(
					'contact' => $contact,
				)
			)
		);
	}

	/**
	 * Subscribe a contact to a list.
	 *
	 * @param int $contact_id ActiveCampaign contact ID.
	 * @param int $list_id    ActiveCampaign list ID.
	 *
	 * @return array|\WP_Error
	 */
	private function subscribe_contact_to_list( $contact_id, $list_id ) {
		return wp_remote_post(
			$this->get_api_url() . '/api/3/contactLists',
			$this->get_request_args(
				array(
					'contactList' => array(
						'contact' => (string) $contact_id,
						'list'    => (string) $list_id,
						'status'  => '1',
					),
				)
			)
		);
	}

	/**
	 * Fetch current field values for a contact.
	 *
	 * @param int $contact_id ActiveCampaign contact ID.
	 *
	 * @return array<string, string>
	 */
	private function get_existing_field_values( $contact_id ) {
		$response = wp_remote_get(
			$this->get_api_url() . '/api/3/contacts/' . $contact_id . '/fieldValues',
			$this->get_request_args()
		);

		if ( ! $this->is_success_response( $response ) ) {
			return array();
		}

		$decoded      = json_decode( wp_remote_retrieve_body( $response ), true );
		$field_values = array();

		if ( isset( $decoded['fieldValues'] ) && is_array( $decoded['fieldValues'] ) ) {
			foreach ( $decoded['fieldValues'] as $field_value ) {
				$field_id       = isset( $field_value['field'] ) ? (string) $field_value['field'] : '';
				$field_value_id = isset( $field_value['id'] ) ? (string) $field_value['id'] : '';

				if ( '' !== $field_id && '' !== $field_value_id ) {
					$field_values[ $field_id ] = $field_value_id;
				}
			}
		}

		return $field_values;
	}

	/**
	 * Upsert custom field values for a contact.
	 *
	 * @param int   $contact_id    ActiveCampaign contact ID.
	 * @param array $field_values  Field value payloads.
	 *
	 * @return array|\WP_Error|true
	 */
	private function sync_field_values( $contact_id, $field_values ) {
		if ( empty( $field_values ) ) {
			return true;
		}

		$existing_values = $this->get_existing_field_values( $contact_id );

		foreach ( $field_values as $field_value ) {
			$field_id = isset( $field_value['field'] ) ? preg_replace( '/[^0-9]/', '', (string) $field_value['field'] ) : '';
			$value    = isset( $field_value['value'] ) ? (string) $field_value['value'] : '';

			if ( '' === $field_id || '' === trim( $value ) ) {
				continue;
			}

			$payload = array(
				'fieldValue' => array(
					'contact' => (string) $contact_id,
					'field'   => $field_id,
					'value'   => $value,
				),
			);

			if ( isset( $existing_values[ $field_id ] ) ) {
				$response = wp_remote_request(
					$this->get_api_url() . '/api/3/fieldValues/' . $existing_values[ $field_id ],
					array_merge(
						$this->get_request_args( $payload ),
						array(
							'method' => 'PUT',
						)
					)
				);
			} else {
				$response = wp_remote_post(
					$this->get_api_url() . '/api/3/fieldValues',
					$this->get_request_args( $payload )
				);
			}

			if ( ! $this->is_success_response( $response ) ) {
				return $response;
			}
		}

		return true;
	}

	/**
	 * Add tags to a contact.
	 *
	 * @param int   $contact_id ActiveCampaign contact ID.
	 * @param array $tag_ids    Array of tag IDs.
	 *
	 * @return array|\WP_Error|true
	 */
	private function add_tags( $contact_id, $tag_ids ) {
		if ( empty( $tag_ids ) ) {
			return true;
		}

		foreach ( $tag_ids as $tag_id ) {
			$tag_id = preg_replace( '/[^0-9]/', '', (string) $tag_id );

			if ( empty( $tag_id ) ) {
				continue;
			}

			$response = wp_remote_post(
				$this->get_api_url() . '/api/3/contactTags',
				$this->get_request_args(
					array(
						'contactTag' => array(
							'contact' => (string) $contact_id,
							'tag'     => $tag_id,
						),
					)
				)
			);

			if ( ! $this->is_success_response( $response ) ) {
				return $response;
			}
		}

		return true;
	}

	/**
	 * Add a contact to an automation.
	 *
	 * @param int $contact_id     ActiveCampaign contact ID.
	 * @param int $automation_id  ActiveCampaign automation ID.
	 *
	 * @return array|\WP_Error
	 */
	private function add_to_automation( $contact_id, $automation_id ) {
		return wp_remote_post(
			$this->get_api_url() . '/api/3/contactAutomations',
			$this->get_request_args(
				array(
					'contactAutomation' => array(
						'contact'    => (string) $contact_id,
						'automation' => (string) $automation_id,
					),
				)
			)
		);
	}

	/**
	 * Send a contact payload to ActiveCampaign.
	 *
	 * @param array $data     Prepared form data keyed by field ID.
	 * @param int   $entry_id Entry ID.
	 * @param int   $form_id  Form ID.
	 *
	 * @return array|\WP_Error|false
	 */
	public function send( $data, $entry_id = 0, $form_id = 0 ) {
		$api_url       = $this->get_api_url();
		$api_key       = trim( (string) ( $this->settings['api_key'] ?? '' ) );
		$email         = sanitize_email( $this->parse_setting( 'email', $data, $entry_id, $form_id ) );
		$first_name    = sanitize_text_field( $this->parse_setting( 'first_name', $data, $entry_id, $form_id ) );
		$last_name     = sanitize_text_field( $this->parse_setting( 'last_name', $data, $entry_id, $form_id ) );
		$phone         = sanitize_text_field( $this->parse_setting( 'phone', $data, $entry_id, $form_id ) );
		$list_id       = preg_replace( '/[^0-9]/', '', (string) ( $this->settings['list_id'] ?? '' ) );
		$automation_id = preg_replace( '/[^0-9]/', '', (string) ( $this->settings['automation_id'] ?? '' ) );
		$tag_ids       = $this->decode_json_array_setting( 'tag_ids', $data, $entry_id, $form_id );
		$field_values  = $this->decode_json_array_setting( 'field_values', $data, $entry_id, $form_id );

		if ( empty( $api_url ) || empty( $api_key ) || empty( $email ) ) {
			$missing = array();
			if ( empty( $api_url ) ) {
				$missing[] = 'api_url';
			}
			if ( empty( $api_key ) ) {
				$missing[] = 'api_key';
			}
			if ( empty( $email ) ) {
				$missing[] = 'email';
			}

			$this->log_step(
				$entry_id,
				'skipped',
				__( 'ActiveCampaign sync skipped because required settings are missing.', 'gutenverse-form' ),
				array(
					'missing' => $missing,
				)
			);
			return false;
		}

		$contact = array(
			'email' => $email,
		);

		if ( ! empty( $first_name ) ) {
			$contact['firstName'] = $first_name;
		}

		if ( ! empty( $last_name ) ) {
			$contact['lastName'] = $last_name;
		}

		if ( ! empty( $phone ) ) {
			$contact['phone'] = $phone;
		}

		$response = $this->sync_contact( $contact );
		if ( ! $this->is_success_response( $response ) ) {
			$this->log_step(
				$entry_id,
				'error',
				__( 'ActiveCampaign contact sync request failed.', 'gutenverse-form' ),
				array(
					'email' => $email,
				)
			);
			return $response;
		}

		$contact_id = $this->get_contact_id_from_response( $response );
		if ( $contact_id <= 0 ) {
			$this->log_step(
				$entry_id,
				'error',
				__( 'ActiveCampaign contact sync did not return a contact ID.', 'gutenverse-form' ),
				array(
					'email' => $email,
				)
			);
			return $response;
		}

		$this->log_step(
			$entry_id,
			'success',
			__( 'ActiveCampaign contact synced successfully.', 'gutenverse-form' ),
			array(
				'contact_id' => $contact_id,
				'email'      => $email,
			)
		);

		if ( ! empty( $list_id ) ) {
			$list_response = $this->subscribe_contact_to_list( $contact_id, (int) $list_id );
			if ( ! $this->is_success_response( $list_response ) ) {
				$this->log_step(
					$entry_id,
					'error',
					__( 'ActiveCampaign list subscription failed.', 'gutenverse-form' ),
					array(
						'contact_id' => $contact_id,
						'list_id'    => $list_id,
					)
				);
				return $list_response;
			}

			$this->log_step(
				$entry_id,
				'success',
				__( 'ActiveCampaign list subscription succeeded.', 'gutenverse-form' ),
				array(
					'contact_id' => $contact_id,
					'list_id'    => $list_id,
				)
			);
		}

		$field_value_response = $this->sync_field_values( $contact_id, $field_values );
		if ( true !== $field_value_response ) {
			$this->log_step(
				$entry_id,
				'error',
				__( 'ActiveCampaign custom field sync failed.', 'gutenverse-form' ),
				array(
					'contact_id' => $contact_id,
				)
			);
			return $field_value_response;
		}

		if ( ! empty( $field_values ) ) {
			$this->log_step(
				$entry_id,
				'success',
				__( 'ActiveCampaign custom field values synced.', 'gutenverse-form' ),
				array(
					'contact_id'   => $contact_id,
					'field_count'  => count( $field_values ),
				)
			);
		}

		$tag_response = $this->add_tags( $contact_id, $tag_ids );
		if ( true !== $tag_response ) {
			$this->log_step(
				$entry_id,
				'error',
				__( 'ActiveCampaign tag assignment failed.', 'gutenverse-form' ),
				array(
					'contact_id' => $contact_id,
				)
			);
			return $tag_response;
		}

		if ( ! empty( $tag_ids ) ) {
			$this->log_step(
				$entry_id,
				'success',
				__( 'ActiveCampaign tags assigned.', 'gutenverse-form' ),
				array(
					'contact_id' => $contact_id,
					'tag_count'  => count( $tag_ids ),
				)
			);
		}

		if ( ! empty( $automation_id ) ) {
			$automation_response = $this->add_to_automation( $contact_id, (int) $automation_id );
			if ( ! $this->is_success_response( $automation_response ) ) {
				$this->log_step(
					$entry_id,
					'error',
					__( 'ActiveCampaign automation enrollment failed.', 'gutenverse-form' ),
					array(
						'contact_id'    => $contact_id,
						'automation_id' => $automation_id,
					)
				);
				return $automation_response;
			}

			$this->log_step(
				$entry_id,
				'success',
				__( 'ActiveCampaign automation enrollment succeeded.', 'gutenverse-form' ),
				array(
					'contact_id'    => $contact_id,
					'automation_id' => $automation_id,
				)
			);
		}

		return $response;
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
		$global_settings  = get_option( 'gutenverse_form_active_campaign_settings', array() );
		$global_enabled   = ! empty( $options['active_campaign'] );
		$has_request_actions = \Gutenverse_Form\Integration::request_has_integration_actions( $params );
		$actions          = \Gutenverse_Form\Integration::get_service_actions( 'active_campaign', $params, $form_setting );

		if ( $global_enabled && ! $has_request_actions ) {
			$this->log_step( $entry_id, 'success', __( 'ActiveCampaign triggered from dashboard settings.', 'gutenverse-form' ) );
			$this->set_settings( $global_settings );
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'active_campaign', $this->send( $data, $entry_id, $params['form-id'] ?? 0 ) );
		}

		foreach ( $actions as $action ) {
			$this->log_step( $entry_id, 'success', __( 'ActiveCampaign triggered from a form action.', 'gutenverse-form' ) );
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
			\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'active_campaign', $this->send( $data, $entry_id, $params['form-id'] ?? 0 ) );
		}

		if ( ! $global_enabled && ! $has_request_actions ) {
			$this->log_step( $entry_id, 'skipped', __( 'ActiveCampaign was not enabled in the dashboard and no form action requested it.', 'gutenverse-form' ) );
			return;
		}

		if ( $has_request_actions && empty( $actions ) ) {
			$this->log_step( $entry_id, 'skipped', __( 'ActiveCampaign was not listed in the form submission integration actions.', 'gutenverse-form' ) );
		}
	}
}
