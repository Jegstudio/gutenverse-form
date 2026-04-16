import { useState, useEffect } from '@wordpress/element';
import { TextControl, TextareaControl } from 'gutenverse-core/controls';

export const DebouncedTextControl = ({ label, value, onValueChange, placeholder, textArea = false, required = false }) => {
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
        />
    ) : (
        <TextControl
            label={displayLabel}
            value={localValue}
            onValueChange={setLocalValue}
            placeholder={placeholder}
        />
    );
};

export default DebouncedTextControl;
