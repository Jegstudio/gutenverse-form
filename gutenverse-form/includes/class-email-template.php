<?php
/**
 * Email Template Class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse
 */

namespace Gutenverse_Form;

/**
 * Class Email_Template
 *
 * @package gutenverse-form
 */
class Email_Template {

	/**
	 * Post Type Slug
	 */
	const POST_TYPE = 'gutenverse-email-tpl';

	/**
	 * Email template meta keys.
	 */
	const META_DESIGN      = 'gutenverse_email_design';
	const META_HTML        = 'gutenverse_email_html';
	const META_INPUT_NAMES = 'gutenverse_email_input_names';
	const META_FORM_ACTION = 'gutenverse_email_form_action';
	const META_MJML        = 'gutenverse_email_mjml';

	/**
	 * Email template design schema markers.
	 */
	const DESIGN_BUILDER        = 'gutenverse-email-builder';
	const DESIGN_SOURCE_MJML    = 'grapesjs-mjml';
	const DESIGN_SCHEMA_VERSION = 1;

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'edit_form_after_title', array( $this, 'render_editor' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_filter( 'use_block_editor_for_post_type', array( $this, 'disable_block_editor' ), 10, 2 );
		add_filter( 'rest_pre_insert_' . self::POST_TYPE, array( $this, 'protect_rest_save' ), 10, 2 );
	}

	/**
	 * Disable Block Editor
	 *
	 * @param bool   $use_block_editor  Whether the post type uses the block editor.
	 * @param string $post_type         The post type.
	 * @return bool
	 */
	public function disable_block_editor( $use_block_editor, $post_type ) {
		if ( self::POST_TYPE === $post_type ) {
			return false;
		}
		return $use_block_editor;
	}

	/**
	 * Check whether Gutenverse PRO is active.
	 *
	 * @return bool
	 */
	private function has_pro_plugin() {
		return function_exists( 'gutenverse_pro_active' ) && gutenverse_pro_active();
	}

	/**
	 * Check whether email template saves are available.
	 *
	 * @return bool
	 */
	private function can_save_template() {
		$has_license = $this->has_pro_plugin()
			&& ! empty( get_option( 'gutenverse-license', '' ) );

		return (bool) apply_filters( 'gutenverse_form_email_template_can_save', $has_license );
	}

	/**
	 * Protect email template REST saves behind PRO.
	 *
	 * @param \stdClass         $prepared_post Prepared post object.
	 * @param \WP_REST_Request $request       REST request.
	 * @return \stdClass|\WP_Error
	 */
	public function protect_rest_save( $prepared_post, $request ) {
		if ( $this->can_save_template() ) {
			return $prepared_post;
		}

		if ( 'GET' === $request->get_method() ) {
			return $prepared_post;
		}

		if ( $this->is_starter_template_create_request( $request ) ) {
			return $prepared_post;
		}

		return new \WP_Error(
			'gutenverse_form_email_template_pro_required',
			__( 'Saving email templates requires Gutenverse PRO.', 'gutenverse-form' ),
			array( 'status' => 403 )
		);
	}

	/**
	 * Check whether the request is creating an initial starter template from the form builder.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return bool
	 */
	private function is_starter_template_create_request( $request ) {
		if ( 'POST' !== $request->get_method() || ! empty( $request['id'] ) ) {
			return false;
		}

		if ( ! rest_sanitize_boolean( $request->get_param( 'gutenverse_form_starter_template' ) ) ) {
			return false;
		}

		$meta = $request->get_param( 'meta' );

		return is_array( $meta )
			&& ! empty( $meta[ self::META_DESIGN ] )
			&& ! empty( $meta[ self::META_HTML ] )
			&& ! empty( $meta[ self::META_MJML ] )
			&& self::is_gutenverse_design( $meta[ self::META_DESIGN ] );
	}

