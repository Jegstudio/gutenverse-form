import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';
import { ServerSecretControl } from './server-secret-control';

export const WebhookControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle, elementId }) => {
    return (
        <>
            <ServerSecretControl
                item={item}
                fieldKey={'webhookUrl'}
                service={'webhook'}
                elementId={elementId}
                label={__('Webhook URL', 'gutenverse-form')}
                required={true}
                placeholder={'https://example.com/wp-json/my-site/v1/form-webhook'}
                description={__('Stored securely on the server and reused for this form block.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
            />
            <ServerSecretControl
                item={item}
                fieldKey={'signingSecret'}
                service={'webhook'}
                elementId={elementId}
                label={__('Signing Secret', 'gutenverse-form')}
                placeholder={__('your-shared-webhook-secret', 'gutenverse-form')}
                description={__('Stored securely on the server and reused for this form block.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
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
