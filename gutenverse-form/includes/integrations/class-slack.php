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
     * Send data to Slack.
     *
     * @param array $data Form data.
     * @return array|\WP_Error
     */
    public function send($data) {
        $body = [
            'text' => $this->parse_template($this->settings['content'] ?? '', $data),
        ];

        if (!empty($this->settings['username'])) {
            $body['username'] = $this->settings['username'];
        }

        if (!empty($this->settings['icon_url'])) {
            $body['icon_url'] = $this->settings['icon_url'];
        }

        return wp_remote_post($this->settings['webhookUrl'] ?? '', [
            'headers' => ['Content-Type' => 'application/json'],
            'body'    => json_encode(array_filter($body)),
        ]);
    }

    /**
     * Parse template string with data.
     *
     * @param string $template Template string.
     * @param array  $data     Form data.
     * @return string
     */
    protected function parse_template($template, $data) {
        if (empty($template)) {
            return '';
        }

        foreach ($data as $key => $value) {
            $template = str_replace('{' . $key . '}', $value, $template);
        }

        return $template;
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
        $apply_globally  = isset($global_settings['apply_globally']) ? (bool) $global_settings['apply_globally'] : false;

        $local_settings  = isset($form_setting['integrations']['slack']) ? $form_setting['integrations']['slack'] : [];
        $local_enabled   = isset($local_settings['enabled']) ? (bool) $local_settings['enabled'] : false;

        if (($global_enabled && $apply_globally) || $local_enabled) {
            $settings = array_merge($global_settings, $local_settings);
            if (!empty($settings['webhookUrl'])) {
                $this->set_settings($settings);
                $this->send($data);
            }
        }

        // 2. Process Per-Block Integrations
        if (isset($params['integrations']['actions']) && is_array($params['integrations']['actions'])) {
            foreach ($params['integrations']['actions'] as $action) {
                if ('slack' === ($action['type'] ?? '')) {
                    if (!empty($action['webhookUrl'])) {
                        $this->set_settings($action);
                        $this->send($data);
                    }
                }
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
            'webhookUrl' => [
                'label'       => __('Slack Webhook URL', 'gutenverse-form'),
                'description' => __('Enter your Slack Webhook URL', 'gutenverse-form'),
                'type'        => 'text',
                'placeholder' => __('https://hooks.slack.com/services/...', 'gutenverse-form'),
            ],
            'username'   => [
                'label'       => __('Username', 'gutenverse-form'),
                'description' => __('Enter Slack Username (Optional)', 'gutenverse-form'),
                'type'        => 'text',
                'placeholder' => __('Custom Username', 'gutenverse-form'),
            ],
            'icon_url'   => [
                'label'       => __('Icon URL', 'gutenverse-form'),
                'description' => __('Enter Slack Icon URL (Optional)', 'gutenverse-form'),
                'type'        => 'text',
                'placeholder' => __('Custom Icon URL', 'gutenverse-form'),
            ],
            'content'    => [
                'label'       => __('Content Template', 'gutenverse-form'),
                'description' => __('Use {field_id} to include form data', 'gutenverse-form'),
                'type'        => 'textarea',
                'placeholder' => __('New form entry: {name}', 'gutenverse-form'),
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
