<?php
/**
 * Placeholder Helper Class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse-form
 */

namespace Gutenverse_Form;

/**
 * Class Placeholder
 *
 * @package gutenverse-form
 */
class Placeholder {
	/**
	 * Get Available Placeholders
	 *
	 * @return array
	 */
	public static function get_available_placeholders() {
		$placeholders = array(
			'entry_title' => array(
				'name'  => 'Entry Title',
				'value' => '{{entry_title}}',
			),
			'form_title'  => array(
				'name'  => 'Form Title',
				'value' => '{{form_title}}',
			),
			'site_title'  => array(
				'name'  => 'Site Title',
				'value' => '{{site_title}}',
			),
		);

		$forms = get_posts(
			array(
				'post_type'      => 'gutenverse-form',
				'posts_per_page' => -1,
				'post_status'    => 'publish',
				'orderby'        => 'modified',
				'order'          => 'DESC',
			)
		);

		$custom_vars = array();
		if ( $forms ) {
			foreach ( $forms as $form ) {
				$meta = get_post_meta( $form->ID, 'form-data', true );
				if ( ! empty( $meta['variable_mapping'] ) && is_array( $meta['variable_mapping'] ) ) {
					foreach ( $meta['variable_mapping'] as $mapping ) {
						$var_name = '';
						if ( is_string( $mapping ) && ! empty( $mapping ) ) {
							$var_name = $mapping;
						} elseif ( is_array( $mapping ) && ! empty( $mapping['name'] ) ) {
							$var_name = $mapping['name'];
						}

						if ( ! empty( $var_name ) && ! in_array( $var_name, $custom_vars, true ) ) {
							$custom_vars[] = $var_name;
						}
					}
				}
			}
		}

		foreach ( $custom_vars as $var ) {
			$placeholders[ $var ] = array(
				'name'  => 'Tag: ' . $var,
				'value' => '{{' . $var . '}}',
			);
		}

		return $placeholders;
	}

	/**
	 * Extract Input names from blocks
	 *
	 * @param array $blocks Blocks.
	 * @param array $input_names Input names.
	 */
	private static function extract_input_names( $blocks, &$input_names ) {
		foreach ( $blocks as $block ) {
			if ( isset( $block['blockName'] ) && strpos( $block['blockName'], 'gutenverse/form-input' ) !== false ) {
				if ( isset( $block['attrs']['inputName'] ) ) {
					$input_names[] = $block['attrs']['inputName'];
				}
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				self::extract_input_names( $block['innerBlocks'], $input_names );
			}
		}
	}
}
