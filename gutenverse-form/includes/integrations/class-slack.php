<?php
namespace Gutenverse_Form\Integrations;

class Slack {
    /**
     * Integration settings.
     *
     * @var array
     */
    protected $settings;

    /**
     * Set settings for Slack.
     *
     * @param array $settings Integration settings.
     */
    public function set_settings($settings) {
        $this->settings = $settings;
    }

    /**
     * Get Slack webhook URL from integration settings.
     *
     * @return string
     */
    private function get_webhook_url() {
        return $this->settings['webhook_url'] ?? $this->settings['webhookUrl'] ?? '';
    }

    /**
     * Get Slack message from integration settings.
     *
     * @param array $data Form data.
     * @param int   $entry_id Entry ID.
     * @param int   $form_id Form ID.
     * @return string
     */
    private function get_message($data, $entry_id, $form_id) {
        $message = $this->settings['message'] ?? $this->settings['content'] ?? '';

        return \Gutenverse_Form\Integration::parse_template($message, $data, $entry_id, $form_id);
    }

    /**
     * Send data to Slack.
     *
     * @param array $data Form data.
     * @param int $entry_id Entry ID.
     * @param int $form_id Form ID.
     * @return array|\WP_Error
     */
    public function send($data, $entry_id = 0, $form_id = 0) {
        $webhook_url = $this->get_webhook_url();
        $message     = $this->get_message($data, $entry_id, $form_id);

        if (empty($webhook_url) || empty($message)) {
            return false;
        }

        $body = [
            'text' => $message,
        ];

        return wp_remote_post($webhook_url, [
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => wp_json_encode($body),
        ]);
    }

    /**
     * Slack Constructor.
     */
    public function __construct() {
        add_action('gutenverse_form_after_store', array($this, 'after_store'), 10, 4);
    }

    /**
     * Triggered after form data is stored.
     *
     * @param int|string $entry_id     Entry ID.
     * @param array      $params       Form parameters.
     * @param array      $form_setting Form settings.
     * @param object     $request      REST request object.
     */
    public function after_store($entry_id, $params, $form_setting, $request) {
        // Prepare form data for template parsing
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
        $global_settings = get_option('gutenverse_form_slack_settings', []);
        $global_enabled  = !empty($options['slack']);
        $has_request_actions = \Gutenverse_Form\Integration::request_has_integration_actions($params);
        $actions = \Gutenverse_Form\Integration::get_service_actions('slack', $params, $form_setting);

        if ($global_enabled && !$has_request_actions) {
            if (!empty($global_settings['webhook_url']) || !empty($global_settings['webhookUrl'])) {
                $this->set_settings($global_settings);
                \Gutenverse_Form\Integration::handle_send_result($entry_id, 'slack', $this->send($data, $entry_id, $params['form-id']));
            }
        }

        // 2. Process Per-Block Integrations
        foreach ($actions as $action) {
            if (!empty($action['webhook_url']) || !empty($action['webhookUrl'])) {
                $this->set_settings($action);
                \Gutenverse_Form\Integration::handle_send_result($entry_id, 'slack', $this->send($data, $entry_id, $params['form-id']));
            }
        }
    }

    /**
     * Get fields for Slack integration.
     *
     * @return array
     */
    public function get_fields() {
        return [
            'webhook_url' => [
                'label'       => __('Slack Webhook URL', 'gutenverse-form'),
                'description' => __('Enter your Slack Webhook URL', 'gutenverse-form'),
                'required'    => true,
                'type'        => 'text',
                'sensitive'   => true,
                'placeholder' => __('https://hooks.slack.com/services/...', 'gutenverse-form'),
            ],
            'message'     => [
                'label'       => __('Message', 'gutenverse-form'),
                'description' => __('Enter the Slack message. Use {field_id} to include form data.', 'gutenverse-form'),
                'required'    => true,
                'type'        => 'textarea',
                'placeholder' => __("User has submitted a form\nName={input-text-name}\nEmail={input-email}\nMessage={input-textarea}", 'gutenverse-form'),
            ],
        ];
    }

    /**
     * Get saved settings for Slack.
     *
     * @return array
     */
    public function get_settings() {
        return get_option('gutenverse_form_slack_settings', []);
    }
}
