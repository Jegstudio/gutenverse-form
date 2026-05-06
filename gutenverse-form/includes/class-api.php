<?php
/**
 * REST APIs class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse
 */

namespace Gutenverse_Form;

use Gutenverse_Form\Form;
use WP_REST_Response;

/**
 * Class Api
 *
 * @package gutenverse
 */
class Api {
	/**
	 * Instance of Gutenverse.
	 *
	 * @var Api
	 */
	private static $instance;

	/**
	 * Endpoint Path
	 *
	 * @var string
	 */
	const ENDPOINT = 'gutenverse-form-client/v1';

	/**
	 * Singleton page for Gutenverse Class
	 *
	 * @return Api
	 */
	public static function instance() {
		if ( null === static::$instance ) {
			static::$instance = new static();
		}

		return static::$instance;
	}

	/**
	 * Blocks constructor.
	 */
	private function __construct() {
		if ( did_action( 'rest_api_init' ) ) {
			$this->register_routes();
		}
	}

	/**
	 * Register Gutenverse APIs
	 */
	private function register_routes() {
		/**
		 * Backend routes.
		 */
		register_rest_route(
			self::ENDPOINT,
			'form-action/create',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'create_form_action' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'form/get-allowed-mimes',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_allowed_mimes' ),
				'permission_callback' => 'gutenverse_permission_check_author',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'form-action/edit',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'edit_form_action' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'form-action/dashboard',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_form_dashboard' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'form-action/ownership',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'ensure_form_action_ownership' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'integration/save',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_integration' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'integration/save_settings',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_integration_settings' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'integration/block_secret',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'save_block_secret' ),
				'permission_callback' => function () {
					return is_user_logged_in();
				},
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'form-action/(?P<id>\d+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_form_action' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'form-action/(?P<id>\d+)',
			array(
				'methods'             => 'DELETE',
				'callback'            => array( $this, 'delete_form_action' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'form-action/clone',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'clone_form_action' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'form-action/export/(?P<id>\d+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'export_form_action' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'form/search',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'search_form' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'form/meta-keys',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_meta_keys' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

		/** ----------------------------------------------------------------
		 * Frontend/Global Routes
		 */
		register_rest_route(
			self::ENDPOINT,
			'form/init',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'form_init' ),
				'permission_callback' => function () {
					return true; // Only if public forms are intended.
				},
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'form/submit',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'submit_form' ),
				'permission_callback' => function () {
					return true; // Only if public forms are intended.
				},
			)
		);
	}

	/**
	 * Get form dashboard data.
	 *
	 * @return WP_REST_Response
	 */
	public function get_form_dashboard() {
		return rest_ensure_response( Form::get_form_dashboard_summary() );
	}

	/**
	 * Get Allowed Mimes
	 *
	 * @param object $request object .
	 */
	public function get_allowed_mimes( $request ) {
		$allowed_mimes = get_allowed_mime_types();
		$image_exts    = array();

		foreach ( $allowed_mimes as $exts => $mime ) {
			if ( strpos( $mime, 'image/' ) === 0 ) {
				foreach ( explode( '|', $exts ) as $ext ) {
					$ext = strtolower( trim( $ext ) ); // 🔹 filter/clean key
					array_push( $image_exts, $ext );
				}
			}
		}
		$user_input = strtolower( trim( $request->get_param( 'search' ) ) );
		$filtered   = array_filter(
			$image_exts,
			function ( $ext ) use ( $user_input ) {
				return strpos( $ext, $user_input ) !== false;
			},
			ARRAY_FILTER_USE_BOTH
		);
		return rest_ensure_response( $filtered );
	}

	/**
	 * Export Form Action
	 *
	 * @param object $request object.
	 */
	public function export_form_action( $request ) {
		$form_id    = $request->get_param( 'id' );
		$file_title = get_the_title( $form_id ) . '-' . time();
		$m_filter   = sanitize_text_field( (string) $request->get_param( 'm' ) );
		$query_args = array(
			'post_type'      => Entries::POST_TYPE,
			'posts_per_page' => -1,
			'post_status'    => array( 'publish' ),
			'orderby'        => 'date',
			'order'          => 'DESC',
			'meta_query'     => array( //phpcs:ignore
				array(
					'key'     => 'form-id',
					'value'   => $form_id,
					'compare' => '=',
				),
			),
		);

		if ( preg_match( '/^\d{6}$/', $m_filter ) ) {
			$query_args['year']     = (int) substr( $m_filter, 0, 4 );
			$query_args['monthnum'] = (int) substr( $m_filter, 4, 2 );
		}

		$posts = get_posts( $query_args );

		header( 'Content-type: text/csv' );
		header( 'Content-Disposition: attachment; filename=' . $file_title . '.csv' );
		header( 'Pragma: no-cache' );
		header( 'Expires: 0' );

		foreach ( $posts as $id => $post ) {
			$form = get_post_meta( $post->ID, 'entry-data', true );
			if ( 0 === $id ) {
				foreach ( $form as $id => $data ) {
					echo esc_html( $data['id'] );

					if ( count( $form ) > ( $id + 1 ) ) {
						echo ',';
					}
				}
				echo "\n";
			}

			foreach ( $form as $id => $data ) {
				if ( is_array( $data['value'] ) ) {
					echo '"';
					echo esc_html( implode( ',', $data['value'] ) );
					echo '"';
				} else {
					echo '"';
					echo esc_html( str_replace( '"', '`', $data['value'] ) );
					echo '"';
				}

				if ( count( $form ) > ( $id + 1 ) ) {
					echo ',';
				}
			}
			echo "\n";
		}

		exit;
	}

	/**
	 * Get Form Action
	 *
	 * @param object $request object.
	 *
	 * @return boolean
	 */
	public function get_form_action( $request ) {
		$id = $request->get_param( 'id' );
		return Form::get_form_action_data( $id );
	}

	/**
	 * Delete Form Action
	 *
	 * @param object $request object.
	 *
	 * @return boolean
	 */
	public function delete_form_action( $request ) {
		$id                = $request->get_param( 'id' );
		$owner_post_id     = $request->get_param( 'owner_post_id' );
		$owner_instance_id = $request->get_param( 'owner_instance_id' );
		$form_action       = Form::delete_form_action( $id, $owner_post_id, $owner_instance_id );
		return rest_ensure_response( $form_action );
	}

