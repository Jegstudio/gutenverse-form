import IntegrationPage from './Integration-page';
import FormSetting from './form-setting';
import { applyFilters } from '@wordpress/hooks';

export const SettingPage = (props) => {
    const { subSettings = 'form_settings', settingValues = {}, updateSettingValues } = props;
    const {
        form_settings = {}
    } = settingValues;

    const updateformSettings = (setting, id, value) => {

        updateSettingValues('form_settings', [setting], {
            ...form_settings[setting],
            [id]: value
        });
    };

    let content = '';
    switch (subSettings) {
        case 'form_settings':
            return <FormSetting {...props} settingValues={form_settings} updateSettingValues={updateformSettings} />;
        case 'form_integrations':
            const updateformFeatures = (value) => {
                updateSettingValues('form_settings', 'features', value);
            };
            return <IntegrationPage {...props} settingValues={form_settings} updateSettingValues={updateformFeatures} />;
        default:
            break;
    }
    return applyFilters(
        'gutenverse.form.settings.content',
        content,
        subSettings,
        {
            ...props,
            settingValues: form_settings,
            updateSettingValues: updateformSettings
        }
    );
};
