<?php
/**
 * Form Validation
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form
 */

namespace Gutenverse_Form;

use Gutenverse\Framework\Init;
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
	 * Form File Name
	 *
	 * @var string
	 */
	protected $file_name = '';

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'form_validation_scripts' ), 99999 );
		add_action( 'gutenverse_loop_blocks', array( $this, 'loop_blocks' ), null, 2 );
		add_filter( 'gutenverse_bypass_generate_style', array( $this, 'get_loop_name' ), null, 3 );
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

		$validation_data = null;
		if ( 'direct' === apply_filters( 'gutenverse_frontend_render_mechanism', 'direct' ) ) {
			$validation_data = $this->form_validation_data;
		} else {
			$cache    = Init::instance()->style_cache;
			$cache_id = $cache->get_style_cache_id();
			$filename = $this->file_name . '-form-validation-' . $cache_id . '.json';
			if ( $cache->is_file_exist( $filename ) ) {
				$validation_data = json_decode( $cache->read_cache_file( $filename ) );
			} else {
				$validation_data = $this->form_validation_data;
				$cache->create_cache_file( $filename, wp_json_encode( $validation_data, true ) );
			}
		}
		$this->localize_validation_data( $validation_data );
	}

	/**
	 * Get Loop Name
	 *
	 * @param boolean $flag .
	 * @param string  $name .
	 * @param string  $type .
	 *
	 *  return array .
	 */
	public function get_loop_name( $flag, $name, $type ) {
		$this->file_name = $name;
		$cache           = Init::instance()->style_cache;
		$cache->set_font_cache_name( $name, $type );
		$mechanism = apply_filters( 'gutenverse_frontend_render_mechanism', 'direct' );
		$filename  = $cache->get_file_name( $name );

		if ( 'file' === $mechanism && $cache->is_file_exist( $filename ) ) {
			$cache->inject_to_header( $filename, $type );
			return true;
		}

		return $flag;
	}


	/**
	 * Localize Validation Data;
	 *
	 * @param array $validation_data Validation Data.
	 */
	public function localize_validation_data( $validation_data ) {
		if ( ! empty( $validation_data ) ) {
			$form_data = array();
			foreach ( $validation_data as $form_id ) {
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

				$form_data[] = $result;
			}

			wp_localize_script( 'gutenverse-frontend-event', 'GutenverseFormValidationData', $form_data );
		}
	}


	/**
	 * Loop Block.
	 *
	 *  @param array $block Block Array.
	 */
	public function get_form_data( $block ) {
		if ( 'gutenverse/form-builder' === $block['blockName'] ) {
			if ( isset( $block['attrs']['formId'] ) ) {
				$form_id = $block['attrs']['formId']['value'];
			}

			if ( ! in_array( $form_id, $this->form_validation_data, true ) ) {
				$this->form_validation_data[] = $form_id;
			}
		}
		gutenverse_rlog( 'loop form', $this->form_validation_data );
	}
}
