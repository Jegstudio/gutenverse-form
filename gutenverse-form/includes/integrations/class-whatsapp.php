<?php
/**
 * WhatsApp Integration Class.
 *
 * @package Gutenverse_Form
 */

namespace Gutenverse_Form\Integrations;

class Whatsapp {
    /**
     * Integration settings.
     *
     * @var array
     */
    protected $settings;

    /**
     * Set settings for WhatsApp.
     *
     * @param array $settings Integration settings.
     */
    public function set_settings($settings) {
        $this->settings = $settings;
    }

    /**
     * Get fields for WhatsApp.
     *
     * @return array
     */
    public function get_fields() {
        return array(
            'business_number_id' => array(
                'label'       => __( 'Business Number ID', 'gutenverse-form' ),
                'description' => __( 'Enter your WhatsApp Business Number ID', 'gutenverse-form' ),
                'type'        => 'text',
                'placeholder' => '1077649588754603',
            ),
            'access_token'       => array(
                'label'       => __( 'Access Token', 'gutenverse-form' ),
                'description' => __( 'Enter your WhatsApp Access Token', 'gutenverse-form' ),
                'type'        => 'text',
                'placeholder' => 'EAAhYKCB...',
            ),
            'recipient'          => array(
                'label'       => __( 'Recipient Number', 'gutenverse-form' ),
                'description' => __( 'Enter recipient phone number or {field_id}', 'gutenverse-form' ),
                'type'        => 'text',
                'placeholder' => '6282237741202',
            ),
            'template_json'      => array(
                'label'       => __( 'Template JSON', 'gutenverse-form' ),
                'description' => __( 'Enter the WhatsApp template JSON', 'gutenverse-form' ),
                'type'        => 'textarea',
                'placeholder' => '{ "name": "order_confirmation", ... }',
            ),
        );
    }

    /**
     * Get saved settings.
     *
     * @return array
     */
    public function get_settings() {
        return get_option('gutenverse_form_whatsapp_settings', []);
    }

    /**
     * Send data to WhatsApp Cloud API.
     *
     * @param array $data Form data.
     * @param int $entry_id Entry ID.
     * @param int $form_id Form ID.
     * @return array|\WP_Error
     */
    public function send($data, $entry_id = 0, $form_id = 0) {
        $business_id  = $this->settings['business_number_id'] ?? '';
        $access_token = $this->settings['access_token'] ?? '';
        $recipient    = \Gutenverse_Form\Integration::parse_template($this->settings['recipient'] ?? '', $data, $entry_id, $form_id);
        
        if (empty($business_id) || empty($access_token) || empty($recipient)) {
            return false;
        }

        $template_json = $this->settings['template_json'] ?? '';
        if (empty($template_json)) {
            return false;
        }

        // Replace placeholders in JSON string
        $template_json = \Gutenverse_Form\Integration::parse_template($template_json, $data, $entry_id, $form_id);
        $template_data = json_decode($template_json, true);

        if (!$template_data) {
            return false;
        }

        /**
         * Normalization for custom positional format.
         * If 'parameter_format' is set to 'positional', we transform it to Meta's expected format.
         */
        if (isset($template_data['parameter_format']) && $template_data['parameter_format'] === 'positional') {
            $normalized = [
                'name'     => $template_data['name'] ?? '',
                'language' => [
                    'code' => is_array($template_data['language'] ?? null) ? ($template_data['language']['code'] ?? 'en_US') : ($template_data['language'] ?? 'en_US')
                ],
                'components' => []
            ];

            if (isset($template_data['components']) && is_array($template_data['components'])) {
                foreach ($template_data['components'] as $component) {
                    $new_comp = ['type' => $component['type'] ?? 'body'];
                    if (isset($component['example']['body_text'][0]) && is_array($component['example']['body_text'][0])) {
                        $parameters = [];
                        foreach ($component['example']['body_text'][0] as $text) {
                            $parameters[] = ['type' => 'text', 'text' => (string)$text];
                        }
                        $new_comp['parameters'] = $parameters;
                    }
                    $normalized['components'][] = $new_comp;
                }
            }
            $template_data = $normalized;
        }

        $body = [
            'messaging_product' => 'whatsapp',
            'to'                => preg_replace('/[^0-9]/', '', $recipient),
            'type'              => 'template',
            'template'          => $template_data
        ];

        $url = "https://graph.facebook.com/v22.0/{$business_id}/messages";

        return wp_remote_post($url, [
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
                'Content-Type'  => 'application/json'
            ],
            'body'    => json_encode($body)
        ]);
    }

    /**
     * Whatsapp Constructor.
     */
    public function __construct() {
        add_action('gutenverse_form_after_store', array($this, 'after_store'), 10, 4);
    }

    /**
     * Triggered after form data is stored.
     */
    public function after_store($entry_id, $params, $form_setting, $request) {
        $data = [];
        if (isset($params['entry-data']) && is_array($params['entry-data'])) {
            foreach ($params['entry-data'] as $item) {
                if (isset($item['id']) && isset($item['value'])) {
                    $value = $item['value'];
                    if (is_array($value)) {
                        $value = implode(', ', $value);
                    }
                    $data[$item['id']] = $value;
                }
            }
        }

        // 1. Process Global & Per-Form Action Settings
        $options         = get_option('gutenverse_form_integrations', []);
        $global_settings = get_option('gutenverse_form_whatsapp_settings', []);
        $global_enabled  = !empty($options['whatsapp']);
        $apply_globally  = isset($global_settings['apply_globally']) ? (bool) $global_settings['apply_globally'] : false;

        $local_settings  = isset($form_setting['integrations']['whatsapp']) ? $form_setting['integrations']['whatsapp'] : [];
        $local_enabled   = isset($local_settings['enabled']) ? (bool) $local_settings['enabled'] : false;

        if (($global_enabled && $apply_globally) || $local_enabled) {
            $settings = array_merge($global_settings, $local_settings);
            $this->set_settings($settings);
            $this->send($data, $entry_id, $params['form-id']);
        }

        // 2. Process Per-Block Integrations
        if (isset($params['integrations']['actions']) && is_array($params['integrations']['actions'])) {
            foreach ($params['integrations']['actions'] as $action) {
                if ('whatsapp' === ($action['type'] ?? '')) {
                    $this->set_settings($action);
                    $this->send($data, $entry_id, $params['form-id']);
                }
            }
        }
    }
}
