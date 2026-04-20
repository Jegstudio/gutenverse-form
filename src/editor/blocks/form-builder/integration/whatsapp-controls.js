import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';
import { ServerSecretControl } from './server-secret-control';

export const WhatsappControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle, elementId }) => {
    const defaultTemplate = {
        name: 'whatsapp_confirmation',
        language: 'en_US',
        category: 'confirmation',
        parameter_format: 'positional',
        components: [
            {
                type: 'body',
                text: 'Hi {{1}}! Your order number is {{2}}. Thank you.',
                example: {
                    body_text: [
                        [
                            '{input_id1}',
                            '{input_id2}'
                        ]
                    ]
                }
            }
        ]
    };

    return (
        <>
            <DebouncedTextControl
                label={__('Business Number ID', 'gutenverse-form')}
                required={true}
                value={item.business_number_id}
                onValueChange={business_number_id => {
                    onUpdateIndexValue({ ...item, business_number_id });
                    onUpdateIndexStyle({ ...item, business_number_id });
                }}
                placeholder={'1077649588754603'}
            />
            <ServerSecretControl
                item={item}
                fieldKey={'access_token'}
                service={'whatsapp'}
                elementId={elementId}
                label={__('Access Token', 'gutenverse-form')}
                required={true}
                placeholder={'EAAhYKCB...'}
                description={__('Stored securely on the server and reused for this form block.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
            />
            <DebouncedTextControl
                label={__('Recipient Number', 'gutenverse-form')}
                required={true}
                value={item.recipient}
                onValueChange={recipient => {
                    onUpdateIndexValue({ ...item, recipient });
                    onUpdateIndexStyle({ ...item, recipient });
                }}
                placeholder={__('6282237741202 or {field_id}', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Template JSON', 'gutenverse-form')}
                required={true}
                value={item.template_json || JSON.stringify(defaultTemplate, null, 2)}
                onValueChange={template_json => {
                    onUpdateIndexValue({ ...item, template_json });
                    onUpdateIndexStyle({ ...item, template_json });
                }}
                placeholder={JSON.stringify(defaultTemplate, null, 2)}
                textArea={true}
            />
        </>
    );
};
