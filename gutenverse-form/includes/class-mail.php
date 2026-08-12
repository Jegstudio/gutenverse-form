<?php
/**
 * Mail class
 *
 * @author Jegstudio
 * @since 1.0.0
 * @package gutenverse
 */

namespace Gutenverse_Form;

use WP_Error;
use WP_REST_Response;

/**
 * Class Mail
 *
 * @package gutenverse
 */
class Mail {
	/**
	 * Class Construct.
	 */
	public function __construct() {
		// nothing.
	}

	/**
	 * Send User an Email.
	 *
	 * @param int   $form_id .
	 * @param array $form_data .
	 * @param int   $entry_id .
	 * @param array $form_entry .
	 * @param array $user_mail .
	 *
	 * @return WP_Response
	 */
	public function send_user_email( $form_id, $form_data, $entry_id, $form_entry, $user_mail ) {
		$subject_type = isset( $form_data['user_email_subject_type'] ) ? $form_data['user_email_subject_type'] : 'static';
		if ( 'post_meta' === $subject_type ) {
			$post_id  = isset( $form_entry['post-id'] ) ? $form_entry['post-id'] : 0;
			$meta_key = isset( $form_data['user_email_subject_meta_key'] ) ? $form_data['user_email_subject_meta_key'] : '';
			$subject  = ( $post_id && ! empty( $meta_key ) ) ? get_post_meta( $post_id, $meta_key, true ) : get_bloginfo( 'name' );
			if ( ! $subject ) {
				$subject = get_bloginfo( 'name' );
			}
		} else {
			$subject = isset( $form_data['user_email_subject'] ) ? $form_data['user_email_subject'] : get_bloginfo( 'name' );
		}

		$from = isset( $form_data['user_email_form'] ) ? $form_data['user_email_form'] : null;
		if ( ! $from && isset( $form_data['user_email_from'] ) ) {
			$from = $form_data['user_email_from'];
		}

		$reply_to_type = isset( $form_data['user_email_reply_to_type'] ) ? $form_data['user_email_reply_to_type'] : 'static';
		if ( 'dynamic' === $reply_to_type ) {
			$reply_to = $this->get_context_reply_to_email( $form_data, $form_entry );
		} else {
			$reply_to = isset( $form_data['user_email_reply_to'] ) ? $form_data['user_email_reply_to'] : null;
		}

		$message_type = isset( $form_data['user_message_type'] ) ? $form_data['user_message_type'] : 'static';
		$template_id  = isset( $form_data['user_email_template'] ) ? (int) $form_data['user_email_template'] : 0;
		$use_template = 'template' === $message_type && $template_id > 0 && get_post_type( $template_id ) === Email_Template::POST_TYPE;

		if ( $use_template ) {
			$body = get_post_meta( $template_id, 'gutenverse_email_html', true );
		} else {
			$message   = nl2br( isset( $form_data['user_email_body'] ) ? $form_data['user_email_body'] : '' );
			$body      = "<html><body><h2 style='text-align: center;'>" . get_the_title( $entry_id ) . "</h2><h4 style='text-align: center;'>" . $message . '</h4>';
			$form_html = $this->format_data_for_mail( $entry_id, $form_entry, $entry_id, false );
			$body     .= $form_html . '</body></html>';
		}

		$body    = $this->replace_placeholders( $body, $form_entry, $form_id, $entry_id, $form_data );
		$subject = $this->replace_placeholders( $subject, $form_entry, $form_id, $entry_id, $form_data );

		if ( $use_template ) {
			$body = $this->restore_template_image_sources( $body, $template_id );
		}

		$body = apply_filters( 'gutenverse_form_user_email_body', $body, $form_id, $form_data, $entry_id, $form_entry );

		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";

		$headers .= 'From: ' . $from . "\r\n" .
			'Reply-To: ' . $reply_to . "\r\n" .
			'X-Mailer: PHP/' . phpversion();

		if ( empty( $user_mail ) ) {
			return new WP_Error(
				'email_error',
				esc_html__( 'Error. User email not found.', 'gutenverse-form' ),
				array( 'status' => 500 )
			);
		}

		$status = array(
			'entry_id' => $entry_id,
			'status'   => wp_mail( $user_mail, $subject, $body, $headers ),
		);

		return new WP_REST_Response( $status, 200 );
	}

