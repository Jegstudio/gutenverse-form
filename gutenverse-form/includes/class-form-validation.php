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
		add_action( 'wp_enqueue_scripts', array( $this, 'form_validation_scripts' ), 99999 );
		add_action( 'gutenverse_loop_blocks', array( $this, 'loop_blocks' ), null, 2 );
	}

	/**
	 * Loop Block.
	 *
	 * @param array  $block Array of Blocks.
	 * @param string $style $style content.
	 */
	public function loop_blocks( $block, &$style ) {
		$this->get_form_data( $block );
	}

	/**
	 * Form Validation Scripts
	 */
	public function form_validation_scripts() {
		wp_enqueue_script( 'gutenverse-frontend-event' );
		wp_localize_script( 'gutenverse-frontend-event', 'GutenverseFormValidationData', $this->form_validation_data );
	}

	/**
	 * Loop Block.
	 *
	 *  @param array $block Block Array.
	 */
	public function get_form_data( $block ) {
		if ( 'gutenverse/form-builder' === $block['blockName'] ) {
			if ( isset( $block['attrs']['formId'] ) ) {
				$form_id   = $block['attrs']['formId']['value'];
				$post_type = get_post_type( (int) $form_id );
				$result    = array(
					'formId'        => $form_id,
					'require_login' => false,
					'logged_in'     => is_user_logged_in(),
				);
				if ( 'gutenverse-form' === $post_type ) {
					$data                          = get_post_meta( (int) $form_id, 'form-data', true );
					$result['require_login']       = isset( $data['require_login'] ) ? $data['require_login'] : false;
					$result['form_success_notice'] = isset( $data['form_success_notice'] ) ? $data['form_success_notice'] : false;
					$result['form_error_notice']   = isset( $data['form_error_notice'] ) ? $data['form_error_notice'] : false;
				}
				array_push( $this->form_validation_data, $result );
			} else {
				$result = array(
					'formId'        => '',
					'require_login' => false,
					'logged_in'     => false,
				);
				array_push( $this->form_validation_data, $result );
			}
			$unique_array         = array_unique( array_column( $this->form_validation_data, 'formId' ), SORT_REGULAR );
			$final_array          = array_values( array_intersect_key( $this->form_validation_data, $unique_array ) );
			$final_filtered_array = array_filter(
				$final_array,
				function ( $el ) {
					return ! empty( $el['formId'] );
				}
			);

			$this->form_validation_data = $final_filtered_array;
		}
	}
}
