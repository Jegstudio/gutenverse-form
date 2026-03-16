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