	/**
	 * Send Admin an Email.
	 *
	 * @param int   $form_id .
	 * @param array $form_data .
	 * @param int   $entry_id .
	 * @param array $form_entry .
	 *
	 * @return WP_Response
	 */
	public function send_admin_email( $form_id, $form_data, $entry_id, $form_entry ) {
		$subject_type = isset( $form_data['admin_email_subject_type'] ) ? $form_data['admin_email_subject_type'] : 'static';
		if ( 'post_meta' === $subject_type ) {
			$post_id  = isset( $form_entry['post-id'] ) ? $form_entry['post-id'] : 0;
			$meta_key = isset( $form_data['admin_email_subject_meta_key'] ) ? $form_data['admin_email_subject_meta_key'] : '';
			$subject  = ( $post_id && ! empty( $meta_key ) ) ? get_post_meta( $post_id, $meta_key, true ) : null;
		} else {
			$subject = isset( $form_data['admin_email_subject'] ) ? $form_data['admin_email_subject'] : null;
		}

		$from = isset( $form_data['admin_email_from'] ) ? $form_data['admin_email_from'] : null;

		$reply_to_type = isset( $form_data['admin_email_reply_to_type'] ) ? $form_data['admin_email_reply_to_type'] : 'static';
		if ( 'dynamic' === $reply_to_type ) {
			$reply_to_field = isset( $form_data['admin_email_reply_to_dynamic'] ) ? $form_data['admin_email_reply_to_dynamic'] : '';
			$reply_to       = '';
			if ( ! empty( $reply_to_field ) && isset( $form_entry['entry-data'] ) ) {
				foreach ( $form_entry['entry-data'] as $data ) {
					if ( $data['id'] === $reply_to_field ) {
						$reply_to = is_array( $data['value'] ) ? implode( ', ', $data['value'] ) : $data['value'];
						break;
					}
				}
			}
		} else {
			$reply_to = isset( $form_data['admin_email_reply_to'] ) ? $form_data['admin_email_reply_to'] : null;
		}

		$message_type = isset( $form_data['admin_message_type'] ) ? $form_data['admin_message_type'] : 'static';
		$template_id  = isset( $form_data['admin_email_template'] ) ? (int) $form_data['admin_email_template'] : 0;
		$use_template = 'template' === $message_type && $template_id > 0 && get_post_type( $template_id ) === Email_Template::POST_TYPE;

		if ( $use_template ) {
			$body = get_post_meta( $template_id, 'gutenverse_email_html', true );
		} else {
			$message = isset( $form_data['admin_note'] ) ? $form_data['admin_note'] : '';

			if ( 'dynamic' === $message_type ) {
				$input_id = isset( $form_data['admin_message_input_name'] ) ? $form_data['admin_message_input_name'] : '';
				if ( ! empty( $input_id ) && isset( $form_entry['entry-data'] ) ) {
					foreach ( $form_entry['entry-data'] as $data ) {
						if ( $data['id'] === $input_id ) {
							$message = is_array( $data['value'] ) ? implode( ', ', $data['value'] ) : $data['value'];
							break;
						}
					}
				}
			}

			$message   = nl2br( $message );
			$body      = "<html><body><h2 style='text-align: center;'>" . get_the_title( $form_id ) . ' ' . esc_html__( 'Submission', 'gutenverse-form' ) . "</h2><h4 style='text-align: center;'>" . $message . '</h4>';
			$form_html = $this->format_data_for_mail( $entry_id, $form_entry, $entry_id );
			$body     .= $form_html;
			if ( $entry_id ) {
				$edit_link = get_edit_post_link( $entry_id );
				$body     .= '<br/><span>' . __( 'Entry Details', 'gutenverse-form' ) . ' : <a href="' . $edit_link . '">' . $edit_link . '</a></span>';
			}
			$body .= '</body></html>';
		}

		$body    = $this->replace_placeholders( $body, $form_entry, $form_id, $entry_id, $form_data );
		$subject = $this->replace_placeholders( $subject, $form_entry, $form_id, $entry_id, $form_data );

		if ( $use_template ) {
			$body = $this->restore_template_image_sources( $body, $template_id );
		}

		$body = apply_filters( 'gutenverse_form_admin_email_body', $body, $form_id, $form_data, $entry_id, $form_entry );

		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";

		$headers .= 'From: ' . $from . "\r\n" .
			'Reply-To: ' . $reply_to . "\r\n" .
			'X-Mailer: PHP/' . phpversion();

		$mail = '';

		$email_type = ! empty( $form_data['admin_email_type'] ) ? $form_data['admin_email_type'] : 'static';

		if ( 'static' === $email_type ) {
			$mail = isset( $form_data['admin_email_to'] ) ? $form_data['admin_email_to'] : null;
		}

		if ( 'dynamic' === $email_type ) {
			$dynamic_mail = $this->get_dynamic_recipient( $form_data, $form_entry );
			if ( $dynamic_mail ) {
				$mail = $mail ? $mail . ',' . $dynamic_mail : $dynamic_mail;
			}
		}

		if ( ! $mail ) {
			return new WP_Error(
				'email_error',
				esc_html__( 'Error. Notification email not found.', 'gutenverse-form' ),
				array( 'status' => 500 )
			);
		}

		$admin_email  = preg_replace( '/\s+/', '', $mail );
		$admin_emails = explode( ',', $admin_email );
		foreach ( $admin_emails as $email ) {
			$status = array(
				'entry_id' => $entry_id,
				'status'   => wp_mail( $email, $subject, $body, $headers ),
			);
		}

		return new WP_REST_Response( $status, 200 );
	}

