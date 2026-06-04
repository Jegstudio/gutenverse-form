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
			'entries',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_entries' ),
				'permission_callback' => 'gutenverse_permission_check_admin',
			)
		);

			register_rest_route(
				self::ENDPOINT,
				'entries/export',
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'export_entries' ),
					'permission_callback' => 'gutenverse_permission_check_admin',
				)
			);

			register_rest_route(
				self::ENDPOINT,
				'entries/(?P<id>\d+)',
				array(
					'methods'             => 'DELETE',
					'callback'            => array( $this, 'delete_entry' ),
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
			'integration/settings',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_integration_settings' ),
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
	 * Get entry list data.
	 *
	 * @param \WP_REST_Request $request REST request.
	 *
	 * @return WP_REST_Response
	 */
	public function get_entries( $request ) {
		return rest_ensure_response( Entries::get_entries_for_admin( $request ) );
	}

	/**
	 * Export entry list data.
	 *
	 * @param \WP_REST_Request $request REST request.
	 *
	 * @return \WP_Error|void
	 */
	public function export_entries( $request ) {
		return Entries::export_entries_for_admin( $request );
	}

	/**
	 * Delete entry list data.
	 *
	 * @param \WP_REST_Request $request REST request.
	 *
	 * @return WP_REST_Response|\WP_Error
	 */
	public function delete_entry( $request ) {
		return rest_ensure_response( Entries::delete_entry_for_admin( $request ) );
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
				'entry_title_type'               => '',
				'entry_title_static_text'        => '',
				'entry_title_input_name'         => '',
				'entry_title_custom_format'      => '',
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
	 * Get submitted form builder integration source.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param array $form_entry Form entry data.
	 *
	 * @return array
	 */
	private function get_submission_integration_source( $form_entry ) {
		if ( ! isset( $form_entry['integrationSource'] ) ) {
			return array();
		}

		$integration_source = $form_entry['integrationSource'];

		if ( is_string( $integration_source ) ) {
			$integration_source = json_decode( $integration_source, true );
		}

		return is_array( $integration_source ) ? $integration_source : array();
	}

	/**
	 * Normalize a form builder form reference.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param mixed $form_ref Form reference.
	 *
	 * @return int
	 */
	private function normalize_form_builder_form_id( $form_ref ) {
		if ( is_array( $form_ref ) && isset( $form_ref['value'] ) ) {
			return absint( $form_ref['value'] );
		}

		if ( is_scalar( $form_ref ) ) {
			return absint( $form_ref );
		}

		return 0;
	}

	/**
	 * Find a matching form builder block in parsed block data.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param array  $blocks     Parsed blocks.
	 * @param int    $form_id    Assigned Gutenverse form ID.
	 * @param string $element_id Form builder block element ID.
	 *
	 * @return array|null
	 */
	private function find_submission_form_builder_block( $blocks, $form_id, $element_id ) {
		if ( empty( $blocks ) || ! is_array( $blocks ) ) {
			return null;
		}

		foreach ( $blocks as $block ) {
			if ( isset( $block['blockName'] ) && 'gutenverse/form-builder' === $block['blockName'] ) {
				$attrs            = isset( $block['attrs'] ) && is_array( $block['attrs'] ) ? $block['attrs'] : array();
				$block_element_id = isset( $attrs['elementId'] ) && is_scalar( $attrs['elementId'] ) ? sanitize_key( $attrs['elementId'] ) : '';

				if (
					$block_element_id === $element_id &&
					$this->normalize_form_builder_form_id( $attrs['formId'] ?? null ) === absint( $form_id )
				) {
					return $block;
				}
			}

			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$found = $this->find_submission_form_builder_block( $block['innerBlocks'], $form_id, $element_id );

				if ( $found ) {
					return $found;
				}
			}
		}

		return null;
	}

	/**
	 * Get the saved form builder block used by this submission.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param array $form_entry Form entry data.
	 * @param int   $form_id    Form ID.
	 *
	 * @return array|null
	 */
	private function get_submission_form_builder_block( $form_entry, $form_id ) {
		$post_id            = absint( $form_entry['postId'] ?? 0 );
		$integration_source = $this->get_submission_integration_source( $form_entry );
		$source_type        = isset( $integration_source['type'] ) && is_scalar( $integration_source['type'] ) ? sanitize_key( $integration_source['type'] ) : '';
		$element_id         = isset( $integration_source['elementId'] ) && is_scalar( $integration_source['elementId'] ) ? sanitize_key( $integration_source['elementId'] ) : '';

		if ( 'block' !== $source_type || ! $post_id || empty( $element_id ) ) {
			return null;
		}

		$post = get_post( $post_id );
		if ( ! $post || empty( $post->post_content ) ) {
			return null;
		}

		return $this->find_submission_form_builder_block( parse_blocks( $post->post_content ), $form_id, $element_id );
	}

	/**
	 * Map saved input blocks to submitted field types.
	 *
	 * @since 3.0.0-performance
	 *
	 * @return array
	 */
	private function get_form_input_block_type_map() {
		$type_map = array(
			'gutenverse/form-input-text'        => 'text',
			'gutenverse/form-input-email'       => 'email',
			'gutenverse/form-input-textarea'    => 'textarea',
			'gutenverse/form-input-number'      => 'number',
			'gutenverse/form-input-telp'        => 'telp',
			'gutenverse/form-input-date'        => 'date',
			'gutenverse/form-input-select'      => 'select',
			'gutenverse/form-input-radio'       => 'radio',
			'gutenverse/form-input-checkbox'    => 'checkbox',
			'gutenverse/form-input-multiselect' => 'multiselect',
			'gutenverse/form-input-switch'      => 'switch',
			'gutenverse/form-input-gdpr'        => 'gdpr',
		);

		return apply_filters( 'gutenverse_form_public_submit_block_type_map', $type_map );
	}

	/**
	 * Map saved input blocks to default input names.
	 *
	 * @since 3.0.0-performance
	 *
	 * @return array
	 */
	private function get_form_input_block_default_name_map() {
		$default_name_map = array(
			'gutenverse/form-input-text'        => 'input-text-name',
			'gutenverse/form-input-email'       => 'input-email',
			'gutenverse/form-input-textarea'    => 'input-textarea',
			'gutenverse/form-input-number'      => 'input-number',
			'gutenverse/form-input-telp'        => 'input-phone',
			'gutenverse/form-input-date'        => 'input-date',
			'gutenverse/form-input-select'      => 'input-select',
			'gutenverse/form-input-radio'       => 'input-radio',
			'gutenverse/form-input-checkbox'    => 'input-checkbox',
			'gutenverse/form-input-multiselect' => 'input-multi-select',
			'gutenverse/form-input-switch'      => 'input-switch',
			'gutenverse/form-input-gdpr'        => 'input-gdpr',
		);

		return apply_filters( 'gutenverse_form_public_submit_block_default_name_map', $default_name_map );
	}

	/**
	 * Merge registered block defaults into saved attributes.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param string $block_name Block name.
	 * @param array  $attrs      Saved block attributes.
	 *
	 * @return array
	 */
	private function get_form_block_attrs_with_defaults( $block_name, $attrs ) {
		if ( ! class_exists( '\WP_Block_Type_Registry' ) ) {
			return $attrs;
		}

		$block_type = \WP_Block_Type_Registry::get_instance()->get_registered( $block_name );

		if ( empty( $block_type ) || empty( $block_type->attributes ) || ! is_array( $block_type->attributes ) ) {
			return $attrs;
		}

		foreach ( $block_type->attributes as $key => $definition ) {
			if ( is_array( $definition ) && array_key_exists( 'default', $definition ) && ! array_key_exists( $key, $attrs ) ) {
				$attrs[ $key ] = $definition['default'];
			}
		}

		return $attrs;
	}

	/**
	 * Normalize saved option values for schema allowlists.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param array $options Saved option definitions.
	 *
	 * @return array
	 */
	private function normalize_form_schema_options( $options ) {
		$values = array();

		if ( ! is_array( $options ) ) {
			return $values;
		}

		foreach ( $options as $option ) {
			if ( is_array( $option ) && isset( $option['value'] ) && is_scalar( $option['value'] ) ) {
				$value = sanitize_text_field( (string) $option['value'] );
			} elseif ( is_scalar( $option ) ) {
				$value = sanitize_text_field( (string) $option );
			} else {
				continue;
			}

			if ( '' !== $value ) {
				$values[] = $value;
			}
		}

		return array_values( array_unique( $values ) );
	}

	/**
	 * Get saved option values for a form field.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param array  $attrs Field block attributes.
	 * @param string $type  Field type.
	 *
	 * @return array
	 */
	private function get_form_field_options( $attrs, $type ) {
		switch ( $type ) {
			case 'select':
			case 'multiselect':
				return $this->normalize_form_schema_options( $attrs['selectOptions'] ?? array() );
			case 'radio':
				return $this->normalize_form_schema_options( $attrs['radioOptions'] ?? array() );
			case 'checkbox':
				return $this->normalize_form_schema_options( $attrs['checkboxOptions'] ?? array() );
			case 'gdpr':
				return $this->normalize_form_schema_options(
					array(
						$attrs['gdprFormValue'] ?? '',
						$attrs['gdprUncheckedFormValue'] ?? '',
					)
				);
			default:
				return array();
		}
	}

	/**
	 * Build a field schema item from saved block attributes.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param string $field_id   Field ID.
	 * @param string $field_type Field type.
	 * @param string $block_name Block name.
	 * @param array  $attrs      Field block attributes.
	 *
	 * @return array
	 */
	private function build_form_field_schema( $field_id, $field_type, $block_name, $attrs ) {
		$schema = array(
			'id'            => $field_id,
			'type'          => sanitize_key( $field_type ),
			'blockName'     => $block_name,
			'required'      => ! empty( $attrs['required'] ),
			'options'       => $this->get_form_field_options( $attrs, $field_type ),
			'defaultLogic'  => isset( $attrs['defaultLogic'] ) && is_scalar( $attrs['defaultLogic'] ) ? sanitize_key( $attrs['defaultLogic'] ) : '',
			'hasFieldLogic' => ! empty( $attrs['displayLogic'] ) && is_array( $attrs['displayLogic'] ),
		);

		if ( isset( $attrs['validationType'] ) && is_scalar( $attrs['validationType'] ) ) {
			$schema['validationType'] = sanitize_key( $attrs['validationType'] );
		}

		if ( isset( $attrs['validationMin'] ) && is_numeric( $attrs['validationMin'] ) ) {
			$schema['validationMin'] = (float) $attrs['validationMin'];
		}

		if ( isset( $attrs['validationMax'] ) && is_numeric( $attrs['validationMax'] ) ) {
			$schema['validationMax'] = (float) $attrs['validationMax'];
		}

		if ( 'number' === $field_type ) {
			if ( isset( $attrs['inputMin'] ) && is_numeric( $attrs['inputMin'] ) ) {
				$schema['min'] = (float) $attrs['inputMin'];
			}

			if ( isset( $attrs['inputMax'] ) && is_numeric( $attrs['inputMax'] ) ) {
				$schema['max'] = (float) $attrs['inputMax'];
			}
		}

		if ( 'date' === $field_type ) {
			$schema['dateRange'] = ! empty( $attrs['dateRange'] );
			$schema['dateStart'] = isset( $attrs['dateStart'] ) && is_scalar( $attrs['dateStart'] ) ? sanitize_text_field( (string) $attrs['dateStart'] ) : '';
			$schema['dateEnd']   = isset( $attrs['dateEnd'] ) && is_scalar( $attrs['dateEnd'] ) ? sanitize_text_field( (string) $attrs['dateEnd'] ) : '';
		}

		return apply_filters( 'gutenverse_form_public_submit_field_schema_item', $schema, $attrs, $block_name );
	}

	/**
	 * Build submitted field schema from saved form input blocks.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param array $blocks           Parsed blocks.
	 * @param array $schema           Field schema keyed by input name.
	 * @param array $type_map         Block-to-type map.
	 * @param array $default_name_map Block-to-default-name map.
	 */
	private function collect_form_field_schema_from_blocks( $blocks, &$schema, $type_map, $default_name_map ) {
		if ( empty( $blocks ) || ! is_array( $blocks ) ) {
			return;
		}

		foreach ( $blocks as $block ) {
			$block_name = isset( $block['blockName'] ) ? (string) $block['blockName'] : '';
			$attrs      = isset( $block['attrs'] ) && is_array( $block['attrs'] ) ? $block['attrs'] : array();

			if ( isset( $type_map[ $block_name ] ) && is_scalar( $type_map[ $block_name ] ) ) {
				$field_type = sanitize_key( $type_map[ $block_name ] );
				$attrs      = $this->get_form_block_attrs_with_defaults( $block_name, $attrs );
				$input_name = isset( $attrs['inputName'] ) && is_scalar( $attrs['inputName'] ) ? $attrs['inputName'] : ( $default_name_map[ $block_name ] ?? '' );
				$field_id   = is_scalar( $input_name ) ? sanitize_key( $input_name ) : '';

				if ( ! empty( $field_id ) ) {
					$schema[ $field_id ] = $this->build_form_field_schema( $field_id, $field_type, $block_name, $attrs );
				}
			}

			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				$this->collect_form_field_schema_from_blocks( $block['innerBlocks'], $schema, $type_map, $default_name_map );
			}
		}
	}

	/**
	 * Get submitted field schema from saved form builder content.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param array $form_entry Form entry data.
	 * @param int   $form_id    Form ID.
	 *
	 * @return array|WP_REST_Response
	 */
	private function get_submission_field_schema( $form_entry, $form_id ) {
		$block = $this->get_submission_form_builder_block( $form_entry, $form_id );

		if ( empty( $block ) || ! is_array( $block ) ) {
			return new WP_REST_Response(
				array(
					'status'  => 'failed',
					'message' => 'Invalid form context.',
				),
				400
			);
		}

		$type_map         = $this->get_form_input_block_type_map();
		$default_name_map = $this->get_form_input_block_default_name_map();
		$schema           = array();

		if ( ! is_array( $type_map ) ) {
			$type_map = array();
		}

		if ( ! is_array( $default_name_map ) ) {
			$default_name_map = array();
		}

		$inner_blocks = isset( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ? $block['innerBlocks'] : array();
		$this->collect_form_field_schema_from_blocks( $inner_blocks, $schema, $type_map, $default_name_map );

		$schema = apply_filters( 'gutenverse_form_public_submit_field_schema', $schema, $form_entry, $form_id, $block );

		if ( ! is_array( $schema ) ) {
			return array();
		}

		return $schema;
	}

	/**
	 * Build a generic schema validation response.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param string $message Error message.
	 *
	 * @return WP_REST_Response
	 */
	private function make_public_submit_schema_error( $message ) {
		return new WP_REST_Response(
			array(
				'status'  => 'failed',
				'message' => $message,
			),
			400
		);
	}

	/**
	 * Get submitted field value from the payload shape used by FormData.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param array      $data      Submitted field data.
	 * @param string|int $key       Submitted field index.
	 * @param bool       $has_value Whether the submitted value key exists.
	 *
	 * @return mixed
	 */
	private function get_submitted_form_field_value( $data, $key, &$has_value = null ) {
		$has_value = false;

		if ( ! isset( $data['id'] ) || ! is_scalar( $data['id'] ) ) {
			return null;
		}

		$value_key = $data['id'] . '-' . $key . '-value';

		if ( array_key_exists( $value_key, $data ) ) {
			$has_value = true;
			return $data[ $value_key ];
		}

		if ( array_key_exists( 'value', $data ) ) {
			$has_value = true;
			return $data['value'];
		}

		return null;
	}

	/**
	 * Get a nested value from submitted file params.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param array $data File params.
	 * @param array $path Nested path.
	 *
	 * @return mixed|null
	 */
	private function get_submitted_form_file_param( $data, $path ) {
		foreach ( $path as $segment ) {
			if ( ! is_array( $data ) || ! array_key_exists( $segment, $data ) ) {
				return null;
			}

			$data = $data[ $segment ];
		}

		return $data;
	}

	/**
	 * Check whether the request contains a submitted file for a field.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param object|null $request   Submit request.
	 * @param string|int  $key       Submitted field index.
	 * @param string      $value_key Submitted field value key.
	 *
	 * @return bool
	 */
	private function has_submitted_form_file_value( $request, $key, $value_key ) {
		if ( ! is_object( $request ) || ! method_exists( $request, 'get_file_params' ) ) {
			return false;
		}

		$files = $request->get_file_params();

		if ( ! isset( $files['form-entry'] ) || ! is_array( $files['form-entry'] ) ) {
			return false;
		}

		$file_name  = $this->get_submitted_form_file_param( $files['form-entry'], array( 'name', 'data', $key, $value_key ) );
		$file_error = $this->get_submitted_form_file_param( $files['form-entry'], array( 'error', 'data', $key, $value_key ) );

		if ( is_scalar( $file_error ) && UPLOAD_ERR_NO_FILE === (int) $file_error ) {
			return false;
		}

		return is_scalar( $file_name ) && '' !== trim( (string) $file_name );
	}

	/**
	 * Normalize submitted scalar value.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param mixed $value Submitted value.
	 *
	 * @return string
	 */
	private function normalize_submitted_form_scalar( $value ) {
		if ( is_array( $value ) || is_object( $value ) ) {
			return '';
		}

		return sanitize_text_field( wp_unslash( (string) $value ) );
	}

	/**
	 * Normalize submitted list value.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param mixed $value Submitted value.
	 *
	 * @return array
	 */
	private function normalize_submitted_form_value_list( $value ) {
		if ( is_array( $value ) ) {
			$raw_values = $value;
		} elseif ( is_object( $value ) ) {
			return array();
		} elseif ( function_exists( 'wp_parse_list' ) ) {
			$raw_values = wp_parse_list( $value );
		} else {
			$raw_values = array_map( 'trim', explode( ',', (string) $value ) );
		}

		$values = array();

		foreach ( $raw_values as $raw_value ) {
			if ( ! is_scalar( $raw_value ) ) {
				continue;
			}

			$value = sanitize_text_field( wp_unslash( (string) $raw_value ) );

			if ( '' !== $value ) {
				$values[] = $value;
			}
		}

		return $values;
	}

	/**
	 * Check whether a submitted value is empty.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param mixed $value Submitted value.
	 *
	 * @return bool
	 */
	private function is_empty_submitted_form_value( $value ) {
		if ( null === $value ) {
			return true;
		}

		if ( is_array( $value ) ) {
			return empty( $this->normalize_submitted_form_value_list( $value ) );
		}

		if ( is_object( $value ) ) {
			return true;
		}

		return '' === trim( (string) $value );
	}

	/**
	 * Validate one submitted field value against schema.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param array      $schema_field Field schema.
	 * @param mixed      $value        Submitted field value.
	 * @param array      $form_entry   Form entry data.
	 * @param int        $form_id      Form ID.
	 * @param array      $data         Submitted field data.
	 * @param string|int $key          Submitted field index.
	 *
	 * @return WP_REST_Response|null
	 */
	private function validate_submitted_form_field_value( $schema_field, $value, $form_entry, $form_id, $data, $key ) {
		$type     = isset( $schema_field['type'] ) && is_scalar( $schema_field['type'] ) ? sanitize_key( $schema_field['type'] ) : '';
		$required = ! empty( $schema_field['required'] );

		if ( $required && $this->is_empty_submitted_form_value( $value ) ) {
			return $this->make_public_submit_schema_error( 'Required form field is empty.' );
		}

		if ( ! $required && $this->is_empty_submitted_form_value( $value ) ) {
			return null;
		}

		if ( 'email' === $type && ! is_email( $this->normalize_submitted_form_scalar( $value ) ) ) {
			return $this->make_public_submit_schema_error( 'Invalid form field value.' );
		}

		if ( 'number' === $type ) {
			if ( is_array( $value ) || ! is_numeric( $value ) ) {
				return $this->make_public_submit_schema_error( 'Invalid form field value.' );
			}

			$number = (float) $value;

			if ( isset( $schema_field['min'] ) && is_numeric( $schema_field['min'] ) && $number < (float) $schema_field['min'] ) {
				return $this->make_public_submit_schema_error( 'Invalid form field value.' );
			}

			if ( isset( $schema_field['max'] ) && is_numeric( $schema_field['max'] ) && $number > (float) $schema_field['max'] ) {
				return $this->make_public_submit_schema_error( 'Invalid form field value.' );
			}
		}

		if ( 'switch' === $type && ! is_bool( $value ) ) {
			$boolean_values = array( '1', '0', 'true', 'false', 'yes', 'no', 'on', 'off' );
			$boolean_value  = strtolower( trim( (string) $value ) );

			if ( ! in_array( $boolean_value, $boolean_values, true ) ) {
				return $this->make_public_submit_schema_error( 'Invalid form field value.' );
			}
		}

		if ( 'date' === $type && ( ! empty( $schema_field['dateStart'] ) || ! empty( $schema_field['dateEnd'] ) ) ) {
			$date_values = ! empty( $schema_field['dateRange'] ) ? preg_split( '/\s+to\s+/', $this->normalize_submitted_form_scalar( $value ) ) : array( $this->normalize_submitted_form_scalar( $value ) );
			$min_date    = ! empty( $schema_field['dateStart'] ) ? strtotime( $schema_field['dateStart'] ) : false;
			$max_date    = ! empty( $schema_field['dateEnd'] ) ? strtotime( $schema_field['dateEnd'] ) : false;

			if ( ! is_array( $date_values ) ) {
				return $this->make_public_submit_schema_error( 'Invalid form field value.' );
			}

			foreach ( $date_values as $date_value ) {
				$date_timestamp = strtotime( trim( $date_value ) );

				if ( false === $date_timestamp ) {
					return $this->make_public_submit_schema_error( 'Invalid form field value.' );
				}

				if ( false !== $min_date && $date_timestamp < $min_date ) {
					return $this->make_public_submit_schema_error( 'Invalid form field value.' );
				}

				if ( false !== $max_date && $date_timestamp > $max_date ) {
					return $this->make_public_submit_schema_error( 'Invalid form field value.' );
				}
			}
		}

		if ( ! empty( $schema_field['options'] ) && is_array( $schema_field['options'] ) ) {
			$multiple_types = array( 'checkbox', 'multiselect', 'multi-group-select' );

			if ( in_array( $type, $multiple_types, true ) ) {
				foreach ( $this->normalize_submitted_form_value_list( $value ) as $item ) {
					if ( ! in_array( $item, $schema_field['options'], true ) ) {
						return $this->make_public_submit_schema_error( 'Invalid form field value.' );
					}
				}
			} elseif ( is_array( $value ) || ! in_array( $this->normalize_submitted_form_scalar( $value ), $schema_field['options'], true ) ) {
				return $this->make_public_submit_schema_error( 'Invalid form field value.' );
			}
		}

		$validation_type = isset( $schema_field['validationType'] ) && is_scalar( $schema_field['validationType'] ) ? sanitize_key( $schema_field['validationType'] ) : '';

		if ( in_array( $validation_type, array( 'character', 'word' ), true ) ) {
			if ( is_array( $value ) ) {
				$length = count( $this->normalize_submitted_form_value_list( $value ) );
			} else {
				$text = $this->normalize_submitted_form_scalar( $value );

				if ( 'word' === $validation_type ) {
					$words  = preg_split( '/\s+/', trim( $text ), -1, PREG_SPLIT_NO_EMPTY );
					$length = is_array( $words ) ? count( $words ) : 0;
				} else {
					$length = function_exists( 'mb_strlen' ) ? mb_strlen( $text ) : strlen( $text );
				}
			}

			if ( isset( $schema_field['validationMin'] ) && is_numeric( $schema_field['validationMin'] ) && $length < (float) $schema_field['validationMin'] ) {
				return $this->make_public_submit_schema_error( 'Invalid form field value.' );
			}

			if ( isset( $schema_field['validationMax'] ) && is_numeric( $schema_field['validationMax'] ) && $length > (float) $schema_field['validationMax'] ) {
				return $this->make_public_submit_schema_error( 'Invalid form field value.' );
			}
		}

		/**
		 * Filters schema validation result for a submitted field.
		 *
		 * @since 3.0.0-performance
		 *
		 * @param WP_REST_Response|null $error        Validation error.
		 * @param array                 $schema_field Field schema.
		 * @param mixed                 $value        Submitted field value.
		 * @param array                 $form_entry   Form entry data.
		 * @param int                   $form_id      Form ID.
		 * @param array                 $data         Submitted field data.
		 * @param string|int            $key          Submitted field index.
		 */
		$filtered_error = apply_filters( 'gutenverse_form_public_submit_field_value_error', null, $schema_field, $value, $form_entry, $form_id, $data, $key );

		if ( $filtered_error instanceof WP_REST_Response ) {
			return $filtered_error;
		}

		if ( is_string( $filtered_error ) && '' !== $filtered_error ) {
			return $this->make_public_submit_schema_error( $filtered_error );
		}

		return null;
	}

	/**
	 * Decide whether a missing required field should fail validation.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param array $schema_field Field schema.
	 * @param array $form_entry   Form entry data.
	 * @param int   $form_id      Form ID.
	 *
	 * @return bool
	 */
	private function should_validate_missing_required_field( $schema_field, $form_entry, $form_id ) {
		if ( empty( $schema_field['required'] ) ) {
			return false;
		}

		if ( ! empty( $schema_field['hasFieldLogic'] ) || ( isset( $schema_field['defaultLogic'] ) && 'hide' === $schema_field['defaultLogic'] ) ) {
			return false;
		}

		return (bool) apply_filters( 'gutenverse_form_public_submit_validate_missing_required_field', true, $schema_field, $form_entry, $form_id );
	}

	/**
	 * Validate submitted field IDs, types, and values against saved form schema.
	 *
	 * @since 3.0.0-performance
	 *
	 * @param array       $form_entry Form entry data.
	 * @param int         $form_id    Form ID.
	 * @param object|null $request    Submit request.
	 *
	 * @return WP_REST_Response|null
	 */
	private function validate_public_submit_schema( $form_entry, $form_id, $request = null ) {
		$schema = $this->get_submission_field_schema( $form_entry, $form_id );

		if ( $schema instanceof WP_REST_Response ) {
			return $schema;
		}

		$submitted_fields = array();

		foreach ( $form_entry['data'] as $key => $data ) {
			if ( ! is_array( $data ) ) {
				return new WP_REST_Response(
					array(
						'status'  => 'failed',
						'message' => 'Invalid form data.',
					),
					400
				);
			}

			$field_id   = isset( $data['id'] ) && is_scalar( $data['id'] ) ? sanitize_key( $data['id'] ) : '';
			$field_type = isset( $data['type'] ) && is_scalar( $data['type'] ) ? sanitize_key( $data['type'] ) : '';

			if ( empty( $field_id ) || empty( $field_type ) || ! isset( $schema[ $field_id ] ) ) {
				return new WP_REST_Response(
					array(
						'status'  => 'failed',
						'message' => 'Invalid form field.',
					),
					400
				);
			}

			$schema_field  = $schema[ $field_id ];
			$expected_type = is_array( $schema_field ) && isset( $schema_field['type'] ) ? $schema_field['type'] : $schema_field;
			$expected_type = is_scalar( $expected_type ) ? sanitize_key( $expected_type ) : '';

			if ( $expected_type !== $field_type ) {
				return new WP_REST_Response(
					array(
						'status'  => 'failed',
						'message' => 'Invalid form field type.',
					),
					400
				);
			}

			if ( 'file' === $expected_type ) {
				$value_key = $data['id'] . '-' . $key . '-value';
				$value     = $this->has_submitted_form_file_value( $request, $key, $value_key ) ? array( '__gutenverse_uploaded_file__' ) : '';
				$has_value = true;
			} else {
				$value = $this->get_submitted_form_field_value( $data, $key, $has_value );
			}

			if ( ! $has_value ) {
				return $this->make_public_submit_schema_error( 'Invalid form field value.' );
			}

			if ( is_array( $schema_field ) ) {
				$value_error = $this->validate_submitted_form_field_value( $schema_field, $value, $form_entry, $form_id, $data, $key );

				if ( $value_error ) {
					return $value_error;
				}
			}

			$submitted_fields[ $field_id ] = true;
		}

		foreach ( $schema as $field_id => $schema_field ) {
			if ( ! isset( $submitted_fields[ $field_id ] ) && is_array( $schema_field ) && $this->should_validate_missing_required_field( $schema_field, $form_entry, $form_id ) ) {
				return $this->make_public_submit_schema_error( 'Required form field is missing.' );
			}
		}

		return null;
	}

	/**
	 * Send no-cache headers for public form endpoints.
	 *
	 * @since 3.0.0-performance
	 */
	private function send_form_endpoint_no_cache_headers() {
		if ( ! headers_sent() ) {
			nocache_headers();
		}
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
					case 'payment':
						$filtered_data[] = array(
							'id'    => sanitize_key( $data['id'] ),
							'value' => sanitize_text_field( $data[ $value_key ] ),
							'type'  => 'payment',
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
					case 'calculation':
						$filtered_data[] = array(
							'id'    => sanitize_key( $data['id'] ),
							'value' => floatval( $data[ $value_key ] ),
							'type'  => 'calculation',
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
						/**
						 * Filters submitted file field handling.
						 *
						 * @since 3.0.0-performance
						 *
						 * @param array|null $file_result File handling result.
						 * @param array      $data Submitted field data.
						 * @param string|int $key Submitted field index.
						 * @param string     $value_key Submitted field value key.
						 * @param object     $request Submit request.
						 * @param array      $form_options Form options.
						 */
						$file_result = apply_filters(
							'gutenverse_form_submit_file_field',
							null,
							$data,
							$key,
							$value_key,
							$request,
							$form_options
						);

						if ( null === $file_result ) {
							$error[] = 'File upload handler is unavailable.';
							break;
						}

						if ( ! is_array( $file_result ) || ! array_key_exists( 'status', $file_result ) ) {
							$error[] = 'Invalid file upload response.';
							break;
						}

						if ( ! $file_result['status'] ) {
							$error[] = isset( $file_result['message'] ) && is_scalar( $file_result['message'] ) ? sanitize_text_field( $file_result['message'] ) : 'File upload failed.';
							break;
						}

						if ( isset( $file_result['data'] ) && is_array( $file_result['data'] ) ) {
							$filtered_data[] = array(
								'id'    => isset( $file_result['data']['id'] ) ? sanitize_key( $file_result['data']['id'] ) : sanitize_key( $data['id'] ),
								'value' => isset( $file_result['data']['value'] ) ? esc_url_raw( $file_result['data']['value'] ) : null,
							);
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
	 * Verify frontend submit nonce when required.
	 *
	 * Public cached forms do not require a nonce by default. Login-required forms
	 * do require one after the login check passes.
	 *
	 * @param int    $form_id Form ID.
	 * @param object $request Request object.
	 * @param array  $form_setting Form setting.
	 *
	 * @return WP_REST_Response|null
	 */
	private function maybe_verify_public_submit_nonce( $form_id, $request, $form_setting ) {
		$default_require_nonce = ! empty( $form_setting['require_login'] );
		$require_nonce         = apply_filters( 'gutenverse_form_public_submit_require_nonce', $default_require_nonce, $form_id, $request, $form_setting );

		if ( ! $require_nonce ) {
			return null;
		}

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

		return null;
	}

	/**
	 * Validate cache-safe anti-spam fields.
	 *
	 * @param int    $form_id Form ID.
	 * @param object $request Request object.
	 *
	 * @return WP_REST_Response|null
	 */
	private function validate_public_submit_spam_guards( $form_id, $request ) {
		$honeypot = sanitize_text_field( wp_unslash( (string) $request->get_param( 'gutenverse-form-hp' ) ) );

		if ( '' !== $honeypot ) {
			return new WP_REST_Response(
				array(
					'status'  => 'failed',
					'message' => 'Invalid request.',
				),
				400
			);
		}

		$min_seconds = (float) apply_filters( 'gutenverse_form_public_submit_min_seconds', 2, $form_id, $request );
		if ( $min_seconds > 0 ) {
			$elapsed_ms = absint( $request->get_param( 'gutenverse-form-elapsed' ) );

			if ( $elapsed_ms > 0 ) {
				$elapsed_seconds = $elapsed_ms / 1000;

				if ( $elapsed_seconds < $min_seconds ) {
					return new WP_REST_Response(
						array(
							'status'  => 'failed',
							'message' => 'Invalid request.',
						),
						400
					);
				}
			} else {
				$started_at = absint( $request->get_param( 'gutenverse-form-started-at' ) );

				if ( $started_at > 100000000000 ) {
					$started_at = (int) floor( $started_at / 1000 );
				}

				if ( ! $started_at || ( time() - $started_at ) < $min_seconds ) {
					return new WP_REST_Response(
						array(
							'status'  => 'failed',
							'message' => 'Invalid request.',
						),
						400
					);
				}
			}
		}

		return $this->check_public_submit_rate_limit( $form_id, $request );
	}

	/**
	 * Apply a default public submit rate limit.
	 *
	 * @param int    $form_id Form ID.
	 * @param object $request Request object.
	 *
	 * @return WP_REST_Response|null
	 */
	private function check_public_submit_rate_limit( $form_id, $request ) {
		$rate_limit = apply_filters(
			'gutenverse_form_public_submit_rate_limit',
			array(
				'limit'  => 5,
				'window' => MINUTE_IN_SECONDS,
			),
			$form_id,
			$request
		);

		if ( $rate_limit instanceof WP_REST_Response ) {
			return $rate_limit;
		}

		if ( false === $rate_limit || ! is_array( $rate_limit ) || empty( $rate_limit['limit'] ) || empty( $rate_limit['window'] ) ) {
			return null;
		}

		$limit  = absint( $rate_limit['limit'] );
		$window = absint( $rate_limit['window'] );

		if ( ! $limit || ! $window ) {
			return null;
		}

		$remote_addr   = sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ?? '' ) );
		$transient_key = 'gutenverse_form_submit_' . md5( $form_id . '|' . $remote_addr );
		$count         = (int) get_transient( $transient_key );

		if ( $count >= $limit ) {
			return new WP_REST_Response(
				array(
					'status'  => 'failed',
					'message' => 'Too many submissions. Please try again later.',
				),
				429
			);
		}

		set_transient( $transient_key, $count + 1, $window );

		return null;
	}

	/**
	 * Submit Form
	 *
	 * @param object $request .
	 *
	 * @return WP_Response
	 */
	public function submit_form( $request ) {
		$this->send_form_endpoint_no_cache_headers();

		// -----------------------------
		// 1. Validate form-entry structure
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
		// 2. Require login if enabled
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

		$nonce_error = $this->maybe_verify_public_submit_nonce( $form_id, $request, $form_setting );
		if ( $nonce_error ) {
			return $nonce_error;
		}

		$spam_error = $this->validate_public_submit_spam_guards( $form_id, $request );
		if ( $spam_error ) {
			return $spam_error;
		}

		// -----------------------------
		// 3. CAPTCHA validation (safe)
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
			$secret        = $settings_data['form_settings']['form_captcha_settings']['captcha_key']
				?? $settings_data['form_captcha_settings']['captcha_key']
				?? '';

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
						'remoteip' => sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ?? '' ) ),
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
		// 4. Sanitize form data (CRITICAL FIX)
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

		$schema_error = $this->validate_public_submit_schema( $form_entry, $form_id, $request );
		if ( $schema_error ) {
			return $schema_error;
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
			$post_id       = absint( $form_entry['postId'] ?? 0 );

			$normalized_integrations = \Gutenverse_Form\Integration::normalize_entry_integrations(
				array(),
				$form_setting
			);

			$params = array(
				'form-id'      => $form_id,
				'post-id'      => $post_id,
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
		$this->send_form_endpoint_no_cache_headers();

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
	 * Get integration settings schema and current saved values.
	 *
	 * @param \WP_REST_Request $request Request object.
	 *
	 * @return WP_REST_Response
	 */
	public function get_integration_settings( $request ) {
		$service          = sanitize_key( (string) $request->get_param( 'service' ) );
		$allowed_services = array_column( Integration::get_services(), 'service_name' );

		if ( empty( $service ) || ! in_array( $service, $allowed_services, true ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'Invalid integration service.', 'gutenverse-form' ),
				),
				400
			);
		}

		$integration = new Integration();
		$instance    = $integration->get_service_instance( $service );

		if ( ! $instance ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'Integration service is unavailable.', 'gutenverse-form' ),
				),
				404
			);
		}

		$fields   = method_exists( $instance, 'get_fields' ) ? $instance->get_fields() : array();
		$settings = method_exists( $instance, 'get_settings' ) ? $instance->get_settings() : array();
		$response = array(
			'success'  => true,
			'service'  => $service,
			'fields'   => $integration->prepare_service_fields_for_ui( $fields, $settings ),
			'settings' => $integration->prepare_service_settings_for_ui( $fields, $settings ),
		);

		foreach ( Integration::get_services() as $allowed_service ) {
			if ( $allowed_service['service_name'] === $service ) {
				$response['documentationUrl'] = $allowed_service['documentation_url'];
				$response['apiVersion']       = $allowed_service['api_version'] ?? '';
				break;
			}
		}

		return new WP_REST_Response( $response, 200 );
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
