<?php
/**
 * Blocks class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form
 */

namespace Gutenverse_Form;

/**
 * Class Blocks
 *
 * @package gutenverse-form
 */
class Blocks {
	/**
	 * Blocks constructor.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_blocks' ), 99 );
		add_filter( 'gutenverse_block_categories', array( $this, 'block_category' ) );
		add_filter( 'render_block', array( $this, 'render_form_builder' ), 10, 3 );
	}

	/**
	 * Render Form Builder.
	 *
	 * @param string $block_content .
	 * @param array  $block .
	 * @param object $instance Block instance.
	 *
	 * @return string
	 */
	public function render_form_builder( $block_content, $block, $instance = null ) {
		if ( isset( $block['blockName'] ) && 'gutenverse/form-builder' === $block['blockName'] ) {
			$post_id       = $this->get_form_builder_source_post_id( $instance );
			$block_content = str_replace( '<form', '<form data-post-id="' . esc_attr( $post_id ) . '"', $block_content );
		}

		return $block_content;
	}

	/**
	 * Get the public source post for a rendered form builder.
	 *
	 * @param object $block_instance Block instance.
	 *
	 * @return integer
	 */
	private function get_form_builder_source_post_id( $block_instance = null ) {
		$front_source = $this->get_front_or_posts_page_source_post_id();

		if ( null !== $front_source ) {
			return $front_source;
		}

		$context_post_id = $this->get_block_context_post_id( $block_instance );

		if ( $this->is_public_source_post( $context_post_id ) ) {
			return $context_post_id;
		}

		$queried_post_id = absint( get_queried_object_id() );

		if ( $this->is_public_source_post( $queried_post_id ) ) {
			return $queried_post_id;
		}

		if ( is_singular() ) {
			$post_id = absint( get_the_ID() );

			if ( $this->is_public_source_post( $post_id ) ) {
				return $post_id;
			}
		}

		return 0;
	}

	/**
	 * Get source for front page or posts page requests.
	 *
	 * Returning null means the current request is not a front/posts page request.
	 *
	 * @return integer|null
	 */
	private function get_front_or_posts_page_source_post_id() {
		if ( is_front_page() ) {
			return 'page' === get_option( 'show_on_front' ) ? absint( get_option( 'page_on_front' ) ) : 0;
		}

		if ( is_home() ) {
			return absint( get_option( 'page_for_posts' ) );
		}

		return null;
	}

	/**
	 * Get post ID from block context.
	 *
	 * @param object $block_instance Block instance.
	 *
	 * @return integer
	 */
	private function get_block_context_post_id( $block_instance ) {
		if ( $block_instance instanceof \WP_Block && ! empty( $block_instance->context['postId'] ) ) {
			return absint( $block_instance->context['postId'] );
		}

		return 0;
	}

	/**
	 * Check whether a post is a public content source.
	 *
	 * @param integer $post_id Post ID.
	 *
	 * @return bool
	 */
	private function is_public_source_post( $post_id ) {
		$post_id = absint( $post_id );

		if ( ! $post_id ) {
			return false;
		}

		$post = get_post( $post_id );

		if ( ! $post ) {
			return false;
		}

		return ! in_array( $post->post_type, array( 'wp_template', 'wp_template_part', 'wp_block' ), true );
	}

	/**
	 * Block Category
	 *
	 * @param array $categories Block Categories.
	 *
	 * @return array
	 */
	public function block_category( $categories ) {
		$categories['gutenverse-structure'] = __( 'Gutenverse Wrapper', 'gutenverse' );
		$categories['gutenverse-form']      = __( 'Gutenverse Form', 'gutenverse' );

		return $categories;
	}

	/**
	 * Register All Blocks
	 */
	public function register_blocks() {
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-notice/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-builder/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-checkbox/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-date/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-email/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-multiselect/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-number/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-radio/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-select/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-submit/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-switch/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-telp/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-text/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-textarea/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-gdpr/block.json' );
		$this->register_dynamic_block( GUTENVERSE_FORM_DIR . '/block/form-input-recaptcha/block.json' );
	}

	/**
	 * Register dynamic block.
	 *
	 * @param string $json .
	 */
	private function register_dynamic_block( $json ) {
		if ( ! file_exists( $json ) ) {
			return;
		}

		$block_json = gutenverse_get_json( $json );

		if ( isset( $block_json['class_callback'] ) ) {
			$instance = new $block_json['class_callback']();

			register_block_type(
				$json,
				array(
					'render_callback' => array( $instance, 'render' ),
				)
			);
		} else {
			register_block_type( $json );
		}
	}
}
