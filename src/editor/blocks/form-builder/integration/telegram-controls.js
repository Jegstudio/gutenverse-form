import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';
import { ServerSecretControl } from './server-secret-control';

export const TelegramControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle, elementId }) => {
    return (
        <>
            <ServerSecretControl
                item={item}
                fieldKey={'botToken'}
                service={'telegram'}
                elementId={elementId}
                label={__('Bot Token', 'gutenverse-form')}
                required={true}
                placeholder={'Your Telegram Bot Token'}
                description={__('Stored securely on the server and reused for this form block.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
            />
            <DebouncedTextControl
                label={__('Chat ID', 'gutenverse-form')}
                required={true}
                value={item.chatId}
                onValueChange={chatId => {
                    onUpdateIndexValue({ ...item, chatId });
                    onUpdateIndexStyle({ ...item, chatId });
                }}
                placeholder={'Your Telegram Bot\'s Chat ID'}
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
