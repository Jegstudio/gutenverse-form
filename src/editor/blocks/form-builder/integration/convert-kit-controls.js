import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';
import { ServerSecretControl } from './server-secret-control';

export const ConvertKitControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle, elementId }) => {
    return (
        <>
            <ServerSecretControl
                item={item}
                fieldKey={'api_key'}
                service={'convert_kit'}
                elementId={elementId}
                label={__('API Key', 'gutenverse-form')}
                required={true}
                placeholder={__('kit_api_xxxxxxxxxxxxxxxxxxxx', 'gutenverse-form')}
                description={__('Stored securely on the server and reused for this form block.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
            />
            <DebouncedTextControl
                label={__('Email', 'gutenverse-form')}
                required={true}
                value={item.email}
                onValueChange={email => {
                    onUpdateIndexValue({ ...item, email });
                    onUpdateIndexStyle({ ...item, email });
                }}
                placeholder={'{input-email}'}
                description={__('Use the email field placeholder from your form, for example {input-email}.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('First Name', 'gutenverse-form')}
                value={item.first_name}
                onValueChange={first_name => {
                    onUpdateIndexValue({ ...item, first_name });
                    onUpdateIndexStyle({ ...item, first_name });
                }}
                placeholder={'{input-text-name}'}
                description={__('Optional first name placeholder, for example {input-text-name}.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Form ID', 'gutenverse-form')}
                value={item.form_id}
                onValueChange={form_id => {
                    onUpdateIndexValue({ ...item, form_id });
                    onUpdateIndexStyle({ ...item, form_id });
                }}
                placeholder={'1234567'}
                description={__('Optional Kit form ID. If set, the subscriber will also be added to this form.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Tag IDs JSON', 'gutenverse-form')}
                value={item.tag_ids}
                onValueChange={tag_ids => {
                    onUpdateIndexValue({ ...item, tag_ids });
                    onUpdateIndexStyle({ ...item, tag_ids });
                }}
                placeholder={'["123456","123457"]'}
                textArea={true}
                description={__('Optional JSON array of Kit tag IDs to apply after the subscriber is created.', 'gutenverse-form')}
            />
        </>
    );
};
