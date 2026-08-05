<?php
/**
 * Akismet integration service.
 *
 * @author Jegstudio
 * @since 3.0.0
 * @package gutenverse-form
 */

namespace Gutenverse_Form;

/**
 * Class Akismet_Service
 *
 * @package gutenverse-form
 */
class Akismet_Service {
	/**
	 * Provider slug.
	 *
	 * @var string
	 */
	const PROVIDER = 'akismet';

	/**
	 * Check a submission against Akismet when the plugin is active and configured.
	 *
	 * @param array  $params Submission params.
	 * @param array  $form_entry Original frontend form entry payload.
	 * @param object $request REST request object.
	 *
	 * @return array
	 */
	public static function check_submission( $params, $form_entry, $request ) {
		$enabled = (bool) apply_filters( 'gutenverse_form_akismet_enabled', true, $params, $form_entry, $request );

		if ( ! $enabled ) {
			return self::build_result( 'disabled', false, 'Akismet checks are disabled.' );
		}

		if ( ! class_exists( 'Akismet' ) || ! method_exists( 'Akismet', 'comment_check' ) ) {
			return self::build_result( 'unavailable', false, 'Akismet plugin is not active.' );
		}

		if ( ! method_exists( 'Akismet', 'get_api_key' ) || ! \Akismet::get_api_key() ) {
			return self::build_result( 'unavailable', false, 'Akismet is active but not configured.' );
		}

		$payload = self::build_payload( $params, $form_entry, $request );
		$payload = apply_filters( 'gutenverse_form_akismet_payload', $payload, $params, $form_entry, $request );

		$response = \Akismet::comment_check( $payload );

		if ( false === $response ) {
			return self::build_result( 'unknown', false, 'Akismet check could not be completed.', $payload );
		}

		$is_spam         = false;
		$is_blatant_spam = false;
		$pro_tip         = '';

		if ( is_object( $response ) ) {
			$is_spam         = ! empty( $response->is_spam );
			$is_blatant_spam = ! empty( $response->is_blatant_spam );
			$pro_tip         = isset( $response->pro_tip ) && is_scalar( $response->pro_tip ) ? sanitize_text_field( wp_unslash( (string) $response->pro_tip ) ) : '';
		} elseif ( is_array( $response ) ) {
			$is_spam         = ! empty( $response['is_spam'] );
			$is_blatant_spam = ! empty( $response['is_blatant_spam'] );
			$pro_tip         = isset( $response['pro_tip'] ) && is_scalar( $response['pro_tip'] ) ? sanitize_text_field( wp_unslash( (string) $response['pro_tip'] ) ) : '';
		} elseif ( is_string( $response ) ) {
			$normalized_response = strtolower( trim( $response ) );

			if ( 'true' === $normalized_response ) {
				$is_spam = true;
			} elseif ( 'false' === $normalized_response ) {
				$is_spam = false;
			} else {
				return self::build_result( 'unknown', false, 'Akismet returned an unexpected response.', $payload );
			}
		} else {
			$is_spam = ! empty( $response );
		}

		$result = self::build_result(
			$is_spam ? 'spam' : 'ham',
			$is_spam,
			$is_spam ? 'Akismet marked this submission as spam.' : 'Akismet cleared this submission.',
			$payload
		);

		$result['is_blatant_spam'] = $is_blatant_spam || 'discard' === $pro_tip;
		$result['pro_tip']         = $pro_tip;

		return apply_filters( 'gutenverse_form_akismet_result', $result, $response, $payload, $params, $form_entry, $request );
	}

