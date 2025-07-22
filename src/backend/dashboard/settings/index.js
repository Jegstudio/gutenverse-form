
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import FormSetting from './form-setting';

export const loadSettings = () => {
    addFilter(
        'gutenverse.dashboard.plugin-settings.navigation',
        'gutenverse/dashboard/plugin-settings/navigation',
        (nav) => ({
            ...nav,
            form: {
                title: __('Form', 'gutenverse-form'),
                pro: false,
            },
        })
    );

    addFilter(
        'gutenverse.dashboard.settings.body',
        'gutenverse/dashboard/settings/body',
        (body, settings, props) => {
            if (settings === 'form') {
                body = <FormSetting {...props} />;
            }

            return body;
        }
    );
};