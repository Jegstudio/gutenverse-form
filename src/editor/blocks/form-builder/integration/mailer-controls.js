import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';
import { ServerSecretControl } from './server-secret-control';

export const MailerControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle, elementId }) => {
    return (
        <>
            <ServerSecretControl
                item={item}
                fieldKey={'api_key'}
                service={'mailer'}
                elementId={elementId}
                label={__('API Token', 'gutenverse-form')}
                required={true}
                placeholder={__('MailerLite API token', 'gutenverse-form')}
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
            />
            <DebouncedTextControl
                label={__('Name', 'gutenverse-form')}
                value={item.name}
                onValueChange={name => {
                    onUpdateIndexValue({ ...item, name });
                    onUpdateIndexStyle({ ...item, name });
                }}
                placeholder={'{input-text-name}'}
            />
            <DebouncedTextControl
                label={__('Group IDs JSON', 'gutenverse-form')}
                value={item.groups}
                onValueChange={groups => {
                    onUpdateIndexValue({ ...item, groups });
                    onUpdateIndexStyle({ ...item, groups });
                }}
                placeholder={'["12345678901234567"]'}
                textArea={true}
            />
            <DebouncedTextControl
                label={__('Status', 'gutenverse-form')}
                value={item.status}
                onValueChange={status => {
                    onUpdateIndexValue({ ...item, status });
                    onUpdateIndexStyle({ ...item, status });
                }}
                placeholder={__('active', 'gutenverse-form')}
            />
        </>
    );
};