	/**
	 * Register Post Type
	 */
	public function register_post_type() {
		$labels = array(
			'name'                  => _x( 'Email Templates', 'Post Type General Name', 'gutenverse-form' ),
			'singular_name'         => _x( 'Email Template', 'Post Type Singular Name', 'gutenverse-form' ),
			'menu_name'             => __( 'Email Templates', 'gutenverse-form' ),
			'name_admin_bar'        => __( 'Email Template', 'gutenverse-form' ),
			'archives'              => __( 'Item Archives', 'gutenverse-form' ),
			'attributes'            => __( 'Item Attributes', 'gutenverse-form' ),
			'parent_item_colon'     => __( 'Parent Item:', 'gutenverse-form' ),
			'all_items'             => __( 'All Items', 'gutenverse-form' ),
			'add_new_item'          => __( 'Add New Item', 'gutenverse-form' ),
			'add_new'               => __( 'Add New', 'gutenverse-form' ),
			'new_item'              => __( 'New Item', 'gutenverse-form' ),
			'edit_item'             => __( 'Edit Item', 'gutenverse-form' ),
			'update_item'           => __( 'Update Item', 'gutenverse-form' ),
			'view_item'             => __( 'View Item', 'gutenverse-form' ),
			'view_items'            => __( 'View Items', 'gutenverse-form' ),
			'search_items'          => __( 'Search Item', 'gutenverse-form' ),
			'not_found'             => __( 'Not found', 'gutenverse-form' ),
			'not_found_in_trash'    => __( 'Not found in Trash', 'gutenverse-form' ),
			'featured_image'        => __( 'Featured Image', 'gutenverse-form' ),
			'set_featured_image'    => __( 'Set featured image', 'gutenverse-form' ),
			'remove_featured_image' => __( 'Remove featured image', 'gutenverse-form' ),
			'use_featured_image'    => __( 'Use as featured image', 'gutenverse-form' ),
			'insert_into_item'      => __( 'Insert into item', 'gutenverse-form' ),
			'uploaded_to_this_item' => __( 'Uploaded to this item', 'gutenverse-form' ),
			'items_list'            => __( 'Items list', 'gutenverse-form' ),
			'items_list_navigation' => __( 'Items list navigation', 'gutenverse-form' ),
			'filter_items_list'     => __( 'Filter items list', 'gutenverse-form' ),
		);
		$args   = array(
			'label'               => __( 'Email Template', 'gutenverse-form' ),
			'description'         => __( 'Email Template for Gutenverse Form', 'gutenverse-form' ),
			'labels'              => $labels,
			'supports'            => array( 'title', 'custom-fields' ),
			'hierarchical'        => false,
			'public'              => false,
			'show_ui'             => true,
			'show_in_menu'        => false,
			'menu_position'       => 5,
			'show_in_admin_bar'   => true,
			'show_in_nav_menus'   => false,
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => false,
			'capability_type'     => 'post',
			'map_meta_cap'        => true,
			'show_in_rest'        => true,
		);
		register_post_type( self::POST_TYPE, $args );

		foreach ( self::get_meta_keys( true ) as $meta_key ) {
			$this->register_template_meta( $meta_key );
		}
	}

	/**
	 * Get email template meta keys.
	 *
	 * @param bool $include_form_action Whether to include the owning form action meta key.
	 * @return array
	 */
	public static function get_meta_keys( $include_form_action = false ) {
		$keys = array(
			self::META_DESIGN,
			self::META_HTML,
			self::META_INPUT_NAMES,
			self::META_MJML,
		);

		if ( $include_form_action ) {
			$keys[] = self::META_FORM_ACTION;
		}

		return $keys;
	}

	/**
	 * Register email template post meta.
	 *
	 * @param string $meta_key Meta key.
	 */
	private function register_template_meta( $meta_key ) {
		register_post_meta(
			self::POST_TYPE,
			$meta_key,
			array(
				'show_in_rest'      => true,
				'single'            => true,
				'type'              => 'string',
				'auth_callback'     => function () {
					return current_user_can( 'edit_posts' );
				},
				'sanitize_callback' => function ( $value ) {
					return $value;
				},
			)
		);
	}

	/**
	 * Get the storage format for email template design data.
	 *
	 * @param string|array $design Design JSON string or decoded design data.
	 * @return string
	 */
	public static function get_design_format( $design ) {
		$design = self::normalize_design_data( $design );

		if ( null === $design ) {
			return 'invalid';
		}

		if ( empty( $design ) ) {
			return 'empty';
		}

		if ( self::is_gutenverse_design( $design ) ) {
			return 'gutenverse-mjml';
		}

		if ( self::is_legacy_unlayer_design( $design ) ) {
			return 'unlayer';
		}

		return 'unknown';
	}