	/**
	 * Build an Akismet-compatible payload from the submission.
	 *
	 * @param array  $params Submission params.
	 * @param array  $form_entry Original frontend form entry payload.
	 * @param object $request REST request object.
	 *
	 * @return array
	 */
	private static function build_payload( $params, $form_entry, $request ) {
		$entry_data     = ! empty( $params['entry-data'] ) && is_array( $params['entry-data'] ) ? $params['entry-data'] : array();
		$remote_addr    = sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ?? '' ) );
		$user_agent     = sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ?? '' ) );
		$referrer       = esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ?? '' ) );
		$post_id        = isset( $params['post-id'] ) ? absint( $params['post-id'] ) : 0;
		$form_id        = isset( $params['form-id'] ) ? absint( $params['form-id'] ) : 0;
		$permalink      = $post_id ? get_permalink( $post_id ) : '';
		$author_name    = self::find_first_value_by_types( $entry_data, array( 'text', 'telp' ), array( 'name', 'full_name', 'fullname', 'first_name', 'firstname' ) );
		$author_email   = self::find_first_value_by_types( $entry_data, array( 'email' ) );
		$author_url     = self::find_first_url_value( $entry_data );
		$message        = self::build_comment_content( $entry_data );
		$submit_time_ms = absint( $request->get_param( 'gutenverse-form-elapsed' ) );

		if ( ! $author_name && is_user_logged_in() ) {
			$author_name = wp_get_current_user()->display_name;
		}

		if ( ! $author_email && is_user_logged_in() ) {
			$author_email = wp_get_current_user()->user_email;
		}

		$payload = array(
			'blog'                 => home_url( '/' ),
			'blog_lang'            => get_locale(),
			'blog_charset'         => get_option( 'blog_charset' ),
			'user_ip'              => $remote_addr,
			'user_agent'           => $user_agent,
			'referrer'             => $referrer,
			'permalink'            => $permalink ? $permalink : home_url( '/' ),
			'comment_type'         => 'contact-form',
			'comment_author'       => $author_name,
			'comment_author_email' => $author_email,
			'comment_author_url'   => $author_url,
			'comment_content'      => $message,
			'comment_context'      => array_filter(
				array(
					'gutenverse-form',
					$form_id ? 'form-' . $form_id : '',
					$post_id ? 'post-' . $post_id : '',
				)
			),
			'form_id'              => (string) $form_id,
			'post_id'              => (string) $post_id,
			'submitted_from'       => isset( $form_entry['integrationSource'] ) && is_scalar( $form_entry['integrationSource'] ) ? sanitize_text_field( wp_unslash( (string) $form_entry['integrationSource'] ) ) : '',
			'submit_uri'           => isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( home_url( wp_unslash( $_SERVER['REQUEST_URI'] ) ) ) : '',
			'submit_referer'       => $referrer,
			'user_role'            => is_user_logged_in() ? implode( ',', (array) wp_get_current_user()->roles ) : '',
			'is_test'              => defined( 'WP_DEBUG' ) && WP_DEBUG ? 'true' : '',
		);

		if ( $submit_time_ms > 0 ) {
			$payload['comment_meta'] = array(
				'gutenverse_form_elapsed_ms' => $submit_time_ms,
			);
		}

		return $payload;
	}

	/**
	 * Build a normalized result payload for entry storage and flow control.
	 *
	 * @param string $status Result status.
	 * @param bool   $is_spam Whether the submission is spam.
	 * @param string $message Human-readable reason.
	 * @param array  $payload Optional request payload.
	 *
	 * @return array
	 */
	private static function build_result( $status, $is_spam, $message, $payload = array() ) {
		return array(
			'provider'        => self::PROVIDER,
			'status'          => sanitize_key( (string) $status ),
			'is_spam'         => (bool) $is_spam,
			'is_blatant_spam' => false,
			'message'         => sanitize_text_field( $message ),
			'checked_at'      => gmdate( 'c' ),
			'payload'         => self::summarize_payload( $payload ),
		);
	}

	/**
	 * Summarize payload fields without duplicating the entire submission body in entry meta.
	 *
	 * @param array $payload Akismet payload.
	 *
	 * @return array
	 */
	private static function summarize_payload( $payload ) {
		if ( empty( $payload ) || ! is_array( $payload ) ) {
			return array();
		}

		return array_filter(
			array(
				'comment_type'         => isset( $payload['comment_type'] ) ? sanitize_text_field( (string) $payload['comment_type'] ) : '',
				'comment_author'       => isset( $payload['comment_author'] ) ? sanitize_text_field( (string) $payload['comment_author'] ) : '',
				'comment_author_email' => isset( $payload['comment_author_email'] ) ? sanitize_email( (string) $payload['comment_author_email'] ) : '',
				'comment_author_url'   => isset( $payload['comment_author_url'] ) ? esc_url_raw( (string) $payload['comment_author_url'] ) : '',
				'permalink'            => isset( $payload['permalink'] ) ? esc_url_raw( (string) $payload['permalink'] ) : '',
			)
		);
	}

	/**
	 * Find the first matching entry value by known field types or ids.
	 *
	 * @param array $entry_data Submission data rows.
	 * @param array $types Accepted field types.
	 * @param array $id_hints Accepted field ID fragments.
	 *
	 * @return string
	 */
	private static function find_first_value_by_types( $entry_data, $types = array(), $id_hints = array() ) {
		foreach ( $entry_data as $item ) {
			$type  = isset( $item['type'] ) ? sanitize_key( (string) $item['type'] ) : '';
			$id    = isset( $item['id'] ) ? sanitize_key( (string) $item['id'] ) : '';
			$value = self::normalize_value( isset( $item['value'] ) ? $item['value'] : '' );

			if ( '' === $value ) {
				continue;
			}

			if ( ! empty( $types ) && in_array( $type, $types, true ) ) {
				return $value;
			}

			foreach ( $id_hints as $hint ) {
				if ( false !== strpos( $id, sanitize_key( (string) $hint ) ) ) {
					return $value;
				}
			}
		}

		return '';
	}

	/**
	 * Find the first URL-like field in the entry data.
	 *
	 * @param array $entry_data Submission data rows.
	 *
	 * @return string
	 */
	private static function find_first_url_value( $entry_data ) {
		foreach ( $entry_data as $item ) {
			$value = self::normalize_value( isset( $item['value'] ) ? $item['value'] : '' );

			if ( '' !== $value && filter_var( $value, FILTER_VALIDATE_URL ) ) {
				return esc_url_raw( $value );
			}
		}

		return '';
	}

	/**
	 * Build the message body that Akismet will inspect.
	 *
	 * @param array $entry_data Submission data rows.
	 *
	 * @return string
	 */
	private static function build_comment_content( $entry_data ) {
		$lines = array();

		foreach ( $entry_data as $item ) {
			$id    = isset( $item['id'] ) ? sanitize_key( (string) $item['id'] ) : 'field';
			$value = self::normalize_value( isset( $item['value'] ) ? $item['value'] : '' );

			if ( '' === $value ) {
				continue;
			}

			$lines[] = $id . ': ' . $value;
		}

		return implode( "\n", $lines );
	}

	/**
	 * Normalize an entry value for comparisons and payload output.
	 *
	 * @param mixed $value Entry value.
	 *
	 * @return string
	 */
	private static function normalize_value( $value ) {
		if ( is_array( $value ) ) {
			$value = implode( ', ', array_map( 'strval', $value ) );
		}

		if ( is_bool( $value ) ) {
			$value = $value ? '1' : '0';
		}

		return trim( sanitize_textarea_field( (string) $value ) );
	}
}
