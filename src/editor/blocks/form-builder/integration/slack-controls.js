import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';

export const SlackControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle }) => {
    return (
        <>
            <DebouncedTextControl
                label={__('Slack Webhook URL', 'gutenverse-form')}
                required={true}
                value={item.webhook_url || item.webhookUrl}
                onValueChange={webhook_url => {
                    onUpdateIndexValue({ ...item, webhook_url });
                    onUpdateIndexStyle({ ...item, webhook_url });
                }}
                placeholder={'https://hooks.slack.com/services/...'}
            />
            <DebouncedTextControl
                label={__('Message', 'gutenverse-form')}
                required={true}
                value={item.message || item.content}
                onValueChange={message => {
                    onUpdateIndexValue({ ...item, message });
                    onUpdateIndexStyle({ ...item, message });
                }}
                placeholder={__('Hello, World!', 'gutenverse-form')}
                textArea={true}
            />
        </>
    );
};