	/**
	 * Get dynamic recipient email.
	 *
	 * @param array $form_data .
	 * @param array $form_entry .
	 *
	 * @return string|false
	 */
	public function get_dynamic_recipient( $form_data, $form_entry ) {
		$source  = isset( $form_data['admin_email_source'] ) ? $form_data['admin_email_source'] : 'post_author';
		$post_id = isset( $form_entry['post-id'] ) ? $form_entry['post-id'] : 0;
		$email   = false;

		if ( ! $post_id ) {
			return false;
		}

		switch ( $source ) {
			case 'post_author':
				$author_id = get_post_field( 'post_author', $post_id );
				$email     = get_the_author_meta( 'user_email', $author_id );
				break;
			case 'post_meta':
				$meta_key = isset( $form_data['admin_email_meta_key'] ) ? $form_data['admin_email_meta_key'] : '';
				if ( ! empty( $meta_key ) ) {
					$email = get_post_meta( $post_id, $meta_key, true );
				}
				break;
		}

		return apply_filters( 'gutenverse_form_dynamic_admin_recipient', $email, $source, $post_id, $form_data );
	}

	/**
	 * Get confirmation reply-to email from the current content context.
	 *
	 * @param array $form_data .
	 * @param array $form_entry .
	 *
	 * @return string
	 */
	public function get_context_reply_to_email( $form_data, $form_entry ) {
		$post_id = isset( $form_entry['post-id'] ) ? absint( $form_entry['post-id'] ) : 0;
		$email   = '';

		if ( $post_id ) {
			$author_id = get_post_field( 'post_author', $post_id );

			if ( $author_id ) {
				$email = get_the_author_meta( 'user_email', $author_id );
			}
		}

		if ( ! $email ) {
			$email = get_option( 'admin_email' );
		}

		$email = apply_filters( 'gutenverse_form_confirmation_reply_to_email', $email, $post_id, $form_data, $form_entry );
		$email = sanitize_email( $email );

		if ( ! is_email( $email ) ) {
			$email = '';
		}

		return $email;
	}

