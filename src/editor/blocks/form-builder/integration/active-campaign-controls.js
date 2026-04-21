import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';

export const ActiveCampaignControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle }) => {
    return (
        <>
            <DebouncedTextControl
                label={__('API URL', 'gutenverse-form')}
                required={true}
                value={item.api_url}
                onValueChange={api_url => {
                    onUpdateIndexValue({ ...item, api_url });
                    onUpdateIndexStyle({ ...item, api_url });
                }}
                placeholder={'https://youraccountname.api-us1.com'}
                description={__('Your ActiveCampaign account API URL.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('API Key', 'gutenverse-form')}
                required={true}
                value={item.api_key}
                onValueChange={api_key => {
                    onUpdateIndexValue({ ...item, api_key });
                    onUpdateIndexStyle({ ...item, api_key });
                }}
                placeholder={__('ActiveCampaign API token', 'gutenverse-form')}
                description={__('Paste the ActiveCampaign API token used for authenticated requests.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('List ID', 'gutenverse-form')}
                value={item.list_id}
                onValueChange={list_id => {
                    onUpdateIndexValue({ ...item, list_id });
                    onUpdateIndexStyle({ ...item, list_id });
                }}
                placeholder={'1'}
                description={__('Optional list ID to subscribe the synced contact to.', 'gutenverse-form')}
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
                description={__('Use the email field placeholder from your form, for example {email}.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('First Name', 'gutenverse-form')}
                value={item.first_name}
                onValueChange={first_name => {
                    onUpdateIndexValue({ ...item, first_name });
                    onUpdateIndexStyle({ ...item, first_name });
                }}
                placeholder={'{first_name}'}
                description={__('Optional first name placeholder.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Last Name', 'gutenverse-form')}
                value={item.last_name}
                onValueChange={last_name => {
                    onUpdateIndexValue({ ...item, last_name });
                    onUpdateIndexStyle({ ...item, last_name });
                }}
                placeholder={'{last_name}'}
                description={__('Optional last name placeholder.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Phone', 'gutenverse-form')}
                value={item.phone}
                onValueChange={phone => {
                    onUpdateIndexValue({ ...item, phone });
                    onUpdateIndexStyle({ ...item, phone });
                }}
                placeholder={'{phone}'}
                description={__('Optional phone placeholder.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Tag IDs JSON', 'gutenverse-form')}
                value={item.tag_ids}
                onValueChange={tag_ids => {
                    onUpdateIndexValue({ ...item, tag_ids });
                    onUpdateIndexStyle({ ...item, tag_ids });
                }}
                placeholder={'[1,2,3]'}
                textArea={true}
                description={__('Optional JSON array of existing ActiveCampaign tag IDs.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Field Values JSON', 'gutenverse-form')}
                value={item.field_values}
                onValueChange={field_values => {
                    onUpdateIndexValue({ ...item, field_values });
                    onUpdateIndexStyle({ ...item, field_values });
                }}
                placeholder={'[{"field":"1","value":"{company}"}]'}
                textArea={true}
                description={__('Optional JSON array of custom field values. Placeholders are supported in the value fields.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Automation ID', 'gutenverse-form')}
                value={item.automation_id}
                onValueChange={automation_id => {
                    onUpdateIndexValue({ ...item, automation_id });
                    onUpdateIndexStyle({ ...item, automation_id });
                }}
                placeholder={'1'}
                description={__('Optional automation ID to enroll the synced contact in.', 'gutenverse-form')}
            />
        </>
    );
};
