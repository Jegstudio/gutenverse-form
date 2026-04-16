import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';

export const TelegramControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle }) => {
    return (
        <>
            <DebouncedTextControl
                label={__('Bot Token', 'gutenverse-form')}
                required={true}
                value={item.botToken}
                onValueChange={botToken => {
                    onUpdateIndexValue({ ...item, botToken });
                    onUpdateIndexStyle({ ...item, botToken });
                }}
                placeholder={'Your Telegram Bot Token'}
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