	/**
	 * Email HTML.
	 *
	 * @param int   $form_id .
	 * @param array $form_entry .
	 * @param int   $entry_id .
	 * @param bool  $admin .
	 *
	 * @return WP_Response
	 */
	public static function format_data_for_mail( $form_id, $form_entry, $entry_id, $admin = true ) {
			ob_start();
		?>
		<div>
			<table width="100%" cellpadding="5" cellspacing="0" bgcolor="#FFFFFF" style="border: 1px solid #EAF2FA">
				<tbody>
					<?php
					if ( $admin ) {
						echo "<tr bgcolor='#EAF2FA'><td colspan='3'><strong>" . esc_html__( 'Form ID', 'gutenverse-form' ) . '</strong></td></tr>';
						echo "<tr bgcolor='#FFFFFF'><td width='20'>" . esc_html( $form_id ) . '</td></tr>';
						echo "<tr bgcolor='#EAF2FA'><td colspan='3'><strong>" . esc_html__( 'Post ID', 'gutenverse-form' ) . '</strong></td></tr>';
						echo "<tr bgcolor='#FFFFFF'><td width='20'>" . esc_html( $form_entry['post-id'] ) . '</td></tr>';
					}

					echo "<tr bgcolor='#EAF2FA'><td colspan='3'><strong>" . esc_html__( 'Entry ID', 'gutenverse-form' ) . '</strong></td></tr>';
					echo "<tr bgcolor='#FFFFFF'><td width='20'>" . esc_html( $entry_id ) . '</td></tr>';
					echo "<tr bgcolor='#EAF2FA'><td colspan='3'><strong>" . esc_html__( 'Entry Data', 'gutenverse-form' ) . '</strong></td></tr>';

					foreach ( $form_entry['entry-data'] as $data ) {
						$value = is_array( $data['value'] ) ? gutenverse_join_array( $data['value'], false ) : $data['value'];

						echo "<tr bgcolor='#FFFFFF'><td colspan='2'><strong>" . esc_html( $data['id'] ) . '</strong></td>';
						echo "<td width='20'>" . esc_html( $value ) . '</td></tr>';
					}

					if ( $admin && ! empty( $form_entry['browser-data'] ) ) {
						echo "<tr bgcolor='#EAF2FA'><td colspan='3'><strong>" . esc_html__( 'Browser Info', 'gutenverse-form' ) . '</strong></td></tr>';
						echo "<tr bgcolor='#FFFFFF'><td colspan='2'><strong>IP Address</strong></td>";
						echo "<td width='20'>" . esc_html( $form_entry['browser-data']['ip'] ) . '</td></tr>';
						echo "<tr bgcolor='#FFFFFF'><td colspan='2'><strong>Browser Data</strong></td>";
						echo "<td width='20'>" . esc_html( $form_entry['browser-data']['user_agent'] ) . '</td></tr>';
					}

					?>
				</tbody>
			</table>
		</div>
		<?php
		$data_html = ob_get_contents();
		ob_end_clean();
		return apply_filters( 'gutenverse_form_format_data', $data_html, $form_id, $form_entry, $entry_id, $admin );
	}

