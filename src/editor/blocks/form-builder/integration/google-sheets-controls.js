import DebouncedTextControl from './debounced-text-control';
import { __ } from '@wordpress/i18n';

export const GoogleSheetsControls = ({ item, onUpdateIndexValue, onUpdateIndexStyle }) => {
    const updateItem = (changes) => {
        const nextValue = { ...item, ...changes };
        onUpdateIndexValue(nextValue);
        onUpdateIndexStyle(nextValue);
    };

    return (
        <>
            <DebouncedTextControl
                label={__('Spreadsheet ID', 'gutenverse-form')}
                value={item.spreadsheetId || item.spreadsheet_id}
                onValueChange={spreadsheetId => {
                    updateItem({ spreadsheetId });
                }}
                placeholder={'1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890'}
            />
            <DebouncedTextControl
                label={__('Sheet Tab Name', 'gutenverse-form')}
                value={item.sheetName || item.sheet_name}
                onValueChange={sheetName => {
                    updateItem({ sheetName });
                }}
                placeholder={__('Form Entries', 'gutenverse-form')}
            />
            <DebouncedTextControl
                label={__('Column Template', 'gutenverse-form')}
                value={item.columnsTemplate || item.columns_template}
                onValueChange={columnsTemplate => {
                    updateItem({ columnsTemplate });
                }}
                placeholder={'entry_id={entry_id}\nsubmitted_at={submitted_at}\nemail={email}\nmessage={message}'}
                textArea={true}
            />
        </>
    );
};
