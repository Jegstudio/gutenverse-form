import DebouncedTextControl, { DebouncedSelectControl } from './debounced-text-control';
import { __ } from '@wordpress/i18n';
import { ServerSecretControl } from './server-secret-control';

export const DripControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle, elementId }) => {
    const booleanOptions = [
        { label: __('Yes', 'gutenverse-form'), value: 'true' },
        { label: __('No', 'gutenverse-form'), value: 'false' },
    ];

    return (
        <>
            <ServerSecretControl
                item={item}
                fieldKey={'api_key'}
                service={'drip'}
                elementId={elementId}
                label={__('API Key', 'gutenverse-form')}
                required={true}
                placeholder={__('drip_xxxxxxxxxxxxxxxxxxxx', 'gutenverse-form')}
                description={__('Stored securely on the server and reused for this form block.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
            />
            <DebouncedTextControl
                label={__('Account ID', 'gutenverse-form')}
                required={true}
                value={item.account_id}
                onValueChange={account_id => {
                    onUpdateIndexValue({ ...item, account_id });
                    onUpdateIndexStyle({ ...item, account_id });
                }}
                placeholder={'1234567'}
                description={__('Your numeric Drip account ID.', 'gutenverse-form')}
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
                description={__('Optional first name placeholder, for example {first_name}.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Last Name', 'gutenverse-form')}
                value={item.last_name}
                onValueChange={last_name => {
                    onUpdateIndexValue({ ...item, last_name });
                    onUpdateIndexStyle({ ...item, last_name });
                }}
                placeholder={'{last_name}'}
                description={__('Optional last name placeholder, for example {last_name}.', 'gutenverse-form')}
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
                description={__('Optional JSON array of tags to apply in Drip.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Custom Fields JSON', 'gutenverse-form')}
                value={item.custom_fields}
                onValueChange={custom_fields => {
                    onUpdateIndexValue({ ...item, custom_fields });
                    onUpdateIndexStyle({ ...item, custom_fields });
                }}
                placeholder={'{"company":"{company}","plan":"{plan}"}'}
                textArea={true}
                description={__('Optional JSON object of Drip custom fields. Placeholders are supported in values.', 'gutenverse-form')}
            />
            <DebouncedSelectControl
                label={__('Double Opt-In', 'gutenverse-form')}
                value={item.double_optin}
                onValueChange={(double_optin) => {
                    onUpdateIndexValue({ ...item, double_optin });
                    onUpdateIndexStyle({ ...item, double_optin });
                }}
                options={booleanOptions}
                description={__('Optional boolean. Use true to require confirmation before subscription.', 'gutenverse-form')}
            />
            <DebouncedSelectControl
                label={__('Prospect', 'gutenverse-form')}
                value={item.prospect}
                onValueChange={(prospect) => {
                    onUpdateIndexValue({ ...item, prospect });
                    onUpdateIndexStyle({ ...item, prospect });
                }}
                options={booleanOptions}
                description={__('Optional boolean. Use true to let Drip treat the contact as a lead/prospect.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('EU Consent', 'gutenverse-form')}
                value={item.eu_consent}
                onValueChange={eu_consent => {
                    onUpdateIndexValue({ ...item, eu_consent });
                    onUpdateIndexStyle({ ...item, eu_consent });
                }}
                placeholder={'granted'}
                description={__('Optional. Use granted or denied if you want to store consent status in Drip.', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('EU Consent Message', 'gutenverse-form')}
                value={item.eu_consent_message}
                onValueChange={eu_consent_message => {
                    onUpdateIndexValue({ ...item, eu_consent_message });
                    onUpdateIndexStyle({ ...item, eu_consent_message });
                }}
                placeholder={__('I agree to receive product updates.', 'gutenverse-form')}
                description={__('Optional consent text shown to the user when consent was collected.', 'gutenverse-form')}
            />
        </>
    );
};