	/**
	 * Restore image source attributes that were dropped from saved email HTML.
	 *
	 * @param string $body Email HTML.
	 * @param int    $template_id Email template post ID.
	 *
	 * @return string
	 */
	private function restore_template_image_sources( $body, $template_id ) {
		if ( empty( $body ) || false === stripos( $body, '<img' ) || empty( $template_id ) ) {
			return $body;
		}

		$sources = $this->get_template_image_sources( $template_id );

		if ( empty( $sources ) ) {
			return $body;
		}

		return preg_replace_callback(
			'/<img\b[^>]*>/i',
			function ( $matches ) use ( $sources ) {
				$tag          = $matches[0];
				$current_src  = $this->get_html_tag_attribute( $tag, 'src' );
				$matched_src  = $this->match_template_image_source(
					$sources,
					array(
						$this->get_html_tag_attribute( $tag, 'alt' ),
						$this->get_html_tag_attribute( $tag, 'id' ),
					)
				);

				if ( ! $matched_src ) {
					return $tag;
				}

				if ( ! empty( $current_src ) && $this->normalize_email_image_source( $current_src ) ) {
					return $tag;
				}

				if ( preg_match( '/\ssrc\s*=\s*([\'"])(.*?)\1/i', $tag ) ) {
					return preg_replace( '/\ssrc\s*=\s*([\'"])(.*?)\1/i', ' src="' . esc_url( $matched_src ) . '"', $tag, 1 );
				}

				return preg_replace( '/^<img\b/i', '<img src="' . esc_url( $matched_src ) . '"', $tag, 1 );
			},
			$body
		);
	}

	/**
	 * Get image sources from the saved builder design and MJML.
	 *
	 * @param int $template_id Email template post ID.
	 *
	 * @return array
	 */
	private function get_template_image_sources( $template_id ) {
		$sources = array();
		$design  = json_decode( get_post_meta( $template_id, Email_Template::META_DESIGN, true ), true );

		if ( is_array( $design ) ) {
			$this->collect_template_image_sources( $design, $sources );
		}

		$mjml = get_post_meta( $template_id, Email_Template::META_MJML, true );

		if ( ! empty( $mjml ) ) {
			$this->collect_mjml_image_sources( $mjml, $sources );
		}

		return $this->deduplicate_template_image_sources( $sources );
	}

	/**
	 * Collect image source metadata from nested builder project data.
	 *
	 * @param mixed $node Builder data node.
	 * @param array $sources Source collection.
	 */
	private function collect_template_image_sources( $node, &$sources ) {
		if ( ! is_array( $node ) ) {
			return;
		}

		$attributes    = isset( $node['attributes'] ) && is_array( $node['attributes'] ) ? $node['attributes'] : array();
		$wp_attachment = isset( $node['wpAttachment'] ) && is_array( $node['wpAttachment'] ) ? $node['wpAttachment'] : array();
		$type          = isset( $node['type'] ) ? $node['type'] : '';
		$tag_name      = isset( $node['tagName'] ) ? $node['tagName'] : '';
		$source        = $this->get_first_usable_image_source(
			array(
				isset( $node['src'] ) ? $node['src'] : '',
				isset( $attributes['src'] ) ? $attributes['src'] : '',
				isset( $wp_attachment['selectedUrl'] ) ? $wp_attachment['selectedUrl'] : '',
				isset( $wp_attachment['sourceUrl'] ) ? $wp_attachment['sourceUrl'] : '',
			)
		);

		if ( $source && ( 'mj-image' === $type || 'mj-image' === $tag_name || 'image' === $type || ! empty( $wp_attachment ) ) ) {
			$sources[] = array(
				'src'  => $source,
				'keys' => $this->normalize_image_source_keys(
					array(
						isset( $node['id'] ) ? $node['id'] : '',
						isset( $node['name'] ) ? $node['name'] : '',
						isset( $node['alt'] ) ? $node['alt'] : '',
						isset( $attributes['id'] ) ? $attributes['id'] : '',
						isset( $attributes['alt'] ) ? $attributes['alt'] : '',
						isset( $wp_attachment['id'] ) ? $wp_attachment['id'] : '',
						isset( $wp_attachment['alt'] ) ? $wp_attachment['alt'] : '',
						isset( $wp_attachment['selectedUrl'] ) ? $wp_attachment['selectedUrl'] : '',
						isset( $wp_attachment['sourceUrl'] ) ? $wp_attachment['sourceUrl'] : '',
					)
				),
			);
		}

		foreach ( $node as $value ) {
			$this->collect_template_image_sources( $value, $sources );
		}
	}

