import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';
import { ServerSecretControl } from './server-secret-control';

export const MailChimpControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle, elementId }) => {
    return (
        <>
            <ServerSecretControl
                item={item}
                fieldKey={'api_key'}
                service={'mailchimp'}
                elementId={elementId}
                label={__('API Key', 'gutenverse-form')}
                required={true}
                placeholder={__('xxxxxx-us1', 'gutenverse-form')}
                description={__('Stored securely on the server and reused for this form block.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
            />
            <DebouncedTextControl
                label={__('Audience ID', 'gutenverse-form')}
                required={true}
                value={item.list_id}
                onValueChange={list_id => {
                    onUpdateIndexValue({ ...item, list_id });
                    onUpdateIndexStyle({ ...item, list_id });
                }}
                placeholder={__('a1b2c3d4e5', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Email', 'gutenverse-form')}
                required={true}
                value={item.email}
                onValueChange={email => {
                    onUpdateIndexValue({ ...item, email });
                    onUpdateIndexStyle({ ...item, email });
                }}
                placeholder={'{email}'}
            />
            <DebouncedTextControl
                label={__('Name', 'gutenverse-form')}
                value={item.name}
                onValueChange={name => {
                    onUpdateIndexValue({ ...item, name });
                    onUpdateIndexStyle({ ...item, name });
                }}
                placeholder={'{name}'}
            />
            <DebouncedTextControl
                label={__('Status', 'gutenverse-form')}
                value={item.status}
                onValueChange={status => {
                    onUpdateIndexValue({ ...item, status });
                    onUpdateIndexStyle({ ...item, status });
                }}
                placeholder={__('subscribed', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Status If New', 'gutenverse-form')}
                value={item.status_if_new}
                onValueChange={status_if_new => {
                    onUpdateIndexValue({ ...item, status_if_new });
                    onUpdateIndexStyle({ ...item, status_if_new });
                }}
                placeholder={__('subscribed', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Tags JSON', 'gutenverse-form')}
                value={item.tags}
                onValueChange={tags => {
                    onUpdateIndexValue({ ...item, tags });
                    onUpdateIndexStyle({ ...item, tags });
                }}
                placeholder={'["lead","newsletter"]'}
                textArea={true}
            />
            <DebouncedTextControl
                label={__('Merge Fields JSON', 'gutenverse-form')}
                value={item.merge_fields}
                onValueChange={merge_fields => {
                    onUpdateIndexValue({ ...item, merge_fields });
                    onUpdateIndexStyle({ ...item, merge_fields });
                }}
                placeholder={'{"FNAME":"{first_name}","LNAME":"{last_name}"}'}
                textArea={true}
            />
        </>
    );
};
