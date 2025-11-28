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

		/** ----------------------------------------------------------------
		 * Frontend/Global Routes
		 */
		register_rest_route(
			self::ENDPOINT,
			'form/init',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'form_init' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			self::ENDPOINT,
			'form/submit',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'submit_form' ),
				'permission_callback' => '__return_true',
			)
		);
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
		$posts      = get_posts(
			array(
				'post_type'  => Entries::POST_TYPE,
				'meta_query' => array( //phpcs:ignore
					array(
						'key'     => 'form-id',
						'value'   => $form_id,
						'compare' => '===',
					),
				),
			)
		);

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
		$id          = $request->get_param( 'id' );
		$form_action = Form::delete_form_action( $id );
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
		$id          = $request->get_param( 'id' );
		$form_action = Form::clone_form_action( $id );
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
				'user_confirm'                   => '',
				'auto_select_email'              => '',
				'email_input_name'               => '',
				'user_email_subject'             => '',
				'user_email_form'                => '',
				'user_email_reply_to'            => '',
				'user_email_body'                => '',
				'admin_confirm'                  => '',
				'admin_email_subject'            => '',
				'admin_email_to'                 => '',
				'admin_email_from'               => '',
				'admin_email_reply_to'           => '',
				'admin_note'                     => '',
				'overwrite_default_confirmation' => '',
				'overwrite_default_notification' => '',
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
						$filtered_data[] = array(
							'id'    => sanitize_key( $data['id'] ),
							'value' => rest_sanitize_array( $data[ $value_key ] ),
						);
						break;
					case 'file':
						$id         = sanitize_key( $data['id'] );
						$files      = $request->get_file_params();
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

							if ( $file_rules['allowed_extensions'] && 0 < count( $file_rules['allowed_extensions'] ) ) {
								$file_ext    = strtolower( pathinfo( $file_info['name'], PATHINFO_EXTENSION ) );
								$allowed_ext = array_column( $file_rules['allowed_extensions'], 'value' );
								if ( ! in_array( $file_ext, $allowed_ext, true ) ) {
									array_push( $error, $file_info['name'] . '\'s extensions not allowed. Allowed: ' . implode( ', ', $allowed_ext ) );
								}
							}
							if ( count( $error ) > 0 ) {
								break;
							}
							$uploaded = wp_handle_upload( $file_info, array( 'test_form' => false ) );
							if ( ! isset( $uploaded['error'] ) ) {
								$file_url = $uploaded['url'];   // ✅ public URL

								// Keep a list of uploaded files
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
		$recaptcha     = $request->get_param( 'g-recaptcha-response' ) ? $request->get_param( 'g-recaptcha-response' ) : false;
		$settings_data = get_option( 'gutenverse-settings', array() );
		$form_entry    = $request->get_param( 'form-entry' );
		$form_id       = $form_entry['formId'];
		$form_setting  = get_post_meta( (int) $form_id, 'form-data', true );
		if ( $form_setting['use_captcha'] && ! empty( $recaptcha ) ) {
			$secret = $settings_data['form_captcha_settings']['captcha_key'];
			$verify = wp_remote_post(
				'https://www.google.com/recaptcha/api/siteverify',
				array(
					'body' => array(
						'secret'   => $secret,
						'response' => $recaptcha,
						'remoteip' => $_SERVER['REMOTE_ADDR'],
					),
				)
			);

			$result = json_decode( wp_remote_retrieve_body( $verify ), true );
			if ( empty( $result['success'] ) ) {
				$response = rest_ensure_response(
					array(
						'error'   => 'Bad Request',
						'message' => 'CAPTCHA failed! Please Try Again!',
					)
				);
				$response->set_status( 400 );
				return $response;
			}
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
		$is_login  = is_user_logged_in();
		if ( $form_setting['require_login'] ) {
			if ( ! $is_login ) {
				$response = rest_ensure_response(
					array(
						'error'   => 'Bad Request',
						'message' => 'Your Must Login To Submit This Form',
					)
				);
				$response->set_status( 400 );
				return $response;
			}
		}
		if ( isset( $form_data ) ) {
			$form_id    = (int) $form_entry['formId'];
			$post_id    = (int) $form_entry['postId'];
			$form_entry = array(
				'form-id'      => $form_id,
				'post-id'      => $post_id,
				'entry-data'   => $form_data,
				'browser-data' => $this->get_browser_data( $form_entry ),
			);

			$params = wp_parse_args(
				$form_entry,
				array(
					'form-id'      => 0,
					'post-id'      => 0,
					'entry-data'   => array(),
					'browser-data' => array(),
				)
			);

			$result = array( 'entry_id' => Entries::submit_form_data( $params ) );

			if ( (int) $result['entry_id'] > 0 ) {
				$form_data = get_post_meta( $form_id, 'form-data', true );
				$entry_id  = $result['entry_id'];

				if ( isset( $settings_data['form'] ) ) {
					if ( isset( $settings['form']['confirmation'] ) && true !== $form_data['overwrite_default_confirmation'] ) {
						$form_data = array_merge( $form_data, $settings['form']['confirmation'] );
					}

					if ( isset( $settings['form']['notification'] ) && true !== $form_data['overwrite_default_notification'] ) {
						$form_data = array_merge( $form_data, $settings['form']['notification'] );
					}
				}

				$mail_list = $this->mail_list( $form_entry['entry-data'], $form_data );

				if ( ! empty( $mail_list ) ) {
					$result = ( new Mail() )->send_user_email( $form_id, $form_data, $entry_id, $form_entry, $mail_list );
				}

				if ( ! empty( $form_data['admin_confirm'] ) ) {
					$result = ( new Mail() )->send_admin_email( $form_id, $form_data, $entry_id, $form_entry );
				}
			}
		}

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
}
