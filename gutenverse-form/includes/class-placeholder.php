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
	 * @param int $template_id Email template post ID.
	 * @return array
	 */
	public static function get_available_placeholders( $template_id = 0 ) {
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

		$forms = self::get_form_actions();

		$custom_vars     = array();
		$field_names     = self::get_stored_template_input_names( $template_id );
		$form_action_ids = array();

		$stored_form_action_id = $template_id ? absint( get_post_meta( $template_id, 'gutenverse_email_form_action', true ) ) : 0;
		if ( $stored_form_action_id ) {
			$form_action_ids[] = $stored_form_action_id;
		}

		if ( $forms ) {
			foreach ( $forms as $form ) {
				$meta = get_post_meta( $form->ID, 'form-data', true );

				self::collect_custom_vars_from_form_action( $meta, $custom_vars );

				if ( self::form_action_uses_template( $meta, $template_id ) ) {
					$form_action_ids[] = (int) $form->ID;
				}

				if ( in_array( (int) $form->ID, $form_action_ids, true ) ) {
					self::collect_input_names_from_mapping( $meta, $field_names );
				}
			}
		}

		$field_names = array_merge(
			$field_names,
			self::get_form_builder_input_names( array_unique( $form_action_ids ) )
		);

		foreach ( $custom_vars as $var ) {
			$placeholders[ $var ] = array(
				'name'  => 'Tag: ' . $var,
				'value' => '{{' . $var . '}}',
			);
		}

		foreach ( array_unique( $field_names ) as $field_name ) {
			if ( ! isset( $placeholders[ $field_name ] ) ) {
				$placeholders[ $field_name ] = array(
					'name'  => 'Field: ' . $field_name,
					'value' => '{{' . $field_name . '}}',
				);
			}
		}

		return $placeholders;
	}

	/**
	 * Get Form Actions.
	 *
	 * @return array
	 */
	private static function get_form_actions() {
		return get_posts(
			array(
				'post_type'      => 'gutenverse-form',
				'posts_per_page' => -1,
				'post_status'    => 'any',
				'orderby'        => 'modified',
				'order'          => 'DESC',
			)
		);
	}

	/**
	 * Collect Custom Variables from a Form Action.
	 *
	 * @param array $meta Form action meta.
	 * @param array $custom_vars Custom variables.
	 */
	private static function collect_custom_vars_from_form_action( $meta, &$custom_vars ) {
		if ( ! is_array( $meta ) || empty( $meta['variable_mapping'] ) || ! is_array( $meta['variable_mapping'] ) ) {
			return;
		}

		foreach ( $meta['variable_mapping'] as $mapping ) {
			$var_name = '';
			if ( is_string( $mapping ) && ! empty( $mapping ) ) {
				$var_name = $mapping;
			} elseif ( is_array( $mapping ) && ! empty( $mapping['name'] ) ) {
				$var_name = $mapping['name'];
			}

			self::add_unique_name( $custom_vars, $var_name );
		}
	}

	/**
	 * Check whether form action uses an email template.
	 *
	 * @param array $meta Form action meta.
	 * @param int   $template_id Email template post ID.
	 *
	 * @return bool
	 */
	private static function form_action_uses_template( $meta, $template_id ) {
		if ( ! $template_id || ! is_array( $meta ) ) {
			return false;
		}

		$user_template  = isset( $meta['user_email_template'] ) ? absint( $meta['user_email_template'] ) : 0;
		$admin_template = isset( $meta['admin_email_template'] ) ? absint( $meta['admin_email_template'] ) : 0;

		return absint( $template_id ) === $user_template || absint( $template_id ) === $admin_template;
	}

	/**
	 * Collect mapped input names from a form action.
	 *
	 * @param array $meta Form action meta.
	 * @param array $input_names Input names.
	 */
	private static function collect_input_names_from_mapping( $meta, &$input_names ) {
		if ( ! is_array( $meta ) || empty( $meta['variable_mapping'] ) || ! is_array( $meta['variable_mapping'] ) ) {
			return;
		}

		foreach ( $meta['variable_mapping'] as $mapping ) {
			if ( is_array( $mapping ) && ! empty( $mapping['input'] ) ) {
				self::add_unique_name( $input_names, $mapping['input'] );
			}
		}
	}

	/**
	 * Get field names captured when a template was created.
	 *
	 * @param int $template_id Email template post ID.
	 *
	 * @return array
	 */
	private static function get_stored_template_input_names( $template_id ) {
		if ( ! $template_id ) {
			return array();
		}

		$input_names = array();
		$raw_names   = get_post_meta( $template_id, 'gutenverse_email_input_names', true );

		if ( is_string( $raw_names ) ) {
			$decoded_names = json_decode( $raw_names, true );
			$raw_names     = is_array( $decoded_names ) ? $decoded_names : array();
		}

		if ( is_array( $raw_names ) ) {
			foreach ( $raw_names as $name ) {
				self::add_unique_name( $input_names, $name );
			}
		}

		return $input_names;
	}

	/**
	 * Get input names from form builder blocks that use form actions.
	 *
	 * @param array $form_action_ids Form action IDs.
	 *
	 * @return array
	 */
	private static function get_form_builder_input_names( $form_action_ids ) {
		if ( empty( $form_action_ids ) ) {
			return array();
		}

		$ignored_types = array(
			'gutenverse-form',
			'gutenverse-entries',
			'gutenverse-email-tpl',
			'attachment',
			'revision',
			'nav_menu_item',
			'wp_navigation',
			'wp_template',
			'wp_template_part',
		);
		$post_types    = array_diff( get_post_types( array( 'show_ui' => true ), 'names' ), $ignored_types );

		if ( empty( $post_types ) ) {
			return array();
		}

		$posts = get_posts(
			array(
				'post_type'      => $post_types,
				'post_status'    => array( 'publish', 'future', 'draft', 'pending', 'private' ),
				'posts_per_page' => -1,
			)
		);

		$input_names = array();
		foreach ( $posts as $post ) {
			if ( ! has_blocks( $post->post_content ) ) {
				continue;
			}

			self::extract_input_names( parse_blocks( $post->post_content ), $form_action_ids, $input_names );
		}

		return $input_names;
	}

	/**
	 * Extract Input names from blocks
	 *
	 * @param array $blocks Blocks.
	 * @param array $form_action_ids Form action IDs.
	 * @param array $input_names Input names.
	 * @param bool  $inside_target_form Whether the current block is inside a matching form builder.
	 */
	private static function extract_input_names( $blocks, $form_action_ids, &$input_names, $inside_target_form = false ) {
		foreach ( $blocks as $block ) {
			$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';
			$is_inside  = $inside_target_form;

			if ( 'gutenverse/form-builder' === $block_name ) {
				$form_action_id = self::get_form_action_id_from_block_attr( isset( $block['attrs']['formId'] ) ? $block['attrs']['formId'] : null );
				$is_inside      = in_array( $form_action_id, $form_action_ids, true );
			}

			if ( $is_inside && false !== strpos( $block_name, 'gutenverse/form-input' ) && isset( $block['attrs']['inputName'] ) ) {
				self::add_unique_name( $input_names, $block['attrs']['inputName'] );
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				self::extract_input_names( $block['innerBlocks'], $form_action_ids, $input_names, $is_inside );
			}
		}
	}

	/**
	 * Get form action ID from a form builder block attribute.
	 *
	 * @param mixed $form_attr Form ID block attribute.
	 *
	 * @return int
	 */
	private static function get_form_action_id_from_block_attr( $form_attr ) {
		if ( is_array( $form_attr ) && isset( $form_attr['value'] ) ) {
			return absint( $form_attr['value'] );
		}

		if ( is_scalar( $form_attr ) ) {
			return absint( $form_attr );
		}

		return 0;
	}

	/**
	 * Add a unique placeholder name.
	 *
	 * @param array  $names Names array.
	 * @param string $name Name.
	 */
	private static function add_unique_name( &$names, $name ) {
		if ( ! is_scalar( $name ) ) {
			return;
		}

		$name = trim( sanitize_text_field( (string) $name ) );
		if ( '' !== $name && ! in_array( $name, $names, true ) ) {
			$names[] = $name;
		}
	}
}
