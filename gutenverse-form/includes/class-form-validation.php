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
	 * Get file name
	 *
	 * @var string
	 */
	protected $file_name = '';

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
		add_action( 'wp_footer', array( $this, 'form_validation_scripts' ), 19 );
		add_filter( 'gutenverse_bypass_generate_style', array( $this, 'bypass_generate_css' ), 20, 2 );
		add_action( 'gutenverse_loop_blocks', array( $this, 'loop_blocks' ), null, 2 );
		add_action( 'gutenverse_after_style_loop_blocks', array( $this, 'get_blocks' ), null );
		add_filter( 'render_block', array( $this, 'collect_rendered_form_builder' ), 9, 2 );
	}

	/**
	 * Loop Block.
	 */
	public function get_blocks() {
		if ( $this->is_bypass ) {
			$cache           = Init::instance()->style_cache;
			$validation_data = $this->form_validation_data;
			if ( $this->form_validation_data ) {
				$cache->create_cache_file( $this->file_name, wp_json_encode( $validation_data, true ) );
			}
			$this->form_file[] = $this->file_name;
			$this->is_bypass   = false;
		}
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
	 *
	 * @return bool
	 */
	public function bypass_generate_css( $flag, $name ) {
		if ( 'direct' !== apply_filters( 'gutenverse_frontend_render_mechanism', 'direct' ) ) {
			$cache    = Init::instance()->style_cache;
			$cache_id = $cache->get_style_cache_id();
			$filename = $name . '-form-validation-' . $cache_id . '.json';

			if ( $cache->is_file_exist( $filename ) ) {
				$this->form_file[] = $filename;
				return true;
			}
			$this->file_name            = $filename;
			$this->is_bypass            = true;
			$this->form_validation_data = array();
		}

		return $flag;
	}


	/**
	 * Form Validation Scripts
	 */
	public function form_validation_scripts() {
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

			$merged_datas = array_unique( $merged_datas );

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
		$form_data            = is_array( $form_data ) ? $form_data : array();
		$form_validation_data = is_array( $this->form_validation_data ) ? $this->form_validation_data : array();
		$form_data            = array_merge( $form_data, $form_validation_data );
		$form_data            = array_values( array_unique( array_filter( array_map( 'absint', $form_data ) ) ) );
		$form_result          = array();
		$include_user_data    = apply_filters( 'gutenverse_form_localize_frontend_user_data', false );
		$user_data            = null;

		if ( $include_user_data && is_user_logged_in() ) {
			$user_data = array(
				'id'           => get_current_user_id(),
				'username'     => wp_get_current_user()->user_login,
				'display_name' => wp_get_current_user()->display_name,
				'first_name'   => wp_get_current_user()->first_name,
				'last_name'    => wp_get_current_user()->last_name,
				'email'        => wp_get_current_user()->user_email,
				'role'         => (array) wp_get_current_user()->roles,
			);
		}

		if ( ! empty( $form_data ) ) {
			foreach ( $form_data as $form_id ) {
				$post_type = get_post_type( $form_id );

				if ( 'gutenverse-form' === $post_type ) {
					$result = array(
						'formId'        => $form_id,
						'require_login' => false,
						'logged_in'     => is_user_logged_in(),
					);

					$data                          = get_post_meta( $form_id, 'form-data', true );
					$data                          = is_array( $data ) ? $data : array();
					$result['require_login']       = isset( $data['require_login'] ) ? $data['require_login'] : false;
					$result['form_success_notice'] = isset( $data['form_success_notice'] ) ? $data['form_success_notice'] : false;
					$result['form_error_notice']   = isset( $data['form_error_notice'] ) ? $data['form_error_notice'] : false;
					$result['file_rule']           = array(
						'max_size'           => isset( $data['max_size_file'] ) ? $data['max_size_file'] : false,
						'allowed_extensions' => isset( $data['allowed_extensions'] ) ? $data['allowed_extensions'] : false,
					);
					$form_result[]                 = $result;
				}
			}
		}
		wp_localize_script(
			'gutenverse-frontend-event',
			'GutenverseFormValidationData',
			array(
				'data'         => $form_result,
				'missingLabel' => esc_html__( 'Form action is missing, please assign form action into this form.', 'gutenverse-form' ),
				'isAdmin'      => $include_user_data && current_user_can( 'manage_options' ),
				'userData'     => $user_data,
			)
		);
	}


	/**
	 * Loop Block.
	 *
	 *  @param array $block Block Array.
	 */
	public function get_form_data( $block ) {
		if ( 'gutenverse/form-builder' === $block['blockName'] ) {
			$this->add_form_id( $this->get_form_id_from_block( $block ) );
		}
	}

	/**
	 * Collect rendered form builder data for frontend validation.
	 *
	 * @param string $block_content Block content.
	 * @param array  $block         Block data.
	 *
	 * @return string
	 */
	public function collect_rendered_form_builder( $block_content, $block ) {
		if ( isset( $block['blockName'] ) && 'gutenverse/form-builder' === $block['blockName'] ) {
			if ( isset( $block['attrs']['formId'] ) ) {
				$this->add_form_id( $block['attrs']['formId'] );
			} else {
				$this->add_form_id( $this->get_form_id_from_content( $block_content ) );
			}
		}

		return $block_content;
	}

	/**
	 * Add form ID to validation data.
	 *
	 * @param array|int|string $form_id Form ID.
	 */
	public function add_form_id( $form_id ) {
		if ( is_array( $form_id ) && isset( $form_id['value'] ) ) {
			$form_id = $form_id['value'];
		}

		$form_id = absint( $form_id );

		if ( $form_id && ! in_array( $form_id, $this->form_validation_data, true ) ) {
			$this->form_validation_data[] = $form_id;
		}
	}

	/**
	 * Get form ID from rendered form markup.
	 *
	 * @param string $block_content Block content.
	 *
	 * @return int
	 */
	private function get_form_id_from_content( $block_content ) {
		if ( class_exists( 'WP_HTML_Tag_Processor' ) ) {
			$processor = new \WP_HTML_Tag_Processor( $block_content );

			if ( $processor->next_tag( 'form' ) ) {
				return absint( $processor->get_attribute( 'data-form-id' ) );
			}
		} elseif ( preg_match( '/<form\b[^>]*\sdata-form-id=["\']?([0-9]+)/i', $block_content, $matches ) ) {
			return absint( $matches[1] );
		}

		return 0;
	}

	/**
	 * Get form ID from parsed form builder block.
	 *
	 * @param array $block Parsed block.
	 *
	 * @return int
	 */
	private function get_form_id_from_block( $block ) {
		if ( ! isset( $block['attrs']['formId'] ) ) {
			return 0;
		}

		$form_attr = $block['attrs']['formId'];

		if ( is_array( $form_attr ) && isset( $form_attr['value'] ) ) {
			return absint( $form_attr['value'] );
		}

		return is_scalar( $form_attr ) ? absint( $form_attr ) : 0;
	}
}
