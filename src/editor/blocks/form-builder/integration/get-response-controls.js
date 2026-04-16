import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';

export const GetResponseControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle }) => {
    return (
        <>
            <DebouncedTextControl
                label={__('API Key', 'gutenverse-form')}
                value={item.api_key}
                onValueChange={api_key => {
                    onUpdateIndexValue({ ...item, api_key });
                    onUpdateIndexStyle({ ...item, api_key });
                }}
                placeholder={__('GetResponse API key', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Campaign ID', 'gutenverse-form')}
                value={item.campaign_id}
                onValueChange={campaign_id => {
                    onUpdateIndexValue({ ...item, campaign_id });
                    onUpdateIndexStyle({ ...item, campaign_id });
                }}
                placeholder={'p86zQ'}
            />
            <DebouncedTextControl
                label={__('Email', 'gutenverse-form')}
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
