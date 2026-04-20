import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';
import { ServerSecretControl } from './server-secret-control';

export const DiscordControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle, elementId }) => {
    return (
        <>
            <ServerSecretControl
                item={item}
                fieldKey={'webhookUrl'}
                service={'discord'}
                elementId={elementId}
                label={__('Discord Webhook URL', 'gutenverse-form')}
                required={true}
                placeholder={'https://discord.com/api/webhooks/...'}
                description={__('Stored securely on the server and not written into block content.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
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
