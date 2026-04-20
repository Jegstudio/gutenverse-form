import { useState, useEffect } from '@wordpress/element';
import { TextControl, TextareaControl, SelectControl } from 'gutenverse-core/controls';

export const DebouncedTextControl = ({ label, value, onValueChange, placeholder, textArea = false, required = false, description = '' }) => {
    const [ localValue, setLocalValue ] = useState(value);
    const displayLabel = required ? `${label} *` : label;

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onValueChange(localValue);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localValue]);

    return textArea ? (
        <TextareaControl
            label={displayLabel}
            value={localValue}
            onValueChange={setLocalValue}
            placeholder={placeholder}
            description={description}
        />
    ) : (
        <TextControl
            label={displayLabel}
            value={localValue}
            onValueChange={setLocalValue}
            placeholder={placeholder}
            description={description}
        />
    );
};

export const DebouncedSelectControl = ({ label, value, onValueChange, options = [], required = false, description = '', defaultValue = null }) => {
    const displayLabel = required ? `${label} *` : label;

    return (
        <SelectControl
            label={displayLabel}
            value={value}
            onValueChange={onValueChange}
            options={options}
            description={description}
            defaultValue={defaultValue}
        />
    );
};

export default DebouncedTextControl;
