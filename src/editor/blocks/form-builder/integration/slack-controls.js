import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';
import { ServerSecretControl } from './server-secret-control';

export const SlackControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle, elementId }) => {
    return (
        <>
            <ServerSecretControl
                item={item}
                fieldKey={'webhook_url'}
                service={'slack'}
                elementId={elementId}
                label={__('Slack Webhook URL', 'gutenverse-form')}
                required={true}
                placeholder={'https://hooks.slack.com/services/...'}
                description={__('Stored securely on the server and reused for this form block.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
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
