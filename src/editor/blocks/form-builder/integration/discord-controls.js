import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';

export const DiscordControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle }) => {
    return (
        <>
            <DebouncedTextControl
                label={__('Discord Webhook URL', 'gutenverse-form')}
                required={true}
                value={item.webhookUrl}
                onValueChange={webhookUrl => {
                    onUpdateIndexValue({ ...item, webhookUrl });
                    onUpdateIndexStyle({ ...item, webhookUrl });
                }}
                placeholder={'https://discord.com/api/webhooks/...'}
            />
            <DebouncedTextControl
                label={__('Username', 'gutenverse-form')}
                value={item.username}
                onValueChange={username => {
                    onUpdateIndexValue({ ...item, username });
                    onUpdateIndexStyle({ ...item, username });
                }}
                placeholder={__('Custom Username', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Avatar URL', 'gutenverse-form')}
                value={item.avatar_url}
                onValueChange={avatar_url => {
                    onUpdateIndexValue({ ...item, avatar_url });
                    onUpdateIndexStyle({ ...item, avatar_url });
                }}
                placeholder={'https://...'}
            />
            <DebouncedTextControl
                label={__('Content', 'gutenverse-form')}
                required={true}
                value={item.content}
                onValueChange={content => {
                    onUpdateIndexValue({ ...item, content });
                    onUpdateIndexStyle({ ...item, content });
                }}
                placeholder={__('Message content...', 'gutenverse-form')}
                textArea={true}
            />
        </>
    );
};
