import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';
import { ServerSecretControl } from './server-secret-control';

export const GetResponseControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle, elementId }) => {
    return (
        <>
            <ServerSecretControl
                item={item}
                fieldKey={'api_key'}
                service={'get_response'}
                elementId={elementId}
                label={__('API Key', 'gutenverse-form')}
                required={true}
                placeholder={__('GetResponse API key', 'gutenverse-form')}
                description={__('Stored securely on the server and reused for this form block.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
            />
            <DebouncedTextControl
                label={__('Campaign ID', 'gutenverse-form')}
                required={true}
                value={item.campaign_id}
                onValueChange={campaign_id => {
                    onUpdateIndexValue({ ...item, campaign_id });
                    onUpdateIndexStyle({ ...item, campaign_id });
                }}
                placeholder={'p86zQ'}
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
                label={__('Day of Cycle', 'gutenverse-form')}
                value={item.day_of_cycle}
                onValueChange={day_of_cycle => {
                    onUpdateIndexValue({ ...item, day_of_cycle });
                    onUpdateIndexStyle({ ...item, day_of_cycle });
                }}
                placeholder={'0'}
            />
            <DebouncedTextControl
                label={__('Tags JSON', 'gutenverse-form')}
                value={item.tags}
                onValueChange={tags => {
                    onUpdateIndexValue({ ...item, tags });
                    onUpdateIndexStyle({ ...item, tags });
                }}
                placeholder={'["y8inp","y8inq"]'}
                textArea={true}
            />
            <DebouncedTextControl
                label={__('Custom Field Values JSON', 'gutenverse-form')}
                value={item.custom_field_values}
                onValueChange={custom_field_values => {
                    onUpdateIndexValue({ ...item, custom_field_values });
                    onUpdateIndexStyle({ ...item, custom_field_values });
                }}
                placeholder={'[{"customFieldId":"z9Kgt","value":["{city}"]}]'}
                textArea={true}
            />
            <DebouncedTextControl
                label={__('IP Address', 'gutenverse-form')}
                value={item.ip_address}
                onValueChange={ip_address => {
                    onUpdateIndexValue({ ...item, ip_address });
                    onUpdateIndexStyle({ ...item, ip_address });
                }}
                placeholder={'192.168.0.1'}
            />
        </>
    );
};
