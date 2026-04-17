<?php

/**
 * Telegram class
 *
 * @author Jegstudio
 * @since 2.6.0
 * @package gutenverse-form
 */

namespace Gutenverse_Form\Integrations;

/**
 * Class Telegram
 *
 * @package gutenverse-form
 */
class Telegram {
	/**
	 * Integration settings.
	 *
	 * @var array
	 */
	protected $settings;

	/**
	 * Set settings for Telegram.
	 *
	 * @param array $settings Integration settings.
	 */
	public function set_settings( $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Send data to Telegram.
	 *
	 * @param array $data Form data.
	 * @param int   $entry_id Entry ID.
	 * @param int   $form_id Form ID.
	 * @return array|\WP_Error|false
	 */
	public function send( $data, $entry_id = 0, $form_id = 0 ) {
		$bot_token = $this->settings['botToken'] ?? $this->settings['bot_token'] ?? '';
		$chat_id   = \Gutenverse_Form\Integration::parse_template( $this->settings['chatId'] ?? $this->settings['chat_id'] ?? '', $data, $entry_id, $form_id );
		$content = ! empty( $this->settings['content'] )
			? $this->settings['content']
			: __( "New form submission:\n{all_fields}", 'gutenverse-form' );
		$text    = \Gutenverse_Form\Integration::parse_template( $content, $data, $entry_id, $form_id );

		if ( empty( $bot_token ) || empty( $chat_id ) || empty( $text ) ) {
			return false;
		}

		$body = array(
			'chat_id' => $chat_id,
			'text'    => $text,
		);

		return wp_remote_post(
			"https://api.telegram.org/bot{$bot_token}/sendMessage",
			array(
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode( $body ),
			)
		);
	}

	/**
	 * Telegram Constructor.
	 */
	public function __construct() {
		add_action( 'gutenverse_form_after_store', array( $this, 'after_store' ), 10, 4 );
	}

	/**
	 * Triggered after form data is stored.
	 *
	 * @param int|string $entry_id     Entry ID.
	 * @param array      $params       Form parameters.
	 * @param array      $form_setting Form settings.
	 * @param object     $request      REST request object.
	 */
	public function after_store( $entry_id, $params, $form_setting, $request ) {
		$data = array();

		if ( isset( $params['entry-data'] ) && is_array( $params['entry-data'] ) ) {
			foreach ( $params['entry-data'] as $item ) {
				if ( isset( $item['id'] ) && isset( $item['value'] ) ) {
					$value = $item['value'];

					if ( is_array( $value ) ) {
						$value = implode( ', ', $value );
					}

					$data[ $item['id'] ] = $value;
				}
			}
		}

		$form_id = $params['form-id'] ?? 0;

		// 1. Process Global & Per-Form Action Settings.
		$options         = get_option( 'gutenverse_form_integrations', array() );
		$global_settings = get_option( 'gutenverse_form_telegram_settings', array() );
		$global_enabled  = ! empty( $options['telegram'] );
		$apply_globally  = isset( $global_settings['apply_globally'] ) ? (bool) $global_settings['apply_globally'] : false;

		$local_settings = isset( $form_setting['integrations']['telegram'] ) ? $form_setting['integrations']['telegram'] : array();
		$local_enabled  = isset( $local_settings['enabled'] ) ? (bool) $local_settings['enabled'] : false;

		if ( ( $global_enabled && $apply_globally ) || $local_enabled ) {
			$settings = array_merge( $global_settings, $local_settings );

			if ( $this->has_required_settings( $settings ) ) {
				$this->set_settings( $settings );
				$this->send( $data, $entry_id, $form_id );
			}
		}

		// 2. Process Per-Block Integrations.
		if ( isset( $params['integrations']['actions'] ) && is_array( $params['integrations']['actions'] ) ) {
			foreach ( $params['integrations']['actions'] as $action ) {
				if ( 'telegram' !== ( $action['type'] ?? '' ) ) {
					continue;
				}

				// Merge global settings as base, then override with any non-empty per-block values.
				$settings = $global_settings;
				foreach ( $action as $key => $value ) {
					if ( ! empty( $value ) ) {
						$settings[ $key ] = $value;
					}
				}

				if ( $this->has_required_settings( $settings ) ) {
					$this->set_settings( $settings );
					$this->send( $data, $entry_id, $form_id );
				}
			}
		}
	}

	/**
	 * Check required Telegram settings.
	 *
	 * @param array $settings Integration settings.
	 * @return bool
	 */
	protected function has_required_settings( $settings ) {
		$bot_token = $settings['botToken'] ?? $settings['bot_token'] ?? '';
		$chat_id   = $settings['chatId'] ?? $settings['chat_id'] ?? '';

		return ! empty( $bot_token ) && ! empty( $chat_id );
	}

	/**
	 * Get fields for Telegram integration.
	 *
	 * @return array
	 */
	public function get_fields() {
		return array(
			'botToken'  => array(
				'label'       => __( 'Bot Token', 'gutenverse-form' ),
				'description' => __( 'Enter your Telegram bot token from BotFather', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( '123456789:ABCDEF...', 'gutenverse-form' ),
			),
			'chatId'    => array(
				'label'       => __( 'Chat ID', 'gutenverse-form' ),
				'description' => __( 'Enter the Telegram chat ID or use {field_id}', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( '-1001234567890', 'gutenverse-form' ),
			),
			'content'   => array(
				'label'       => __( 'Content Template', 'gutenverse-form' ),
				'description' => __( 'Use {field_id}, {all_fields}, {form_id}, {entry_id}, {form_title}, or {site_title}', 'gutenverse-form' ),
				'type'        => 'textarea',
				'placeholder' => __( "New form submission:\n{all_fields}", 'gutenverse-form' ),
			),
		);
	}

	/**
	 * Get saved settings for Telegram.
	 *
	 * @return array
	 */
	public function get_settings() {
		return get_option( 'gutenverse_form_telegram_settings', array() );
	}
}
