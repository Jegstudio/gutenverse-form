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
	}
}
