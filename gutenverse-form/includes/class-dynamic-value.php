<?php
/**
 * Dynamic Value Handler
 *
 * @package gutenverse-form
 */

namespace Gutenverse_Form;

/**
 * Class Dynamic_Value
 */
class Dynamic_Value {
	/**
	 * Constructor
	 */
	public function __construct() {
		add_filter( 'register_block_type_args', array( $this, 'modify_block_args' ), 10, 2 );
	}

	/**
	 * Modify block type arguments to resolve dynamic default values.
	 *
	 * @param array  $args       Block type arguments.
	 * @param string $block_type Block type name.
	 * @return array
	 */
	public function modify_block_args( $args, $block_type ) {
		$blocks = array(
			'gutenverse/form-input-text',
			'gutenverse/form-input-email',
			'gutenverse/form-input-telp',
			'gutenverse/form-input-textarea',
		);

		if ( in_array( $block_type, $blocks, true ) ) {
			$args['render_callback'] = array( $this, 'render_form_input_text' );
		}
		return $args;
	}

	/**
	 * Render callback for form-input-text to resolve dynamic values.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content    Block content.
	 * @return string
	 */
	public function render_form_input_text( $attributes, $content ) {
		if ( is_admin() ) {
			return $content;
		}

		$default_value_type = isset( $attributes['defaultValueType'] ) ? $attributes['defaultValueType'] : 'custom';
		$resolved_value     = '';

		if ( 'custom' === $default_value_type ) {
			$resolved_value = isset( $attributes['customDefaultValue'] ) ? $attributes['customDefaultValue'] : '';
		} elseif ( 'loop' === $default_value_type ) {
			$loop_data_type = isset( $attributes['loopDataType'] ) ? $attributes['loopDataType'] : 'id';
			$resolved_value = $this->resolve_loop_data( $loop_data_type, $attributes );
		} else {
			return $content;
		}

		// Sanitize the value before injection.
		$resolved_value = sanitize_text_field( $resolved_value );

		if ( ! empty( $resolved_value ) ) {
			// Find the input element and inject the value.
			// We target the first input or textarea tag in the block content.
			if ( preg_match( '/<input[^>]*>/i', $content, $matches ) ) {
				$tag = $matches[0];

				// Ensure we are only modifying a gutenverse input to avoid accidental injection.
				if ( strpos( $tag, 'gutenverse-input' ) !== false ) {
					if ( preg_match( '/\svalue=["\']([^"\']*)["\']/i', $tag ) ) {
						$new_tag = preg_replace( '/\svalue=["\']([^"\']*)["\']/i', ' value="' . esc_attr( $resolved_value ) . '"', $tag );
					} else {
						$new_tag = str_replace( '>', ' value="' . esc_attr( $resolved_value ) . '">', $tag );
					}

					$content = str_replace( $tag, $new_tag, $content );
				}
			} elseif ( preg_match( '/<textarea[^>]*>([\s\S]*?)<\/textarea>/i', $content, $matches ) ) {
				$tag           = $matches[0];
				$inner_content = $matches[1];

				if ( strpos( $tag, 'gutenverse-input' ) !== false && empty( trim( $inner_content ) ) ) {
					$new_tag = preg_replace( '/>([\s\S]*?)<\/textarea>/i', '>' . esc_textarea( $resolved_value ) . '</textarea>', $tag );
					$content = str_replace( $tag, $new_tag, $content );
				}
			}
		}

		return $content;
	}

	/**
	 * Resolve Loop Data.
	 *
	 * @param string $type       Loop Data Type.
	 * @param array  $attributes Block Attributes.
	 * @return string
	 */
	private function resolve_loop_data( $type, $attributes ) {
		$post = get_post();
		if ( ! $post ) {
			return isset( $attributes['fallbackDefaultValue'] ) ? (string) $attributes['fallbackDefaultValue'] : '';
		}

		$value = '';
		switch ( $type ) {
			case 'id':
				$value = $post->ID;
				break;
			case 'title':
				$value = get_the_title( $post );
				break;
			case 'url':
				$value = get_permalink( $post );
				break;
			case 'type':
				$value = get_post_type( $post );
				break;
			case 'meta':
				$meta_key = isset( $attributes['loopDataMetaKey'] ) ? $attributes['loopDataMetaKey'] : '';
				if ( ! empty( $meta_key ) ) {
					$value = get_post_meta( $post->ID, $meta_key, true );
				}
				break;
			case 'taxonomy':
				$tax_slug = isset( $attributes['loopDataTaxonomySlug'] ) ? $attributes['loopDataTaxonomySlug'] : '';
				if ( ! empty( $tax_slug ) ) {
					$terms = get_the_terms( $post->ID, $tax_slug );
					if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
						$value = $terms[0]->name;
					}
				}
				break;
		}

		return ! empty( $value ) ? (string) $value : ( isset( $attributes['fallbackDefaultValue'] ) ? (string) $attributes['fallbackDefaultValue'] : '' );
	}
}
