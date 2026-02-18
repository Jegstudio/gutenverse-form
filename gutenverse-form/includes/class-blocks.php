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
		add_filter( 'render_block', array( $this, 'render_form_builder' ), 10, 2 );
	}

	/**
	 * Render Form Builder.
	 *
	 * @param string $block_content .
	 * @param array  $block .
	 *
	 * @return string
	 */
	public function render_form_builder( $block_content, $block ) {
		if ( 'gutenverse/form-builder' === $block['blockName'] ) {
			$post_id       = get_the_ID();
			$block_content = str_replace( '<form', '<form data-post-id="' . $post_id . '"', $block_content );
		}

		return $block_content;
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
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-builder/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-checkbox/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-date/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-email/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-multiselect/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-number/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-radio/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-select/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-submit/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-switch/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-telp/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-text/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-textarea/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-input-gdpr/block.json' );
		register_block_type( GUTENVERSE_FORM_DIR . '/block/form-notice/block.json' );
	}
}
