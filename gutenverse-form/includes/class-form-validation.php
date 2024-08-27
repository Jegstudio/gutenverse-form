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
	 * Check if Bypass
	 *
	 * @var boolean
	 */
	protected $is_bypass = false;

	/**
	 * Form File Data
	 *
	 * @var array
	 */
	protected $form_file = array();

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'form_validation_scripts' ), 99999 );
		add_filter( 'gutenverse_bypass_generate_style', array( $this, 'bypass_generate_css' ), 20, 3 );
		add_filter( 'gutenverse_render_generated_style', array( $this, 'get_block_data' ), 20, 4 );
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
	 * Check if we going to by pass css generation.
	 *
	 * @param boolean $flag Flag.
	 * @param string  $name Name of file.
	 * @param string  $type Type of generated css.
	 *
	 * @return bool
	 */
	public function bypass_generate_css( $flag, $name, $type ) {
		if ( $flag ) {
			$cache    = Init::instance()->style_cache;
			$cache_id = $cache->get_style_cache_id();
			$filename = $name . '-form-validation-' . $cache_id . '.json';

			if ( ! $cache->is_file_exist( $filename ) ) {
				$this->is_bypass            = true;
				$this->form_validation_data = array();
				return false;
			} else {
				$this->form_file[] = $filename;
			}
		}

		return $flag;
	}

	/**
	 * Get Block Data.
	 *
	 * @param string $flag render flag.
	 * @param string $name Name of file.
	 * @param string $style Generated Style.
	 * @param string $source Source of content.
	 *
	 * @return boolean
	 */
	public function get_block_data( $flag, $name, $style, $source ) {
		if ( $this->is_bypass ) {
			$cache           = Init::instance()->style_cache;
			$cache_id        = $cache->get_style_cache_id();
			$filename        = $name . '-form-validation-' . $cache_id . '.json';
			$validation_data = $this->form_validation_data;
			if ( $this->form_validation_data ) {
				$cache->create_cache_file( $filename, wp_json_encode( $validation_data, true ) );
			}
			$this->form_file[]          = $filename;
			$this->form_validation_data = array();
			$this->is_bypass            = false;
		}
		return $flag;
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
			$cache        = Init::instance()->style_cache;
			$merged_datas = array();

			foreach ( $this->form_file as $filename ) {
				$merged_data = json_decode( $cache->read_cache_file( $filename ), true );

				if ( is_array( $merged_data ) ) {
					$merged_datas = array_merge( $merged_data, $merged_datas );
				}
			}

			$validation_data = $merged_datas;
		}
		$this->localize_validation_data( $validation_data );
	}


	/**
	 * Localize Validation Data;
	 *
	 * @param array $form_data Form Data.
	 */
	public function localize_validation_data( $form_data ) {
		if ( ! empty( $form_data ) ) {
			$form_result = array();

			foreach ( $form_data as $form_id ) {
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

				$form_result[] = $result;
			}

			wp_localize_script( 'gutenverse-frontend-event', 'GutenverseFormValidationData', $form_result );
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
	}
}
