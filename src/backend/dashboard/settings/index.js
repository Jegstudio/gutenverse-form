
import { __ } from '@wordpress/i18n';
import { addFilter, applyFilters } from '@wordpress/hooks';
import { SettingPage } from './setting-page';

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
                body = <SettingPage {...props} />;
            }

            return body;
        }
    );

    addFilter('gutenverse.settings.menu.plugin', 'gutenverse-form/dashboard/settings/menu-plugin',
        (menu, settingValues) => {
            menu.form = {
                title: __('Form', 'gutenverse-form'),
                pro: false,
                subMenu: applyFilters('gutenverse.form.settings.submenu', [
                    {
                        id: 'form_settings',
                        title: 'Form Settings'
                    },
                    {
                        id: 'form_integrations',
                        title: 'Form Integrations',
                        pro: true,
                        withAccess: true
                    }
                ], settingValues)
            };

            return menu;
        }
    );
};
