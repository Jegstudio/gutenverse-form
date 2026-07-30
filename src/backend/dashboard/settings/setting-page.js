import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import IntegrationPage from './Integration-page';
import FormSetting from './form-setting';
import { applyFilters } from '@wordpress/hooks';

export const SettingPage = (props) => {
    const { subSettings = 'form_settings', settingValues = {}, updateSettingValues } = props;
    const {
        form_settings = {}
    } = settingValues;
    const [emailTemplates, setEmailTemplates] = useState([]);

    useEffect(() => {
        apiFetch({ path: '/wp/v2/gutenverse-email-tpl?per_page=100' }).then(posts => {
            const options = posts.map(post => ({
                label: post?.title?.rendered || __('Untitled Template', 'gutenverse-form'),
                value: post.id,
                html: post?.meta?.gutenverse_email_html || '',
            }));
            setEmailTemplates([{ label: __('Default', 'gutenverse-form'), value: '' }, ...options]);
        }).catch(() => {
            setEmailTemplates([{ label: __('Default', 'gutenverse-form'), value: '' }]);
        });
    }, []);

    const updateformSettings = (setting, id, value) => {

        updateSettingValues('form_settings', [setting], {
            ...form_settings[setting],
            [id]: value
        });
    };

    let content = '';
    switch (subSettings) {
        case 'form_settings':
            return <FormSetting
                {...props}
                settingValues={form_settings}
                updateSettingValues={updateformSettings}
                emailTemplates={emailTemplates}
                refreshTemplates={() => {
                    apiFetch({ path: '/wp/v2/gutenverse-email-tpl?per_page=100' }).then(posts => {
                        const options = posts.map(post => ({
                            label: post?.title?.rendered || __('Untitled Template', 'gutenverse-form'),
                            value: post.id,
                            html: post?.meta?.gutenverse_email_html || '',
                        }));
                        setEmailTemplates([{ label: __('Default', 'gutenverse-form'), value: '' }, ...options]);
                    }).catch(() => {
                        setEmailTemplates([{ label: __('Default', 'gutenverse-form'), value: '' }]);
                    });
                }}
            />;
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
