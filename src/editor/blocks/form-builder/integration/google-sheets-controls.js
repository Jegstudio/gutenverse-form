import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';
import { ServerSecretControl } from './server-secret-control';

export const GoogleSheetsControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle, elementId }) => {
    const updateItem = (changes) => {
        const nextValue = { ...item, ...changes };
        onUpdateIndexValue(nextValue);
        onUpdateIndexStyle(nextValue);
    };

    return (
        <>
            <ServerSecretControl
                item={item}
                fieldKey={'endpointUrl'}
                service={'google_sheets'}
                elementId={elementId}
                label={__('API Endpoint URL', 'gutenverse-form')}
                required={true}
                placeholder={'https://api.apispreadsheets.com/data/DBryPPnM0GlM5u28/'}
                description={__('Stored securely on the server and used as the full API Spreadsheets endpoint.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
            />
            <ServerSecretControl
                item={item}
                fieldKey={'accessKey'}
                service={'google_sheets'}
                elementId={elementId}
                label={__('Access Key', 'gutenverse-form')}
                required={true}
                placeholder={'062b1da7839a41aff88c43abf932d4dd'}
                description={__('Stored securely on the server and sent as the accessKey request header.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
            />
            <ServerSecretControl
                item={item}
                fieldKey={'secretKey'}
                service={'google_sheets'}
                elementId={elementId}
                label={__('Secret Key', 'gutenverse-form')}
                required={true}
                placeholder={'ccd2cd6ee8ad1dcf76d844b7434c5154'}
                description={__('Stored securely on the server and sent as the secretKey request header.', 'gutenverse-form')}
                onUpdateIndexValue={onUpdateIndexValue}
                onUpdateIndexStyle={onUpdateIndexStyle}
            />
            <DebouncedTextControl
                label={__('Column Template', 'gutenverse-form')}
                value={item.columnsTemplate || item.columns_template}
                onValueChange={columnsTemplate => {
                    updateItem({ columnsTemplate });
                }}
                description={__('Write one API column per line using Column={placeholder}. Example: Name={name}. This sends {"data":{"Name":"...","Email":"...","Message":"..."}} to API Spreadsheets.', 'gutenverse-form')}
                placeholder={'Name={name}\nEmail={email}\nMessage={message}'}
                textArea={true}
            />
        </>
    );
};
