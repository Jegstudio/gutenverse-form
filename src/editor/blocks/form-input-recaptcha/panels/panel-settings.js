import { __ } from '@wordpress/i18n';
import { TextControl } from 'gutenverse-core/controls';

export const panelSettings = () => {
    return [
        {
            id: 'siteKey',
            label: __('Site Key', 'gutenverse-form'),
            description: __('Put your site key here. Only use "Recaptcha type v2" and "I\'m not a Robot" Checkbox for your google Captcha settings', 'gutenverse-form'),
            component: TextControl,
        },
    ];
};