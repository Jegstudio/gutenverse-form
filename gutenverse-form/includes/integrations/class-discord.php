<?php

/**
 * Discord class
 *
 * @author Jegstudio
 * @since 2.6.0
 * @package gutenverse-form
 */

namespace Gutenverse_Form\Integrations;

/**
 * Class Discord
 *
 * @package gutenverse-form
 */
class Discord {
	/**
	 * Integration settings.
	 *
	 * @var array
	 */
	protected $settings;

	/**
	 * Set settings for Discord.
	 *
	 * @param array $settings Integration settings.
	 */
	public function set_settings( $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Send data to Discord.
	 *
	 * @param array $data Form data.
	 * @param int   $entry_id Entry ID.
	 * @param int   $form_id Form ID.
	 * @return array|\WP_Error
	 */
	public function send( $data, $entry_id = 0, $form_id = 0 ) {
		$webhook_url = esc_url_raw( $this->settings['webhookUrl'] ?? '', array( 'https' ) );
		$allowed_hosts = array( 'discord.com', 'discordapp.com', 'canary.discord.com', 'ptb.discord.com' );
		$host = strtolower( (string) wp_parse_url( $webhook_url, PHP_URL_HOST ) );
		$body = array(
			'content'    => \Gutenverse_Form\Integration::parse_template( $this->settings['content'] ?? '', $data, $entry_id, $form_id ),
			'username'   => $this->settings['username'] ?? '',
			'avatar_url' => $this->settings['avatar_url'] ?? '',
		);

		$is_allowed_host = false;
		foreach ( $allowed_hosts as $allowed_host ) {
			if ( $host === $allowed_host || substr( $host, -strlen( '.' . $allowed_host ) ) === '.' . $allowed_host ) {
				$is_allowed_host = true;
				break;
			}
		}

		if ( empty( $webhook_url ) || empty( trim( $body['content'] ) ) || ! $is_allowed_host ) {
			return false;
		}

		return wp_remote_post(
			$webhook_url,
			array(
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode( array_filter( $body ) ),
			)
		);
	}

	/**
	 * Discord Constructor.
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
		$data            = \Gutenverse_Form\Integration::prepare_entry_data( $params );
		$options         = get_option( 'gutenverse_form_integrations', array() );
		$global_settings = get_option( 'gutenverse_form_discord_settings', array() );
		$global_enabled  = ! empty( $options['discord'] );
		$apply_globally  = isset( $global_settings['apply_globally'] ) ? (bool) $global_settings['apply_globally'] : false;
		$has_local_config = \Gutenverse_Form\Integration::has_local_service_config( 'discord', $form_setting );
		$local_settings   = \Gutenverse_Form\Integration::get_local_service_settings( 'discord', $form_setting );
		$local_enabled    = isset( $local_settings['enabled'] ) ? (bool) $local_settings['enabled'] : false;

		if ( $global_enabled && $apply_globally && ! $has_local_config ) {
			$settings = array_merge( $global_settings, $local_settings );
			if ( ! empty( $settings['webhookUrl'] ) ) {
				$this->set_settings( $settings );
				\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'discord', $this->send( $data, $entry_id, $params['form-id'] ) );
			}
		}

		if ( $local_enabled ) {
			$settings = array_merge( $global_settings, $local_settings );
			if ( ! empty( $settings['webhookUrl'] ) ) {
				$this->set_settings( $settings );
				\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'discord', $this->send( $data, $entry_id, $params['form-id'] ) );
			}
		}

		foreach ( \Gutenverse_Form\Integration::get_service_actions( 'discord', $params, $form_setting ) as $action ) {
			if ( ! empty( $action['webhookUrl'] ) ) {
				$this->set_settings( $action );
				\Gutenverse_Form\Integration::handle_send_result( $entry_id, 'discord', $this->send( $data, $entry_id, $params['form-id'] ) );
			}
		}
	}

	/**
	 * Get fields for Discord integration.
	 *
	 * @return array
	 */
	public function get_fields() {
		return array(
			'webhookUrl' => array(
				'label'       => __( 'Discord Webhook URL', 'gutenverse-form' ),
				'description' => __( 'Enter your Discord Webhook URL', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'text',
				'placeholder' => __( 'https://discord.com/api/webhooks/...', 'gutenverse-form' ),
			),
			'username'   => array(
				'label'       => __( 'Username', 'gutenverse-form' ),
				'description' => __( 'Enter Discord Username (Optional)', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( 'Custom Username', 'gutenverse-form' ),
			),
			'avatar_url' => array(
				'label'       => __( 'Avatar URL', 'gutenverse-form' ),
				'description' => __( 'Enter Discord Avatar URL (Optional)', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( 'Custom Avatar URL', 'gutenverse-form' ),
			),
			'content'    => array(
				'label'       => __( 'Content Template', 'gutenverse-form' ),
				'description' => __( 'Use {field_id} to include form data', 'gutenverse-form' ),
				'required'    => true,
				'type'        => 'textarea',
				'placeholder' => __( 'New form entry: {name}', 'gutenverse-form' ),
			),
		);
	}

	/**
	 * Get saved settings for Discord.
	 *
	 * @return array
	 */
	public function get_settings() {
		return get_option( 'gutenverse_form_discord_settings', array() );
	}
}