	/**
	 * Clone form action.
	 *
	 * @param object $request object.
	 *
	 * @return boolean
	 */
	public function clone_form_action( $request ) {
		$id                = $request->get_param( 'id' );
		$owner_post_id     = $request->get_param( 'owner_post_id' );
		$owner_instance_id = $request->get_param( 'owner_instance_id' );
		$form_action       = Form::clone_form_action( $id, $owner_post_id, $owner_instance_id );
		return rest_ensure_response( $form_action );
	}

	/**
	 * Ensure form action ownership.
	 *
	 * @param object $request object.
	 *
	 * @return array|WP_Error
	 */
	public function ensure_form_action_ownership( $request ) {
		$id                = $request->get_param( 'id' );
		$owner_post_id     = $request->get_param( 'owner_post_id' );
		$owner_instance_id = $request->get_param( 'owner_instance_id' );
		$form_action       = Form::ensure_form_action_ownership( $id, $owner_post_id, $owner_instance_id );

		return rest_ensure_response( $form_action );
	}

	/**
	 * Create Form Action
	 *
	 * @param object $request object.
	 *
	 * @return boolean
	 */
	public function edit_form_action( $request ) {
		$form = $request->get_param( 'form' );

		$params = wp_parse_args(
			$form,
			array(
				'id'            => '',
				'title'         => '',
				'require_login' => '',
				'user_browser'  => '',
				'use_cache'     => '',
			)
		);

		$form_action = Form::edit_form_action( $params );
		return rest_ensure_response( $form_action );
	}

	/**
	 * Create Form Action
	 *
	 * @param object $request object.
	 *
	 * @return boolean
	 */
	public function create_form_action( $request ) {
		$form = $request->get_param( 'form' );

		$params = wp_parse_args(
			$form,
			array(
				'title'                          => '',
				'require_login'                  => '',
				'user_browser'                   => '',
				'entry_title_type'                => '',
				'entry_title_static_text'         => '',
				'entry_title_input_name'          => '',
				'entry_title_custom_format'       => '',
				'user_confirm'                   => '',
				'auto_select_email'              => '',
				'email_input_name'               => '',
				'user_email_subject'             => '',
				'user_email_form'                => '',
				'user_email_reply_to'            => '',
				'user_email_reply_to_type'       => '',
				'user_email_reply_to_dynamic'    => '',
				'user_email_body'                => '',
				'user_email_subject_type'        => '',
				'user_email_subject_meta_key'    => '',
				'user_message_type'              => '',
				'admin_confirm'                  => '',
				'admin_email_subject'            => '',
				'admin_email_subject_type'       => '',
				'admin_email_subject_meta_key'   => '',
				'admin_email_to'                 => '',
				'admin_email_from'               => '',
				'admin_email_reply_to'           => '',
				'admin_email_reply_to_type'      => '',
				'admin_email_reply_to_dynamic'   => '',
				'admin_note'                     => '',
				'admin_email_type'               => '',
				'admin_email_source'             => '',
				'admin_email_meta_key'           => '',
				'admin_message_type'             => '',
				'admin_message_input_name'       => '',
				'user_email_template'            => '',
				'admin_email_template'           => '',
				'overwrite_default_confirmation' => '',
				'overwrite_default_notification' => '',
				'owner_post_id'                  => '',
				'owner_instance_id'              => '',
			)
		);

		$form_action = Form::create_form_action( $params );
		return rest_ensure_response( $form_action );
	}

