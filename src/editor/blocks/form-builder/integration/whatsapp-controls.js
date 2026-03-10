import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';

export const WhatsappControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle }) => {
    const defaultTemplate = {
        name: "whatsapp_confirmation",
        language: "en_US",
        category: "confirmation",
        parameter_format: "positional",
        components: [
            {
                type: "body",
                text: "Hi {{1}}! Your order number is {{2}}. Thank you.",
                example: {
                    body_text: [
                        [
                            "{input_id1}",
                            "{input_id2}"
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
                value={item.business_number_id}
                onValueChange={business_number_id => {
                    onUpdateIndexValue({ ...item, business_number_id });
                    onUpdateIndexStyle({ ...item, business_number_id });
                }}
                placeholder={'1077649588754603'}
            />
            <DebouncedTextControl
                label={__('Access Token', 'gutenverse-form')}
                value={item.access_token}
                onValueChange={access_token => {
                    onUpdateIndexValue({ ...item, access_token });
                    onUpdateIndexStyle({ ...item, access_token });
                }}
                placeholder={'EAAhYKCB...'}
            />
            <DebouncedTextControl
                label={__('Recipient Number', 'gutenverse-form')}
                value={item.recipient}
                onValueChange={recipient => {
                    onUpdateIndexValue({ ...item, recipient });
                    onUpdateIndexStyle({ ...item, recipient });
                }}
                placeholder={__('6282237741202 or {field_id}', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Template JSON', 'gutenverse-form')}
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
