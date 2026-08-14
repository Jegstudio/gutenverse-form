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
			$post_id    = $this->get_form_builder_source_post_id( $instance );
			$element_id = $this->get_form_builder_element_id( $block_content, $block );

			$block_content = $this->ensure_form_builder_submit_context( $block_content, $post_id, $element_id );
		}

		return $block_content;
	}

	/**
	 * Ensure rendered form builders have the submit context used by the frontend.
	 *
	 * Older saved form markup can bypass the dynamic form renderer, so this keeps
	 * those forms submit-compatible without changing the saved post content.
	 *
	 * @param string  $block_content Rendered block content.
	 * @param integer $post_id       Source post ID.
	 * @param string  $element_id    Form builder element ID.
	 *
	 * @return string
	 */
	private function ensure_form_builder_submit_context( $block_content, $post_id, $element_id ) {
		if ( false === stripos( $block_content, '<form' ) ) {
			return $block_content;
		}

		$attributes = array(
			'data-post-id'    => absint( $post_id ),
			'data-submit-url' => rest_url( Api::ENDPOINT . '/form/submit' ),
		);
		$inputs     = $this->get_form_builder_submit_context_inputs( $block_content, $element_id );

		$updated_content = preg_replace_callback(
			'/<form\b[^>]*>/i',
			function ( $matches ) use ( $attributes, $inputs ) {
				$form_tag = $matches[0];

				foreach ( $attributes as $attribute => $value ) {
					if ( ! preg_match( '/\s' . preg_quote( $attribute, '/' ) . '\s*=/i', $form_tag ) ) {
						$form_tag = preg_replace( '/\s*>$/', ' ' . $attribute . '="' . esc_attr( $value ) . '">', $form_tag );
					}
				}

				return $form_tag . $inputs;
			},
			$block_content,
			1
		);

		return null === $updated_content ? $block_content : $updated_content;
	}

	/**
	 * Get missing hidden context inputs for old static form markup.
	 *
	 * @param string $block_content Rendered block content.
	 * @param string $element_id    Form builder element ID.
	 *
	 * @return string
	 */
	private function get_form_builder_submit_context_inputs( $block_content, $element_id ) {
		$inputs = '';

		if ( ! empty( $element_id ) && ! $this->has_form_input_name( $block_content, 'gutenverse-form-integration-source' ) ) {
			$integration_source = array(
				'type'      => 'block',
				'elementId' => $element_id,
			);

			$inputs .= '<input type="hidden" name="gutenverse-form-integration-source" value="' . esc_attr( wp_json_encode( $integration_source ) ) . '">';
		}

		if ( ! $this->has_form_input_name( $block_content, 'gutenverse-form-hp' ) ) {
			$inputs .= '<input type="text" name="gutenverse-form-hp" value="" autocomplete="off" tabindex="-1" aria-hidden="true" style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;">';
		}

		if ( ! $this->has_form_input_name( $block_content, 'gutenverse-form-started-at' ) ) {
			$inputs .= '<input type="hidden" name="gutenverse-form-started-at" value="">';
		}

		return $inputs;
	}

	/**
	 * Check whether rendered markup already has an input with the given name.
	 *
	 * @param string $block_content Rendered block content.
	 * @param string $name          Input name.
	 *
	 * @return bool
	 */
	private function has_form_input_name( $block_content, $name ) {
		return (bool) preg_match( '/\sname=(["\'])' . preg_quote( $name, '/' ) . '\1/i', $block_content );
	}

	/**
	 * Get form builder element ID from block attributes or rendered classes.
	 *
	 * @param string $block_content Rendered block content.
	 * @param array  $block         Block data.
	 *
	 * @return string
	 */
	private function get_form_builder_element_id( $block_content, $block ) {
		if ( ! empty( $block['attrs']['elementId'] ) && is_scalar( $block['attrs']['elementId'] ) ) {
			return sanitize_html_class( $block['attrs']['elementId'] );
		}

		if ( preg_match( '/<form\b[^>]*\sclass=(["\'])(.*?)\1/i', $block_content, $matches ) ) {
			$classes = preg_split( '/\s+/', $matches[2] );

			foreach ( $classes as $class_name ) {
				if ( preg_match( '/^guten-(?!element$|form-builder$|sticky$)[A-Za-z0-9_-]+$/', $class_name ) ) {
					return sanitize_html_class( $class_name );
				}
			}
		}

		return '';
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