	/**
	 * Check whether design data uses the Gutenverse MJML wrapper schema.
	 *
	 * @param string|array $design Design JSON string or decoded design data.
	 * @return bool
	 */
	public static function is_gutenverse_design( $design ) {
		$design = self::normalize_design_data( $design );

		return is_array( $design )
			&& isset( $design['builder'], $design['source'], $design['schemaVersion'] )
			&& self::DESIGN_BUILDER === $design['builder']
			&& self::DESIGN_SOURCE_MJML === $design['source']
			&& self::DESIGN_SCHEMA_VERSION === (int) $design['schemaVersion'];
	}

	/**
	 * Check whether design data looks like a legacy Unlayer design.
	 *
	 * @param string|array $design Design JSON string or decoded design data.
	 * @return bool
	 */
	public static function is_legacy_unlayer_design( $design ) {
		$design = self::normalize_design_data( $design );

		return is_array( $design )
			&& ! self::is_gutenverse_design( $design )
			&& isset( $design['body'] )
			&& is_array( $design['body'] )
			&& (
				isset( $design['body']['rows'] )
				|| isset( $design['body']['headers'] )
				|| isset( $design['body']['footers'] )
			);
	}

	/**
	 * Normalize design data into an array.
	 *
	 * @param string|array $design Design JSON string or decoded design data.
	 * @return array|null
	 */
	private static function normalize_design_data( $design ) {
		if ( is_array( $design ) ) {
			return $design;
		}

		if ( ! is_string( $design ) ) {
			return null;
		}

		if ( '' === trim( $design ) ) {
			return array();
		}

		$decoded = json_decode( $design, true );

		return is_array( $decoded ) ? $decoded : null;
	}

	/**
	 * Enqueue Scripts
	 */
	public function enqueue_scripts() {
		$screen = get_current_screen();

		if ( is_object( $screen ) && self::POST_TYPE === $screen->post_type ) {
			$asset_file = GUTENVERSE_FORM_DIR . 'lib/dependencies/email-template.asset.php';

			// The full-screen email builder does not render WordPress' normal auth check modal.
			wp_dequeue_script( 'wp-auth-check' );
			wp_dequeue_style( 'wp-auth-check' );
			remove_action( 'admin_print_footer_scripts', 'wp_auth_check_html', 5 );

			if ( file_exists( $asset_file ) ) {
				$asset             = require $asset_file;
				$gutenverse_config = \Gutenverse\Framework\Init::instance()->editor_assets->gutenverse_config();

				wp_enqueue_script(
					'gutenverse-email-template',
					GUTENVERSE_FORM_URL . '/assets/js/email-template.js',
					$asset['dependencies'],
					$asset['version'],
					true
				);

				wp_localize_script(
					'gutenverse-email-template',
					'GutenverseConfig',
					$gutenverse_config
				);

				wp_localize_script(
					'gutenverse-email-template',
					'gutenverseEmailTemplate',
					array(
						'nonce'         => wp_create_nonce( 'wp_rest' ),
						'postId'        => get_the_ID(),
						'canSave'       => $this->can_save_template(),
						'hasProPlugin'  => $this->has_pro_plugin(),
						'licenseUrl'    => admin_url( 'admin.php?page=gutenverse&path=license' ),
						'placeholders'  => $this->get_available_placeholders( get_the_ID() ),
						'upgradeProUrl' => isset( $gutenverse_config['upgradeProUrl'] ) ? $gutenverse_config['upgradeProUrl'] : '',
					)
				);

				$style_file    = GUTENVERSE_FORM_DIR . 'assets/css/email-template.css';
				$style_version = file_exists( $style_file ) ? filemtime( $style_file ) : $asset['version'];

				wp_enqueue_style(
					'gutenverse-email-template-css',
					GUTENVERSE_FORM_URL . '/assets/css/email-template.css',
					array(),
					$style_version
				);
			}
		}
	}

	/**
	 * Render Editor
	 *
	 * @param \WP_Post $post Post object.
	 */
	public function render_editor( $post ) {
		if ( self::POST_TYPE !== $post->post_type ) {
			return;
		}

		echo '<div id="gutenverse-email-builder-root"></div>';
	}

	/**
	 * Get Available Placeholders
	 *
	 * @param int $template_id Email template post ID.
	 * @return array
	 */
	public function get_available_placeholders( $template_id = 0 ) {
		return Placeholder::get_available_placeholders( $template_id );
	}
}
