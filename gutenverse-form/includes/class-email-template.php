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
	 * Constructor
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
		add_action( 'edit_form_after_title', array( $this, 'render_editor' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'save_post_' . self::POST_TYPE, array( $this, 'save_post' ) );
		add_filter( 'use_block_editor_for_post_type', array( $this, 'disable_block_editor' ), 10, 2 );
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
			'supports'            => array( 'title', 'custom-fields' ), // Standard editor is disabled
			'hierarchical'        => false,
			'public'              => false, // Not publicly viewable
			'show_ui'             => true,
			'show_in_menu'        => false, // We add manual submenu
			'menu_position'       => 5,
			'show_in_admin_bar'   => true,
			'show_in_nav_menus'   => false,
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => false,
			'capability_type'     => 'post',
			'show_in_rest'        => true, // Important for Block Editor compat if we used it, or API access
		);
		register_post_type( self::POST_TYPE, $args );

		register_post_meta(
			self::POST_TYPE,
			'gutenverse_email_design',
			array(
				'show_in_rest'  => true,
				'single'        => true,
				'type'          => 'string',
				'auth_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'sanitize_callback' => function ( $value ) {
					return $value;
				},
			)
		);

		register_post_meta(
			self::POST_TYPE,
			'gutenverse_email_html',
			array(
				'show_in_rest'  => true,
				'single'        => true,
				'type'          => 'string',
				'auth_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'sanitize_callback' => function ( $value ) {
					return $value;
				},
			)
		);
	}

	/**
	 * Add Menu
	 */
	public function add_menu() {
		add_submenu_page(
			'gutenverse-form',
			__( 'Email Template', 'gutenverse-form' ),
			__( 'Email Template', 'gutenverse-form' ),
			'manage_options',
			'edit.php?post_type=' . self::POST_TYPE
		);
	}

	/**
	 * Enqueue Scripts
	 */
	public function enqueue_scripts() {
		$screen = get_current_screen();

		if ( is_object( $screen ) && self::POST_TYPE === $screen->post_type ) {
			// Enqueue our React App
			$asset_file = GUTENVERSE_FORM_DIR . 'lib/dependencies/email-template.asset.php';

			if ( file_exists( $asset_file ) ) {
				$asset = require $asset_file;
				
				wp_enqueue_script(
					'gutenverse-email-template',
					GUTENVERSE_FORM_URL . '/assets/js/email-template.js',
					$asset['dependencies'],
					$asset['version'],
					true
				);

				wp_localize_script(
					'gutenverse-email-template',
					'gutenverseEmailTemplate',
					array(
						'nonce'  => wp_create_nonce( 'wp_rest' ),
						'postId' => get_the_ID(),
					)
				);
				
				wp_enqueue_style(
					'gutenverse-email-template-css',
					GUTENVERSE_FORM_URL . '/assets/css/email-template.css',
					array(),
					$asset['version']
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
	 * Save Post (Optional if we save via REST)
	 * 
	 * @param int $post_id Post ID.
	 */
	public function save_post( $post_id ) {
	}
}
