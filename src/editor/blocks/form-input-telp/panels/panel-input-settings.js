import { __ } from '@wordpress/i18n';
import { TextControl } from 'gutenverse-core/controls';

export const panelInputSettings = () => {
    return [
        {
            id: 'inputPattern',
            label: __('Phone Pattern', 'gutenverse-form'),
            description: __('Put your telephone number pattern to give clue to your user', 'gutenverse-form'),
            component: TextControl,
        },
    ];
};