	/**
	 * Collect image source metadata from saved MJML.
	 *
	 * @param string $mjml MJML.
	 * @param array  $sources Source collection.
	 */
	private function collect_mjml_image_sources( $mjml, &$sources ) {
		if ( ! preg_match_all( '/<mj-image\b[^>]*>/i', $mjml, $matches ) ) {
			return;
		}

		foreach ( $matches[0] as $tag ) {
			$source = $this->get_first_usable_image_source( array( $this->get_html_tag_attribute( $tag, 'src' ) ) );

			if ( ! $source ) {
				continue;
			}

			$sources[] = array(
				'src'  => $source,
				'keys' => $this->normalize_image_source_keys(
					array(
						$this->get_html_tag_attribute( $tag, 'id' ),
						$this->get_html_tag_attribute( $tag, 'alt' ),
						$source,
					)
				),
			);
		}
	}

	/**
	 * Match a source by known image attributes.
	 *
	 * @param array $sources Source collection.
	 * @param array $keys Candidate keys.
	 *
	 * @return string
	 */
	private function match_template_image_source( $sources, $keys ) {
		$normalized_keys = $this->normalize_image_source_keys( $keys );

		foreach ( $sources as $source ) {
			if ( ! empty( array_intersect( $normalized_keys, $source['keys'] ) ) ) {
				return $source['src'];
			}
		}

		return 1 === count( $sources ) ? $sources[0]['src'] : '';
	}

	/**
	 * Deduplicate source collection.
	 *
	 * @param array $sources Source collection.
	 *
	 * @return array
	 */
	private function deduplicate_template_image_sources( $sources ) {
		$deduplicated = array();

		foreach ( $sources as $source ) {
			if ( empty( $source['src'] ) ) {
				continue;
			}

			if ( empty( $deduplicated[ $source['src'] ] ) ) {
				$deduplicated[ $source['src'] ] = array(
					'src'  => $source['src'],
					'keys' => array(),
				);
			}

			$deduplicated[ $source['src'] ]['keys'] = array_values(
				array_unique(
					array_merge(
						$deduplicated[ $source['src'] ]['keys'],
						isset( $source['keys'] ) ? $source['keys'] : array()
					)
				)
			);
		}

		return array_values( $deduplicated );
	}

	/**
	 * Get the first usable image source.
	 *
	 * @param array $candidates Source candidates.
	 *
	 * @return string
	 */
	private function get_first_usable_image_source( $candidates ) {
		foreach ( $candidates as $candidate ) {
			$source = $this->normalize_email_image_source( $candidate );

			if ( $source ) {
				return $source;
			}
		}

		return '';
	}

	/**
	 * Normalize an image URL for email output.
	 *
	 * @param string $source Source URL.
	 *
	 * @return string
	 */
	private function normalize_email_image_source( $source ) {
		$source = trim( (string) $source );

		if ( empty( $source ) ) {
			return '';
		}

		if ( 0 === strpos( $source, 'data:image/' ) || preg_match( '#^https?://#i', $source ) ) {
			return $source;
		}

		if ( 0 === strpos( $source, '//' ) ) {
			return ( is_ssl() ? 'https:' : 'http:' ) . $source;
		}

		if ( 0 === strpos( $source, '/' ) ) {
			return home_url( $source );
		}

		return '';
	}