	/**
	 * Get User IP Address
	 *
	 * @param array $data .
	 *
	 * @return array|false
	 */
	public function get_browser_data( $data ) {
		if ( empty( $data['user_browser'] ) ) {
			return false;
		}

		$ip = 'unknown';

		if ( ! empty( $_SERVER['HTTP_CLIENT_IP'] ) ) {
			$ip = sanitize_text_field( wp_unslash( $_SERVER['HTTP_CLIENT_IP'] ) );
		} elseif ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
			$ip = sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) );
		} elseif ( ! empty( $_SERVER['REMOTE_ADDR'] ) ) {
			$ip = sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) );
		}

		$user_agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : 'unknown';

		return array(
			'ip'         => $ip,
			'user_agent' => $user_agent,
		);
	}

	/**
	 * Filter Form Params
	 *
	 * @param array     $entry_data .
	 * @param WP_Object $request .
	 *
	 * @return array|null
	 */
	private function filter_form_params( $entry_data, $request ) {
		$filtered_data = array();
		$entry_data    = rest_sanitize_array( $entry_data );
		$error         = array();
		$form_entry    = $request->get_param( 'form-entry' );
		$form_id       = $form_entry['formId'];
		$form_options  = get_post_meta( (int) $form_id, 'form-data', true );
		$file_rules    = array(
			'max_size'           => isset( $form_options['max_size_file'] ) ? $form_options['max_size_file'] : false,
			'allowed_extensions' => isset( $form_options['allowed_extensions'] ) ? $form_options['allowed_extensions'] : false,
		);
		if ( isset( $entry_data ) ) {
			foreach ( $entry_data as $key => $data ) {
				$value_key = $data['id'] . '-' . $key . '-value';
				if ( ! isset( $data['type'] ) ) {
					return null;
				}

				switch ( $data['type'] ) {
					case 'text':
					case 'select':
					case 'telp':
					case 'mobile':
					case 'radio':
					case 'date':
					case 'gdpr':
					case 'image-radio':
						$filtered_data[] = array(
							'id'    => sanitize_key( $data['id'] ),
							'value' => sanitize_text_field( $data[ $value_key ] ),
						);
						break;
					case 'email':
						$filtered_data[] = array(
							'id'    => sanitize_key( $data['id'] ),
							'value' => sanitize_email( $data[ $value_key ] ),
						);
						break;
					case 'textarea':
						$filtered_data[] = array(
							'id'    => sanitize_key( $data['id'] ),
							'value' => sanitize_textarea_field( $data[ $value_key ] ),
						);
						break;
					case 'number':
						$filtered_data[] = array(
							'id'    => sanitize_key( $data['id'] ),
							'value' => floatval( $data[ $value_key ] ),
						);
						break;
					case 'switch':
						$filtered_data[] = array(
							'id'    => sanitize_key( $data['id'] ),
							'value' => rest_sanitize_boolean( $data[ $value_key ] ),
						);
						break;
					case 'multiselect':
					case 'multi-group-select':
					case 'checkbox':
						$raw_values      = rest_sanitize_array( $data[ $value_key ] );
						$filtered_data[] = array(
							'id'    => sanitize_key( $data['id'] ),
							'value' => array_map( 'sanitize_text_field', $raw_values ),
						);
						break;
					case 'file':
						$id    = sanitize_key( $data['id'] );
						$files = $request->get_file_params();

						if ( ! isset( $files['form-entry'] ) ) {
							break;
						}

						$file_names = $files['form-entry']['name']['data'][ $key ][ $value_key ];
						if ( ! empty( $file_names ) ) {
							$file_info = array(
								'name'      => $files['form-entry']['name']['data'][ $key ][ $value_key ],
								'type'      => $files['form-entry']['type']['data'][ $key ][ $value_key ],
								'tmp_name'  => $files['form-entry']['tmp_name']['data'][ $key ][ $value_key ],
								'error'     => $files['form-entry']['error']['data'][ $key ][ $value_key ],
								'size'      => $files['form-entry']['size']['data'][ $key ][ $value_key ],
								'full_path' => $files['form-entry']['full_path']['data'][ $key ][ $value_key ],
							);

							if ( $file_rules['max_size'] && intval( $file_info['size'] ) > intval( $file_rules['max_size'] ) * 1024 ) {
								array_push( $error, $file_info['name'] . ' exceeds max size of ' . $file_rules['max_size'] . 'KB.' );
							}

							$allowed_ext = array();
							if ( $file_rules['allowed_extensions'] && 0 < count( $file_rules['allowed_extensions'] ) ) {
								$allowed_ext = array_column( $file_rules['allowed_extensions'], 'value' );
							} else {
								$allowed_ext = array( 'jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'zip' );
							}

							$file_ext = strtolower( pathinfo( $file_info['name'], PATHINFO_EXTENSION ) );
							if ( ! in_array( $file_ext, $allowed_ext, true ) ) {
								array_push( $error, $file_info['name'] . '\'s extensions not allowed.' );
							}
							if ( count( $error ) > 0 ) {
								break;
							}
							$uploaded = wp_handle_upload( $file_info, array( 'test_form' => false ) );
							if ( ! isset( $uploaded['error'] ) ) {
								$file_url = $uploaded['url'];

								// SVG Safety Check .
								if ( 'image/svg+xml' === $uploaded['type'] || 'svg' === strtolower( pathinfo( $uploaded['file'], PATHINFO_EXTENSION ) ) ) {
									if ( function_exists( 'gutenverse_is_svg_safe' ) ) {
										$svg_content = file_get_contents( $uploaded['file'] );
										if ( ! gutenverse_is_svg_safe( $svg_content ) ) {
											unlink( $uploaded['file'] );
											array_push( $error, $file_info['name'] . ' contains unsafe SVG content.' );
											break;
										}
									}
								}

								$filtered_data[] = array(
									'id'    => $id,
									'value' => $file_url,
								);
							} else {
								$filtered_data[] = array(
									'id'    => $id,
									'value' => null,
								);
							}
						}
						break;
					default:
						break;
				}
			}
		}
		if ( count( $error ) > 0 ) {
			return array(
				'status'  => false,
				'message' => implode( ', ', $error ),
			);
		} else {
			return array(
				'status' => true,
				'data'   => $filtered_data,
			);
		}
	}

	/**
	 * Submit Form
	 *
	 * @param object $request .
	 *
	 * @return WP_Response
	 */
	public function submit_form( $request ) {
		// -----------------------------
		// 1. Verify nonce (CSRF protection)
		// -----------------------------
		$nonce = $request->get_header( 'X-WP-Nonce' );
		if ( ! $nonce || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new WP_REST_Response(
				array(
					'status'  => 'failed',
					'message' => 'Invalid request.',
				),
				403
			);
		}

		// -----------------------------
		// 2. Validate form-entry structure
		// -----------------------------
		$form_entry = $request->get_param( 'form-entry' );

		if ( empty( $form_entry ) || ! is_array( $form_entry ) ) {
			return new WP_REST_Response(
				array(
					'status'  => 'failed',
					'message' => 'Invalid form submission.',
				),
				400
			);
		}

		$form_id = isset( $form_entry['formId'] ) ? absint( $form_entry['formId'] ) : 0;

		if ( ! $form_id || get_post_type( $form_id ) !== 'gutenverse-form' ) {
			return new WP_REST_Response(
				array(
					'status'  => 'failed',
					'message' => 'Invalid form.',
				),
				400
			);
		}

		$form_setting = get_post_meta( $form_id, 'form-data', true );
		if ( empty( $form_setting ) || ! is_array( $form_setting ) ) {
			return new WP_REST_Response(
				array(
					'status'  => 'failed',
					'message' => 'Form configuration error.',
				),
				500
			);
		}

		// -----------------------------
		// 3. Require login if enabled
		// -----------------------------
		if ( ! empty( $form_setting['require_login'] ) && ! is_user_logged_in() ) {
			return new WP_REST_Response(
				array(
					'status'  => 'failed',
					'message' => 'You must login to submit this form.',
				),
				403
			);
		}

		// -----------------------------
		// 4. CAPTCHA validation (safe)
		// -----------------------------
		if ( ! empty( $form_setting['use_captcha'] ) ) {

			$recaptcha = sanitize_text_field( $request->get_param( 'g-recaptcha-response' ) );

			if ( empty( $recaptcha ) ) {
				return new WP_REST_Response(
					array(
						'status'  => 'failed',
						'message' => 'CAPTCHA required.',
					),
					400
				);
			}

			$settings_data = get_option( 'gutenverse-settings', array() );
			$secret        = $settings_data['form_captcha_settings']['captcha_key'] ?? '';

			if ( empty( $secret ) ) {
				return new WP_REST_Response(
					array(
						'status'  => 'failed',
						'message' => 'CAPTCHA configuration error.',
					),
					500
				);
			}

			$response = wp_remote_post(
				'https://www.google.com/recaptcha/api/siteverify',
				array(
					'timeout' => 10,
					'body'    => array(
						'secret'   => $secret,
						'response' => $recaptcha,
						'remoteip' => sanitize_text_field( $_SERVER['REMOTE_ADDR'] ?? '' ),
					),
				)
			);

			if ( is_wp_error( $response ) ) {
				return new WP_REST_Response(
					array(
						'status'  => 'failed',
						'message' => 'CAPTCHA verification failed.',
					),
					400
				);
			}

			$result = json_decode( wp_remote_retrieve_body( $response ), true );

			if ( empty( $result['success'] ) ) {
				return new WP_REST_Response(
					array(
						'status'  => 'failed',
						'message' => 'CAPTCHA failed.',
					),
					400
				);
			}
		}
		if ( isset( $form_setting['user_browser'] ) ) {
			$form_entry['user_browser'] = $form_setting['user_browser'];
		}

		/**
		 * Hook before validation.
		 */
		do_action( 'gutenverse_form_before_validation', $form_entry, $request );

		// -----------------------------
		// 5. Sanitize form data (CRITICAL FIX)
		// -----------------------------
		if ( empty( $form_entry['data'] ) || ! is_array( $form_entry['data'] ) ) {
			return new WP_REST_Response(
				array(
					'status'  => 'failed',
					'message' => 'Invalid form data.',
				),
				400
			);
		}
		$form_data_check = $this->filter_form_params( $form_entry['data'], $request );
		if ( ! $form_data_check['status'] ) {
			return new WP_REST_Response(
				array(
					'status'  => 'failed',
					'message' => $form_data_check['message'],
				),
				400
			);
		}
		$form_data = $form_data_check['data'];
		if ( isset( $form_data ) ) {

			$settings_data = get_option( 'gutenverse-settings', array() );
			$integrations  = array();

			if ( isset( $form_entry['integrations'] ) ) {
				$integrations = is_string( $form_entry['integrations'] ) ? json_decode( $form_entry['integrations'], true ) : $form_entry['integrations'];
			}

			$normalized_integrations = \Gutenverse_Form\Integration::normalize_entry_integrations(
				is_array( $integrations ) ? $integrations : array(),
				$form_setting
			);

			$params = array(
				'form-id'      => $form_id,
				'post-id'      => absint( $form_entry['postId'] ?? 0 ),
				'entry-data'   => $form_data,
				'browser-data' => $this->get_browser_data( $form_entry ),
				'integrations' => $normalized_integrations,
			);

			/**
			 * Hook after validation before store.
			 * This hook can be used to abort submission.
			 */
			$abort = apply_filters( 'gutenverse_form_after_validation_abort', false, $params, $request );
			if ( $abort ) {
				return rest_ensure_response( $abort );
			}

			do_action( 'gutenverse_form_after_validation_before_store', $params, $request );

			$result = array( 'entry_id' => Entries::submit_form_data( $params ) );

			if ( (int) $result['entry_id'] > 0 ) {
				/**
				 * Hook after store.
				 * This is where integrations should run.
				 */
				do_action( 'gutenverse_form_after_store', $result['entry_id'], $params, $form_setting, $request );

				$form_data_settings = get_post_meta( $form_id, 'form-data', true );
				$mail_form_data     = is_array( $form_data_settings ) ? $form_data_settings : $form_setting;
				$entry_id           = $result['entry_id'];

				if ( isset( $settings_data['form'] ) ) {
					if ( isset( $settings_data['form']['confirmation'] ) && true !== ( $mail_form_data['overwrite_default_confirmation'] ?? false ) ) {
						$mail_form_data = $this->merge_form_setting_defaults( $mail_form_data, $settings_data['form']['confirmation'] );
					}

					if ( isset( $settings_data['form']['notification'] ) && true !== ( $mail_form_data['overwrite_default_notification'] ?? false ) ) {
						$mail_form_data = $this->merge_form_setting_defaults( $mail_form_data, $settings_data['form']['notification'] );
					}
				}

				$mail_list = $this->mail_list( $params['entry-data'], $mail_form_data );

				if ( ! empty( $mail_list ) ) {
					$result = ( new Mail() )->send_user_email( $form_id, $mail_form_data, $entry_id, $params, $mail_list );
				}

				if ( ! empty( $mail_form_data['admin_confirm'] ) ) {
					$result = ( new Mail() )->send_admin_email( $form_id, $mail_form_data, $entry_id, $params );
				}
			}
		}

		/**
		 * Hook after response.
		 */
		do_action( 'gutenverse_form_after_response', $result, $form_id, $request );

		return rest_ensure_response( $result );
	}

	/**
	 * Check mail list
	 *
	 * @param array $entry_data .
	 * @param array $form_data .
	 *
	 * @return array.
	 */
	private function mail_list( $entry_data, $form_data ) {
		if ( empty( $form_data['user_confirm'] ) ) {
			return false;
		}

		$mail_rgx   = '/^(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){255,})(?!(?:(?:\x22?\x5C[\x00-\x7E]\x22?)|(?:\x22?[^\x5C\x22]\x22?)){65,}@)(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22))(?:\.(?:(?:[\x21\x23-\x27\x2A\x2B\x2D\x2F-\x39\x3D\x3F\x5E-\x7E]+)|(?:\x22(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|(?:\x5C[\x00-\x7F]))*\x22)))*@(?:(?:(?!.*[^.]{64,})(?:(?:(?:xn--)?[a-z0-9]+(?:-[a-z0-9]+)*\.){1,126}){1,}(?:(?:[a-z][a-z0-9]*)|(?:(?:xn--)[a-z0-9]+))(?:-[a-z0-9]+)*)|(?:\[(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7})|(?:(?!(?:.*[a-f0-9][:\]]){7,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?)))|(?:(?:IPv6:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){5}:)|(?:(?!(?:.*[a-f0-9]:){5,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3}:)?)))?(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))(?:\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))){3}))\]))$/iD';
		$input_name = false;
		$mail_list  = array();

		if ( ! $form_data['auto_select_email'] && isset( $form_data['email_input_name'] ) ) {
			$input_name = $form_data['email_input_name'];
		}

		foreach ( $entry_data as $data ) {
			if ( 'array' === gettype( $data['value'] ) ) {
				$data['value'] = implode( ', ', $data['value'] );
			}
			if ( $input_name ) {
				if ( $input_name === $data['id'] && preg_match( $mail_rgx, $data['value'] ) ) {
					$mail_list[] = $data['value'];
				}
			} elseif ( preg_match( $mail_rgx, $data['value'] ) ) {
				$mail_list[] = $data['value'];
			}
		}

		return $mail_list;
	}

	/**
	 * Merge default form settings without overriding explicit form action values.
	 *
	 * @param array $form_data Form action data.
	 * @param array $defaults Default settings.
	 *
	 * @return array
	 */
	private function merge_form_setting_defaults( $form_data, $defaults ) {
		if ( ! is_array( $defaults ) ) {
			return $form_data;
		}

		foreach ( $defaults as $key => $value ) {
			if ( ! array_key_exists( $key, $form_data ) || '' === $form_data[ $key ] || null === $form_data[ $key ] ) {
				$form_data[ $key ] = $value;
			}
		}

		return $form_data;
	}

	/**
	 * Search Form
	 *
	 * @param object $request .
	 *
	 * @return WP_Rest.
	 */
	public function search_form( $request ) {
		$search = $request->get_param( 'search' );

		$args = array(
			'post_type' => Form::POST_TYPE,
			's'         => $search,
		);

		$query  = new \WP_Query( $args );
		$result = array();

		if ( $query->have_posts() ) {
			while ( $query->have_posts() ) {
				$query->the_post();
				$result[] = array(
					'label' => get_the_title(),
					'value' => get_the_ID(),
				);
			}
		}

		wp_reset_postdata();

		return $result;
	}

	/**
	 * Get Meta Keys & ACF Fields
	 *
	 * @param object $request .
	 *
	 * @return WP_Rest.
	 */
	public function get_meta_keys( $request ) {
		global $wpdb;

		// Get all meta keys that do not start with underscore .
		$keys = $wpdb->get_col(
			"
			SELECT meta_key
			FROM $wpdb->postmeta
			WHERE meta_key NOT LIKE '\_%'
			GROUP BY meta_key
			ORDER BY meta_key ASC
		"
		);

		$options = array();
		foreach ( $keys as $key ) {
			$options[] = array(
				'label' => $key,
				'value' => $key,
			);
		}

		if ( function_exists( 'acf_get_field_groups' ) ) {
			$groups = acf_get_field_groups();
			if ( ! empty( $groups ) ) {
				foreach ( $groups as $group ) {
					$fields = acf_get_fields( $group['key'] );
					if ( ! empty( $fields ) ) {
						foreach ( $fields as $field ) {
							$exists = false;
							foreach ( $options as &$option ) {
								if ( $option['value'] === $field['name'] ) {
									$exists          = true;
									$option['label'] = $field['label'] . ' (' . $field['name'] . ')';
									break;
								}
							}

							if ( ! $exists ) {
								$options[] = array(
									'label' => $field['label'] . ' (' . $field['name'] . ')',
									'value' => $field['name'],
								);
							}
						}
					}
				}
			}
		}

		return rest_ensure_response( $options );
	}

	/**
	 * Fetch Menu API
	 */
	public function menu() {
		$menus = wp_get_nav_menus();
		$data  = array();

		foreach ( $menus as $menu ) {
			$data[] = array(
				'label' => $menu->name,
				'value' => $menu->term_id,
			);
		}

		return $data;
	}

	/**
	 * Render WP Menu
	 *
	 * @param object $request object.
	 *
	 * @return void|string|false
	 */
	public function menu_render( $request ) {
		$menu_id = $request->get_param( 'menu' );

		return gutenverse_get_menu( $menu_id );
	}

	/**
	 * Search Meta
	 *
	 * @param object $request .
	 *
	 * @return WP_Rest.
	 */
	public function form_init( $request ) {
		$form_id   = $request->get_param( 'form_id' );
		$post_type = get_post_type( (int) $form_id );
		$result    = array(
			'require_login' => false,
			'logged_in'     => is_user_logged_in(),
		);

		if ( Form::POST_TYPE === $post_type ) {
			$data                          = get_post_meta( (int) $form_id, 'form-data', true );
			$result['require_login']       = $data['require_login'];
			$result['form_success_notice'] = $data['form_success_notice'];
			$result['form_error_notice']   = $data['form_error_notice'];
		}

		return $result;
	}
	/**
	 * Save Integration Settings
	 *
	 * @param object $request .
	 *
	 * @return WP_Rest_Response.
	 */
	public function save_integration( $request ) {
		$delegated = apply_filters( 'gutenverse_form_save_integration_response', null, $request, $this );
		if ( $delegated instanceof \WP_REST_Response ) {
			return $delegated;
		}

		$params           = $request->get_params();
		$allowed_services = array_column( Integration::get_services(), 'service_name' );

		if ( isset( $params['key'] ) && isset( $params['value'] ) ) {
			$key   = sanitize_key( $params['key'] );
			$value = rest_sanitize_boolean( $params['value'] );

			if ( in_array( $key, $allowed_services, true ) ) {
				$options         = get_option( 'gutenverse_form_integrations', array() );
				$options[ $key ] = $value;
				update_option( 'gutenverse_form_integrations', $options );

				return new WP_REST_Response( array( 'success' => true ), 200 );
			}
		}
		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Integrations are available in Gutenverse Pro.', 'gutenverse-form' ),
				'code'    => 'gutenverse_form_integration_pro_required',
			),
			403
		);
	}

	/**
	 * Save Integration Settings
	 *
	 * @param WP_REST_Request $request .
	 *
	 * @return WP_REST_Response
	 */
	public function save_integration_settings( $request ) {
		$delegated = apply_filters( 'gutenverse_form_save_integration_settings_response', null, $request, $this );
		if ( $delegated instanceof \WP_REST_Response ) {
			return $delegated;
		}

		$params           = $request->get_params();
		$allowed_services = array_column( Integration::get_services(), 'service_name' );

		if ( isset( $params['service'] ) && isset( $params['settings'] ) ) {
			$service = sanitize_key( $params['service'] );

			if ( in_array( $service, $allowed_services, true ) && is_array( $params['settings'] ) ) {
				$raw_settings = $this->merge_sensitive_integration_settings(
					$service,
					get_option( "gutenverse_form_{$service}_settings", array() ),
					$params['settings']
				);
				$settings     = $this->sanitize_integration_settings( $service, $raw_settings );
				update_option( "gutenverse_form_{$service}_settings", $settings );

				return new WP_REST_Response( array( 'success' => true ), 200 );
			}
		}

		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Integrations are available in Gutenverse Pro.', 'gutenverse-form' ),
				'code'    => 'gutenverse_form_integration_pro_required',
			),
			403
		);
	}

	/**
	 * Save or clear a secret for a form builder block integration action.
	 *
	 * @param \WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function save_block_secret( $request ) {
		$delegated = apply_filters( 'gutenverse_form_save_block_secret_response', null, $request, $this );
		if ( $delegated instanceof \WP_REST_Response ) {
			return $delegated;
		}

		$params     = $request->get_params();
		$post_id    = isset( $params['postId'] ) ? absint( $params['postId'] ) : 0;
		$element_id = isset( $params['elementId'] ) ? sanitize_key( $params['elementId'] ) : '';
		$action_key = isset( $params['actionKey'] ) ? preg_replace( '/[^A-Za-z0-9_\-]/', '', (string) $params['actionKey'] ) : '';
		$field_key  = isset( $params['fieldKey'] ) ? preg_replace( '/[^A-Za-z0-9_\-]/', '', (string) $params['fieldKey'] ) : '';
		$value      = isset( $params['value'] ) ? (string) $params['value'] : '';
		$service    = isset( $params['service'] ) ? sanitize_key( $params['service'] ) : '';

		if ( ! $post_id || empty( $element_id ) || empty( $action_key ) || empty( $field_key ) || empty( $service ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'Missing secret storage context.', 'gutenverse-form' ),
				),
				400
			);
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'Permission denied.', 'gutenverse-form' ),
				),
				403
			);
		}

		$integration      = new Integration();
		$allowed_services = array_column( Integration::get_services(), 'service_name' );
		if ( ! in_array( $service, $allowed_services, true ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'Invalid integration service.', 'gutenverse-form' ),
				),
				400
			);
		}

		$sensitive_fields = $integration->get_sensitive_service_fields( $service );
		if ( ! in_array( $field_key, $sensitive_fields, true ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'This field is not configured for server-side secret storage.', 'gutenverse-form' ),
				),
				400
			);
		}

		$secret_map = get_post_meta( $post_id, 'gutenverse_form_block_secrets', true );
		$secret_map = is_array( $secret_map ) ? $secret_map : array();

		if ( ! isset( $secret_map[ $element_id ] ) || ! is_array( $secret_map[ $element_id ] ) ) {
			$secret_map[ $element_id ] = array();
		}

		if ( ! isset( $secret_map[ $element_id ][ $action_key ] ) || ! is_array( $secret_map[ $element_id ][ $action_key ] ) ) {
			$secret_map[ $element_id ][ $action_key ] = array();
		}

		if ( '' === trim( $value ) ) {
			unset( $secret_map[ $element_id ][ $action_key ][ $field_key ] );

			if ( empty( $secret_map[ $element_id ][ $action_key ] ) ) {
				unset( $secret_map[ $element_id ][ $action_key ] );
			}

			if ( empty( $secret_map[ $element_id ] ) ) {
				unset( $secret_map[ $element_id ] );
			}
		} else {
			$secret_map[ $element_id ][ $action_key ][ $field_key ] = $value;
		}

		update_post_meta( $post_id, 'gutenverse_form_block_secrets', $secret_map );

		return new WP_REST_Response(
			array(
				'success' => false,
				'message' => esc_html__( 'Integrations are available in Gutenverse Pro.', 'gutenverse-form' ),
				'code'    => 'gutenverse_form_integration_pro_required',
			),
			403
		);
	}

	/**
	 * Sanitize saved integration settings.
	 *
	 * @param string $service  Service name.
	 * @param array  $settings Raw settings.
	 *
	 * @return array
	 */
	private function sanitize_integration_settings( $service, $settings ) {
		$sanitized                   = array();
		$sanitized['apply_globally'] = rest_sanitize_boolean( $settings['apply_globally'] ?? false );

		switch ( $service ) {
			case 'whatsapp':
				if ( isset( $settings['business_number_id'] ) ) {
					$sanitized['business_number_id'] = preg_replace( '/[^0-9]/', '', (string) $settings['business_number_id'] );
				}

				if ( isset( $settings['access_token'] ) ) {
					$sanitized['access_token'] = sanitize_text_field( (string) $settings['access_token'] );
				}

				if ( isset( $settings['recipient'] ) ) {
					$sanitized['recipient'] = sanitize_text_field( (string) $settings['recipient'] );
				}

				if ( isset( $settings['template_json'] ) ) {
					$sanitized['template_json'] = $this->sanitize_json_setting( $settings['template_json'] );
				}
				break;

			case 'discord':
				if ( isset( $settings['webhookUrl'] ) ) {
					$sanitized['webhookUrl'] = $this->sanitize_allowed_url( $settings['webhookUrl'], array( 'discord.com', 'discordapp.com', 'canary.discord.com', 'ptb.discord.com' ) );
				}

				if ( isset( $settings['username'] ) ) {
					$sanitized['username'] = sanitize_text_field( (string) $settings['username'] );
				}

				if ( isset( $settings['avatar_url'] ) ) {
					$sanitized['avatar_url'] = esc_url_raw( (string) $settings['avatar_url'], array( 'http', 'https' ) );
				}

				if ( isset( $settings['content'] ) ) {
					$sanitized['content'] = sanitize_textarea_field( (string) $settings['content'] );
				}
				break;

			case 'webhook':
				if ( isset( $settings['webhookUrl'] ) ) {
					$sanitized['webhookUrl'] = $this->sanitize_allowed_url( $settings['webhookUrl'] );
				}

				if ( isset( $settings['webhook_url'] ) && empty( $sanitized['webhookUrl'] ) ) {
					$sanitized['webhookUrl'] = $this->sanitize_allowed_url( $settings['webhook_url'] );
				}

				if ( isset( $settings['signingSecret'] ) ) {
					$sanitized['signingSecret'] = sanitize_text_field( (string) $settings['signingSecret'] );
				}

				if ( isset( $settings['signing_secret'] ) && empty( $sanitized['signingSecret'] ) ) {
					$sanitized['signingSecret'] = sanitize_text_field( (string) $settings['signing_secret'] );
				}

				if ( isset( $settings['content'] ) ) {
					$sanitized['content'] = sanitize_textarea_field( (string) $settings['content'] );
				}
				break;

			case 'mailchimp':
				if ( isset( $settings['api_key'] ) ) {
					$sanitized['api_key'] = sanitize_text_field( (string) $settings['api_key'] );
				}

				if ( isset( $settings['list_id'] ) ) {
					$sanitized['list_id'] = sanitize_text_field( (string) $settings['list_id'] );
				}

				if ( isset( $settings['email'] ) ) {
					$sanitized['email'] = sanitize_text_field( (string) $settings['email'] );
				}

				if ( isset( $settings['name'] ) ) {
					$sanitized['name'] = sanitize_text_field( (string) $settings['name'] );
				}

				if ( isset( $settings['status'] ) ) {
					$sanitized['status'] = sanitize_key( (string) $settings['status'] );
				}

				if ( isset( $settings['status_if_new'] ) ) {
					$sanitized['status_if_new'] = sanitize_key( (string) $settings['status_if_new'] );
				}

				if ( isset( $settings['tags'] ) ) {
					$sanitized['tags'] = $this->sanitize_json_setting( $settings['tags'] );
				}

				if ( isset( $settings['merge_fields'] ) ) {
					$sanitized['merge_fields'] = $this->sanitize_json_object_setting( $settings['merge_fields'] );
				}
				break;

			case 'mailer':
				if ( isset( $settings['api_key'] ) ) {
					$sanitized['api_key'] = sanitize_text_field( (string) $settings['api_key'] );
				}

				if ( isset( $settings['email'] ) ) {
					$sanitized['email'] = sanitize_text_field( (string) $settings['email'] );
				}

				if ( isset( $settings['name'] ) ) {
					$sanitized['name'] = sanitize_text_field( (string) $settings['name'] );
				}

				if ( isset( $settings['groups'] ) ) {
					$sanitized['groups'] = $this->sanitize_json_setting( $settings['groups'] );
				}

				if ( isset( $settings['status'] ) ) {
					$sanitized['status'] = sanitize_key( (string) $settings['status'] );
				}
				break;

			case 'google_sheets':
				if ( isset( $settings['endpointUrl'] ) ) {
					$sanitized['endpointUrl'] = esc_url_raw( (string) $settings['endpointUrl'] );
				}

				if ( isset( $settings['endpoint_url'] ) && empty( $sanitized['endpointUrl'] ) ) {
					$sanitized['endpointUrl'] = esc_url_raw( (string) $settings['endpoint_url'] );
				}

				if ( isset( $settings['accessKey'] ) ) {
					$sanitized['accessKey'] = sanitize_text_field( (string) $settings['accessKey'] );
				}

				if ( isset( $settings['access_key'] ) && empty( $sanitized['accessKey'] ) ) {
					$sanitized['accessKey'] = sanitize_text_field( (string) $settings['access_key'] );
				}

				if ( isset( $settings['secretKey'] ) ) {
					$sanitized['secretKey'] = trim( (string) $settings['secretKey'] );
				}

				if ( isset( $settings['secret_key'] ) && empty( $sanitized['secretKey'] ) ) {
					$sanitized['secretKey'] = trim( (string) $settings['secret_key'] );
				}

				if ( isset( $settings['columnsTemplate'] ) ) {
					$sanitized['columnsTemplate'] = sanitize_textarea_field( (string) $settings['columnsTemplate'] );
				}

				if ( isset( $settings['columns_template'] ) && empty( $sanitized['columnsTemplate'] ) ) {
					$sanitized['columnsTemplate'] = sanitize_textarea_field( (string) $settings['columns_template'] );
				}
				break;

			case 'drip':
				if ( isset( $settings['api_key'] ) ) {
					$sanitized['api_key'] = sanitize_text_field( (string) $settings['api_key'] );
				}

				if ( isset( $settings['account_id'] ) ) {
					$sanitized['account_id'] = preg_replace( '/[^0-9]/', '', (string) $settings['account_id'] );
				}

				if ( isset( $settings['email'] ) ) {
					$sanitized['email'] = sanitize_text_field( (string) $settings['email'] );
				}

				if ( isset( $settings['first_name'] ) ) {
					$sanitized['first_name'] = sanitize_text_field( (string) $settings['first_name'] );
				}

				if ( isset( $settings['last_name'] ) ) {
					$sanitized['last_name'] = sanitize_text_field( (string) $settings['last_name'] );
				}

				if ( isset( $settings['tags'] ) ) {
					$sanitized['tags'] = $this->sanitize_json_setting( $settings['tags'] );
				}

				if ( isset( $settings['custom_fields'] ) ) {
					$sanitized['custom_fields'] = $this->sanitize_json_object_setting( $settings['custom_fields'] );
				}

				if ( isset( $settings['time_zone'] ) ) {
					$sanitized['time_zone'] = sanitize_text_field( (string) $settings['time_zone'] );
				}

				if ( isset( $settings['double_optin'] ) ) {
					$sanitized['double_optin'] = sanitize_text_field( (string) $settings['double_optin'] );
				}

				if ( isset( $settings['prospect'] ) ) {
					$sanitized['prospect'] = sanitize_text_field( (string) $settings['prospect'] );
				}

				if ( isset( $settings['eu_consent'] ) ) {
					$sanitized['eu_consent'] = sanitize_key( (string) $settings['eu_consent'] );
				}

				if ( isset( $settings['eu_consent_message'] ) ) {
					$sanitized['eu_consent_message'] = sanitize_text_field( (string) $settings['eu_consent_message'] );
				}
				break;

			case 'convert_kit':
				if ( isset( $settings['api_key'] ) ) {
					$sanitized['api_key'] = sanitize_text_field( (string) $settings['api_key'] );
				}

				if ( isset( $settings['email'] ) ) {
					$sanitized['email'] = sanitize_text_field( (string) $settings['email'] );
				}

				if ( isset( $settings['first_name'] ) ) {
					$sanitized['first_name'] = sanitize_text_field( (string) $settings['first_name'] );
				}

				if ( isset( $settings['form_id'] ) ) {
					$sanitized['form_id'] = sanitize_text_field( (string) $settings['form_id'] );
				}

				if ( isset( $settings['tag_ids'] ) ) {
					$sanitized['tag_ids'] = $this->sanitize_json_setting( $settings['tag_ids'] );
				}
				break;

			case 'active_campaign':
				if ( isset( $settings['api_url'] ) ) {
					$sanitized['api_url'] = $this->sanitize_allowed_url( $settings['api_url'] );
				}

				if ( isset( $settings['api_key'] ) ) {
					$sanitized['api_key'] = sanitize_text_field( (string) $settings['api_key'] );
				}

				if ( isset( $settings['list_id'] ) ) {
					$sanitized['list_id'] = preg_replace( '/[^0-9]/', '', (string) $settings['list_id'] );
				}

				if ( isset( $settings['email'] ) ) {
					$sanitized['email'] = sanitize_text_field( (string) $settings['email'] );
				}

				if ( isset( $settings['first_name'] ) ) {
					$sanitized['first_name'] = sanitize_text_field( (string) $settings['first_name'] );
				}

				if ( isset( $settings['last_name'] ) ) {
					$sanitized['last_name'] = sanitize_text_field( (string) $settings['last_name'] );
				}

				if ( isset( $settings['phone'] ) ) {
					$sanitized['phone'] = sanitize_text_field( (string) $settings['phone'] );
				}

				if ( isset( $settings['tag_ids'] ) ) {
					$sanitized['tag_ids'] = $this->sanitize_json_setting( $settings['tag_ids'] );
				}

				if ( isset( $settings['field_values'] ) ) {
					$sanitized['field_values'] = $this->sanitize_json_setting( $settings['field_values'] );
				}

				if ( isset( $settings['automation_id'] ) ) {
					$sanitized['automation_id'] = preg_replace( '/[^0-9]/', '', (string) $settings['automation_id'] );
				}
				break;

			default:
				$sanitized = array_merge( $sanitized, $this->sanitize_recursive_settings( $settings ) );
				break;
		}

		return array_filter(
			$sanitized,
			function ( $value, $key ) {
				return 'apply_globally' === $key || '' !== $value || false !== $value;
			},
			ARRAY_FILTER_USE_BOTH
		);
	}

	/**
	 * Merge submitted settings with already saved sensitive values.
	 *
	 * Sensitive values are kept server-side unless the user explicitly changes
	 * or clears them.
	 *
	 * @param string $service           Service name.
	 * @param array  $existing_settings Existing saved settings.
	 * @param array  $submitted_settings Submitted settings.
	 *
	 * @return array
	 */
	private function merge_sensitive_integration_settings( $service, $existing_settings, $submitted_settings ) {
		$existing_settings  = is_array( $existing_settings ) ? $existing_settings : array();
		$submitted_settings = is_array( $submitted_settings ) ? $submitted_settings : array();
		$instance           = ( new Integration() )->get_service_instance( $service );
		$fields             = ( $instance && method_exists( $instance, 'get_fields' ) ) ? $instance->get_fields() : array();
		$merged             = array_merge( $existing_settings, $submitted_settings );

		foreach ( $fields as $key => $field ) {
			if ( empty( $field['sensitive'] ) ) {
				continue;
			}

			if ( ! array_key_exists( $key, $submitted_settings ) ) {
				if ( array_key_exists( $key, $existing_settings ) ) {
					$merged[ $key ] = $existing_settings[ $key ];
				}
				continue;
			}

			if ( '__gutenverse_clear_secret__' === $submitted_settings[ $key ] ) {
				$merged[ $key ] = '';
				continue;
			}

			if ( '' === (string) $submitted_settings[ $key ] && array_key_exists( $key, $existing_settings ) ) {
				$merged[ $key ] = $existing_settings[ $key ];
			}
		}

		return $merged;
	}

	/**
	 * Sanitize arbitrary nested settings while keeping structure.
	 *
	 * @param array $settings Raw settings.
	 *
	 * @return array
	 */
	private function sanitize_recursive_settings( $settings ) {
		$sanitized = array();

		foreach ( $settings as $key => $value ) {
			$key = sanitize_key( $key );

			if ( is_array( $value ) ) {
				$sanitized[ $key ] = $this->sanitize_recursive_settings( $value );
			} elseif ( is_bool( $value ) ) {
				$sanitized[ $key ] = rest_sanitize_boolean( $value );
			} else {
				$sanitized[ $key ] = sanitize_text_field( (string) $value );
			}
		}

		return $sanitized;
	}

	/**
	 * Sanitize a JSON textarea setting without stripping its structure.
	 *
	 * @param mixed $value Raw JSON value.
	 *
	 * @return string
	 */
	private function sanitize_json_setting( $value ) {
		if ( ! is_string( $value ) ) {
			return '';
		}

		$decoded = json_decode( wp_unslash( $value ), true );
		if ( JSON_ERROR_NONE !== json_last_error() || ! is_array( $decoded ) ) {
			return '';
		}

		return wp_json_encode( $decoded );
	}

	/**
	 * Sanitize a JSON textarea setting that must decode to an object.
	 *
	 * @param mixed $value Raw JSON value.
	 *
	 * @return string
	 */
	private function sanitize_json_object_setting( $value ) {
		if ( ! is_string( $value ) ) {
			return '';
		}

		$decoded = json_decode( wp_unslash( $value ), true );
		if ( JSON_ERROR_NONE !== json_last_error() || ! is_array( $decoded ) || array_values( $decoded ) === $decoded ) {
			return '';
		}

		return wp_json_encode( $decoded );
	}

	/**
	 * Sanitize a URL and optionally restrict its host.
	 *
	 * @param mixed $value         Raw URL.
	 * @param array $allowed_hosts Allowed hosts.
	 *
	 * @return string
	 */
	private function sanitize_allowed_url( $value, $allowed_hosts = array() ) {
		$url = esc_url_raw( (string) $value, array( 'https' ) );
		if ( empty( $url ) ) {
			return '';
		}

		if ( empty( $allowed_hosts ) ) {
			return $url;
		}

		$host = wp_parse_url( $url, PHP_URL_HOST );
		if ( empty( $host ) ) {
			return '';
		}

		$host = strtolower( $host );
		foreach ( $allowed_hosts as $allowed_host ) {
			$allowed_host = strtolower( $allowed_host );
			if ( $host === $allowed_host || substr( $host, -strlen( '.' . $allowed_host ) ) === '.' . $allowed_host ) {
				return $url;
			}
		}

		return '';
	}
}
