<?php
/**
 * WhatsApp Integration Class.
 *
 * @package Gutenverse_Form
 */

namespace Gutenverse_Form\Integrations;

/**
 * WhatsApp Integration Class.
 */
class Whatsapp {
	/**
	 * Get fields for WhatsApp.
	 *
	 * @return array
	 */
	public function get_fields() {
		return array(
			'number'  => array(
				'label'       => __( 'WhatsApp Number', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( 'Example: 628123456789', 'gutenverse-form' ),
			),
			'api_key' => array(
				'label'       => __( 'API Key', 'gutenverse-form' ),
				'type'        => 'text',
				'placeholder' => __( 'Enter your WhatsApp API Key', 'gutenverse-form' ),
			),
		);
	}

	/**
	 * Get saved settings.
	 *
	 * @return array
	 */
	public function get_settings() {
		return get_option(
			'gutenverse_form_whatsapp_settings',
			array(
				'number'  => '',
				'api_key' => '',
			)
		);
	}

	/**
	 * Init Whatsapp integration
	 */
	public function __construct() {
		// Init Whatsapp integration.
	}
}
