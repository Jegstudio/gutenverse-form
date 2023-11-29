<?php
/**
 * Form Validation
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form
 */

namespace Gutenverse_Form;

use Gutenverse\Framework\Style_Generator;

/**
 * Class Meta Option
 *
 * @package gutenverse-form
 */
class Form_Validation extends Style_Generator {

    /**
	 * Form Validation Data
	 *
	 * @var array
	 */
	protected $form_validation_data = array();
	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'get_form_block_from_template' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'get_form_block_from_content' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'get_form_block_from_widget' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'form_validation_scripts' ) );
	}
	/**
	 * Form Validation Scripts
	 */
	public function form_validation_scripts() {
		wp_enqueue_script( 'gutenverse-frontend-event' );
		wp_localize_script( 'gutenverse-frontend-event', 'GutenverseFormValidationData', $this->form_validation_data );
	}
	/**
	 * Get form Block from Widgets.
	 */
	public function get_form_block_from_widget() {
		if ( current_theme_supports( 'widgets' ) ) {
			$widget = get_option( 'widget_block' );
			if ( isset( $widget['content'] ) ) {
				$blocks = $this->parse_blocks( $widget['content'] );
				$blocks = $this->flatten_blocks( $blocks );
				$blocks = $this->findFormBlock( $blocks );
				$this->loop_blocks_to_get_form_data( $blocks );
			}
		}
	}
	/**
	 * Get form Block from Template
	 */
	public function get_form_block_from_template() {
		global $_wp_current_template_content;

		if ( ! empty( $_wp_current_template_content ) ) {
			$blocks = $this->parse_blocks( $_wp_current_template_content );
			$blocks = $this->flatten_blocks( $blocks );
			$blocks = $this->findFormBlock( $blocks );
			$this->loop_blocks_to_get_form_data( $blocks );
		}
	}

	/**
	 * Get form Block from Content
	 */
	public function get_form_block_from_content() {
		global $post;

		if ( has_blocks( $post ) && isset( $post->post_content ) ) {
			$blocks = $this->parse_blocks( $post->post_content );
			$blocks = $this->flatten_blocks( $blocks );
			$blocks = $this->findFormBlock( $blocks );
			$this->loop_blocks_to_get_form_data( $blocks );
		}
	}
	/**
	 * Loop Block.
	 *
	 *  @param array $blocks .
	 */
	public function loop_blocks_to_get_form_data( $blocks ) {
		foreach ( $blocks as $block ) {
			if ( 'gutenverse/form-builder' === $block['blockName'] ) {
				$form_id   = $block['attrs']['formId']['value'];
				$post_type = get_post_type( (int) $form_id );
				$result    = array(
					'formId'        => $form_id,
					'require_login' => false,
					'logged_in'     => is_user_logged_in(),
				);
				if ( 'gutenverse-form' === $post_type ) {
					$data                    = get_post_meta( (int) $form_id, 'form-data', true );
					$result['require_login'] = $data['require_login'] ? $data['require_login'] : false;
				}
				if ( $result['formId'] ) {
					array_push( $this->form_validation_data, $result );
					$unique_array               = array_unique( array_column( $this->form_validation_data, 'formId' ), SORT_REGULAR );
					$final_array                = array_values( array_intersect_key( $this->form_validation_data, $unique_array ) );
					$this->form_validation_data = $final_array;
				}
			}
		}
	}
	/**
	 * Find Form Builder Block.
	 *
	 * @param array $array .
	 *
	 * @return array $result .
	 */
	public function findFormBlock( $array ) {
		$result = array();
		foreach ( $array as $item ) {
			if ( $item['blockName'] === 'gutenverse/form-builder' ) {
				$result[] = $item;
			}
			if ( ! empty( $item['innerBlock'] ) ) {
				$result = array_merge( $result, $this->findFormBlock( $item['innerBlock'] ) );
			}
		}
		return $result;
	}
}
