import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { CardPro } from 'gutenverse-core/components';
import { IconCrownBannerSVG } from 'gutenverse-core/icons';

import { TextControl, Button, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const services = [
    { id: 'whatsapp', title: 'Whatsapp', icon: <IconCrownBannerSVG fill='blue' /> },
    { id: 'telegram', title: 'Telegram', icon: <IconCrownBannerSVG fill='blue' /> },
    { id: 'discord', title: 'Discord', icon: <IconCrownBannerSVG fill='blue' /> },
    { id: 'mailchimp', title: 'Mail Chimp', icon: <IconCrownBannerSVG fill='blue' /> },
    { id: 'slack', title: 'Slack', icon: <IconCrownBannerSVG fill='blue' /> },
    { id: 'webhook', title: 'Webhook', icon: <IconCrownBannerSVG fill='blue' /> },
    { id: 'get_response', title: 'GetResponse', icon: <IconCrownBannerSVG fill='blue' /> },
    { id: 'drip', title: 'Drip', icon: <IconCrownBannerSVG fill='blue' /> },
    { id: 'active_campaign', title: 'Active Campaign', icon: <IconCrownBannerSVG fill='blue' /> },
    { id: 'convert_kit', title: 'Convert Kit', icon: <IconCrownBannerSVG fill='blue' /> },
    { id: 'mailer', title: 'Mailer', icon: <IconCrownBannerSVG fill='blue' /> },
    { id: 'google_sheets', title: 'Google Sheets', icon: <IconCrownBannerSVG fill='blue' /> },
];

const IntegrationItem = ({ service, status, onToggle, onSetup }) => {
    const isActive = !!status;

    const handleToggle = () => {
        if (isActive) {
            if (!window.confirm(__('Are you sure you want to disable this integration? This may break existing forms using this service.', 'gutenverse-form'))) {
                return;
            }
        }
        onToggle(service.id, !isActive);
    };

    return (
        <div className="integration-item">
            <div className="item-title">
                <div className="item-icon">
                    {service.icon}
                </div>
                {service.title}
            </div>
            <div className="item-actions">
                {isActive && (
                    <button
                        onClick={() => {
                            window.location.href = admin_url + 'admin.php?page=form_integration&service=' + service.id;
                        }}
                        className="setup-link-button"
                    >
                        {__('Continue setup', 'gutenverse-form')}
                    </button>
                )}
                <div className={`gutenverse-toggle ${isActive ? 'active' : ''}`} onClick={handleToggle}>
                    <div className="toggle-handle" />
                </div>
            </div>
        </div>
    );
};

const TabSetting = ({ onSetup }) => {
    const [integrations, setIntegrations] = useState(window['GutenverseConfig']?.integrations || {});
    const [saving, setSaving] = useState(null);

    const onToggle = (id, value) => {
        setSaving(id);
        apiFetch({
            path: 'gutenverse-form-client/v1/integration/save',
            method: 'POST',
            data: { key: id, value },
        }).then(() => {
            setIntegrations((prev) => ({ ...prev, [id]: value }));
            setSaving(null);
        }).catch(() => {
            setSaving(null);
        });
    };

    return (
        <div className="form-tab-body">
            <div className="integration-list">
                {services.map((service) => (
                    <IntegrationItem
                        key={service.id}
                        service={service}
                        status={integrations[service.id]}
                        onToggle={onToggle}
                        onSetup={onSetup}
                        loading={saving === service.id}
                    />
                ))}
            </div>
        </div>
    );
};

const admin_url = window['GutenverseConfig']?.adminUrl || '';


const ServiceSetup = ({ serviceId, title }) => {
    const config = window['GutenverseConfig'] || {};
    const fields = config.serviceFields || {};
    const [settings, setSettings] = useState(config.serviceSettings || {});
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState(null);

    const handleSave = () => {
        setIsSaving(true);
        setNotice(null);
        apiFetch({
            path: 'gutenverse-form-client/v1/integration/save_settings',
            method: 'POST',
            data: { service: serviceId, settings },
        }).then(() => {
            setIsSaving(false);
            setNotice({ type: 'success', message: __('Settings saved successfully.', 'gutenverse-form') });
        }).catch((err) => {
            setIsSaving(false);
            setNotice({ type: 'error', message: err.message || __('Failed to save settings.', 'gutenverse-form') });
        });
    };

    const updateSetting = (key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="service-setup-content">
            <h3>{__('Setup', 'gutenverse-form')} {title}</h3>
            {notice && (
                <Notice status={notice.type} onRemove={() => setNotice(null)}>
                    {notice.message}
                </Notice>
            )}
            <div className="setup-fields">
                {Object.keys(fields).map((key) => {
                    const field = fields[key];
                    return (
                        <div key={key} className="setup-field-item">
                            <TextControl
                                label={field.label}
                                value={settings[key] || ''}
                                onChange={(val) => updateSetting(key, val)}
                                placeholder={field.placeholder}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="setup-footer">
                <Button
                    isPrimary
                    isBusy={isSaving}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {__('Save Settings', 'gutenverse-form')}
                </Button>
            </div>
        </div>
    );
};

const TabAdvanced = () => {
    return (
        <div className="form-tab-body pro-tab">
            <CardPro />
        </div>
    );
};

const IntegrationPage = () => {
    const [tab, setActiveTab] = useState('setting');
    const [currentService, setCurrentService] = useState(window['GutenverseConfig']?.currentService || '');

    const tabs = {
        setting: {
            label: __('Setting', 'gutenverse-form'),
        },
        advanced: {
            label: __('Advanced', 'gutenverse-form'),
            pro: true,
        },
    };

    const filteredTabs = applyFilters('gutenverse.form.integration.tabs', tabs);

    if (currentService) {
        const service = services.find(s => s.id === currentService);
        return (
            <div className="gutenverse-form-integration-wrap">
                <div className="integration-header">
                    <h1>{service ? service.title : __('Integration', 'gutenverse-form')}</h1>
                    <button className="back-button" onClick={() => {
                        window.location.href = admin_url + 'admin.php?page=form_integration';
                    }}>
                        {__('Back to list', 'gutenverse-form')}
                    </button>
                </div>
                <div className="form-tab-body">
                    <ServiceSetup serviceId={currentService} title={service?.title} />
                </div>
            </div>
        );
    }

    const SettingTab = applyFilters(
        'gutenverse.form.integration.tab.setting',
        <TabSetting onSetup={setCurrentService} />,
    );

    const AdvancedTab = applyFilters(
        'gutenverse.form.integration.tab.advanced',
        <TabAdvanced />,
    );

    return (
        <div className="gutenverse-form-integration-wrap">
            <div className="integration-header">
                <h1>{__('Form Integration', 'gutenverse-form')}</h1>
            </div>

            <div className="form-tab-header">
                {Object.keys(filteredTabs).map((key) => {
                    const item = filteredTabs[key];
                    const classes = classnames('header-item', {
                        active: key === tab,
                        pro: item.pro,
                    });

                    const tabButton = (
                        <div className={classes} key={key} onClick={() => setActiveTab(key)}>
                            {item.label}
                            {item.pro && <span className="pro-badge">{__('Pro', 'gutenverse-form')}</span>}
                        </div>
                    );

                    return item.pro
                        ? applyFilters('gutenverse-form.integration.tab-pro-button', tabButton, { key, item, classes, setActiveTab })
                        : tabButton;
                })}
            </div>

            {tab === 'setting' && SettingTab}
            {tab === 'advanced' && AdvancedTab}

            {applyFilters(`gutenverse.form.integration.content.${tab}`, null)}
        </div>
    );
};

export default IntegrationPage;
