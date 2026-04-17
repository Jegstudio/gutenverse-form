import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';

export const WebhookControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle }) => {
    return (
        <>
            <DebouncedTextControl
                label={__('Webhook URL', 'gutenverse-form')}
                required={true}
                value={item.webhookUrl || item.webhook_url}
                onValueChange={webhookUrl => {
                    onUpdateIndexValue({ ...item, webhookUrl });
                    onUpdateIndexStyle({ ...item, webhookUrl });
                }}
                placeholder={'https://example.com/wp-json/my-site/v1/form-webhook'}
            />
            <DebouncedTextControl
                label={__('Content Template', 'gutenverse-form')}
                value={item.content}
                onValueChange={content => {
                    onUpdateIndexValue({ ...item, content });
                    onUpdateIndexStyle({ ...item, content });
                }}
                placeholder={__('New form submission:\n{all_fields}', 'gutenverse-form')}
                textArea={true}
            />
        </>
    );
};