	/**
	 * Get an HTML tag attribute value.
	 *
	 * @param string $tag HTML tag.
	 * @param string $attribute Attribute name.
	 *
	 * @return string
	 */
	private function get_html_tag_attribute( $tag, $attribute ) {
		if ( preg_match( '/\s' . preg_quote( $attribute, '/' ) . '\s*=\s*([\'"])(.*?)\1/i', $tag, $match ) ) {
			return html_entity_decode( $match[2], ENT_QUOTES, 'UTF-8' );
		}

		return '';
	}

	/**
	 * Normalize image matching keys.
	 *
	 * @param array $keys Raw keys.
	 *
	 * @return array
	 */
	private function normalize_image_source_keys( $keys ) {
		$normalized = array();

		foreach ( $keys as $key ) {
			$key = strtolower( trim( wp_strip_all_tags( html_entity_decode( (string) $key, ENT_QUOTES, 'UTF-8' ) ) ) );

			if ( '' !== $key ) {
				$normalized[] = $key;
			}
		}

		return array_values( array_unique( $normalized ) );
	}

	/**
	 * Replace placeholders in content.
	 *
	 * @param string $content .
	 * @param array  $form_entry .
	 * @param int    $form_id .
	 * @param int    $entry_id .
	 * @param array  $form_data .
	 *
	 * @return string
	 */
	private function replace_placeholders( $content, $form_entry, $form_id, $entry_id, $form_data = array() ) {
		if ( empty( $content ) ) {
			return $content;
		}

		// Generic placeholders.
		$content = $this->replace_placeholder_token( $content, 'form_id', $form_id );
		$content = $this->replace_placeholder_token( $content, 'entry_id', $entry_id );
		$content = $this->replace_placeholder_token( $content, 'form_title', get_the_title( $form_id ) );
		$content = $this->replace_placeholder_token( $content, 'entry_title', get_the_title( $entry_id ) );
		$content = $this->replace_placeholder_token( $content, 'site_title', get_bloginfo( 'name' ) );

		// Field Tags.
		if ( ! empty( $form_data['variable_mapping'] ) && is_array( $form_data['variable_mapping'] ) ) {
			foreach ( $form_data['variable_mapping'] as $mapping ) {
				$var      = isset( $mapping['name'] ) ? $mapping['name'] : '';
				$input_id = isset( $mapping['input'] ) ? $mapping['input'] : '';

				if ( ! empty( $var ) && ! empty( $input_id ) ) {
					$val = '';
					foreach ( $form_entry['entry-data'] as $data ) {
						if ( $data['id'] === $input_id ) {
							$val = is_array( $data['value'] ) ? implode( ', ', $data['value'] ) : $data['value'];
							break;
						}
					}
					$content = $this->replace_placeholder_token( $content, $var, $val );
				}
			}
		}

		if ( ! empty( $form_entry['entry-data'] ) ) {
			foreach ( $form_entry['entry-data'] as $data ) {
				$id      = $data['id'];
				$value   = is_array( $data['value'] ) ? implode( ', ', $data['value'] ) : $data['value'];
				$content = $this->replace_placeholder_token( $content, $id, $value );
			}
		}

		return $content;
	}

	/**
	 * Replace a placeholder token, including variants encoded by email editors.
	 *
	 * @param string $content .
	 * @param string $name .
	 * @param mixed  $value .
	 *
	 * @return string
	 */
	private function replace_placeholder_token( $content, $name, $value ) {
		if ( '' === $name ) {
			return $content;
		}

		if ( is_array( $value ) ) {
			$value = implode( ', ', $value );
		}

		$value       = (string) $value;
		$left_brace  = '(?:\{|&#0*123;|&#x0*7b;|&lbrace;|&lcub;)';
		$right_brace = '(?:\}|&#0*125;|&#x0*7d;|&rbrace;|&rcub;)';
		$pattern     = '/' . $left_brace . $left_brace . preg_quote( $name, '/' ) . $right_brace . $right_brace . '/i';

		return preg_replace_callback(
			$pattern,
			function ( $_matches ) use ( $value ) {
				return $value;
			},
			$content
		);
	}
}
