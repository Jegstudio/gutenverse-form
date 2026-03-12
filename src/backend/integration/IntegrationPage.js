import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { CardPro } from 'gutenverse-core/components';
import { InfoIcon } from 'gutenverse-core/icons';
import { 
    IconGoogleSheetSVG,
    IconMailerLiteSVG,
    IconTelegramSVG,
    IconDiscordSVG,
    IconWhatsAppSVG,
    IconWebhookSVG,
    IconGetResponseSVG,
    IconDripSVG,
    IconActiveCampaignSVG,
    IconConvertKitSVG,
    IconSlackSVG,
    IconSettingsSVG,
    IconWarningSVG,
    IconMailchimpSVG } from '../../assets/icon/index';
import { TextControl, TextareaControl, Button, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const services = [
    { id: 'whatsapp', title: 'Whatsapp', description: __('Send form notifications directly to your WhatsApp.', 'gutenverse-form'), icon: <IconWhatsAppSVG /> },
    { id: 'telegram', title: 'Telegram', description: __('Receive form alerts via Telegram bot.', 'gutenverse-form'), icon: <IconTelegramSVG /> },
    { id: 'discord', title: 'Discord', description: __('Integrate form submissions with your Discord channel.', 'gutenverse-form'), icon: <IconDiscordSVG /> },
    { id: 'mailchimp', title: 'Mail Chimp', description: __('Subscribe users to your Mailchimp email lists.', 'gutenverse-form'), icon: <IconMailchimpSVG /> },
    { id: 'slack', title: 'Slack', description: __('Get real-time form notifications in your Slack workspace.', 'gutenverse-form'), icon: <IconSlackSVG /> },
    { id: 'webhook', title: 'Webhook', description: __('Send form data to any external URL or service.', 'gutenverse-form'), icon: <IconWebhookSVG /> },
    { id: 'get_response', title: 'GetResponse', description: __('Connect your forms to GetResponse marketing automation.', 'gutenverse-form'), icon: <IconGetResponseSVG /> },
    { id: 'drip', title: 'Drip', description: __('Sync form data with Drip CRM and marketing platform.', 'gutenverse-form'), icon: <IconDripSVG /> },
    { id: 'active_campaign', title: 'Active Campaign', description: __('Automate your marketing with ActiveCampaign integration.', 'gutenverse-form'), icon: <IconActiveCampaignSVG /> },
    { id: 'convert_kit', title: 'Convert Kit', description: __('Grow your audience with ConvertKit integration.', 'gutenverse-form'), icon: <IconConvertKitSVG /> },
    { id: 'mailer', title: 'Mailer', description: __('Connect form data to your MailerLite account.', 'gutenverse-form'), icon: <IconMailerLiteSVG /> },
    { id: 'google_sheets', title: 'Google Sheets', description: __('Save form submissions directly to Google Sheets.', 'gutenverse-form'), icon: <IconGoogleSheetSVG /> },
];

const DisableModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="gutenverse-modal-overlay" onClick={onCancel}>
            <div className="gutenverse-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onCancel}>
                    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.16671 6.147L6.15337 5.16034C6.24107 5.07263 6.32683 5.07068 6.41063 5.15449L17.4729 16.2168C17.5567 16.3006 17.5548 16.3863 17.4671 16.474L16.4804 17.4607C16.3927 17.5484 16.307 17.5504 16.2232 17.4666L5.16086 6.40426C5.07706 6.32045 5.07901 6.2347 5.16671 6.147Z" fill="#7D8292"/>
                        <path d="M5.19405 16.2447L16.2447 5.19405C16.3324 5.10635 16.4181 5.1044 16.5019 5.18821L17.4447 6.13102C17.5285 6.21482 17.5266 6.30058 17.4389 6.38828L6.38828 17.4389C6.30058 17.5266 6.21482 17.5285 6.13102 17.4447L5.18821 16.5019C5.1044 16.4181 5.10635 16.3324 5.19405 16.2447Z" fill="#7D8292"/>
                    </svg>
                </button>
                <div className="modal-body">
                    <div className="modal-header">
                        <IconWarningSVG />
                    </div>
                    <h2>{__('Disable This Integration?', 'gutenverse-form')}</h2>
                    <p>{__('Are you sure you want to disable this integration? This may break existing forms using this service.', 'gutenverse-form')}</p>
                </div>
                <div className="modal-footer">
                    <button className="button-disable" onClick={onConfirm}>{__('Disable', 'gutenverse-form')}</button>
                    <button className="button-cancel" onClick={onCancel}>{__('Cancel', 'gutenverse-form')}</button>
                </div>
            </div>
        </div>
    );
};

const IntegrationItem = ({ service, status, onToggle, onSetup }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isActive = !!status;

    const handleToggle = () => {
        if (isActive) {
            setIsModalOpen(true);
        } else {
            onToggle(service.id, true);
        }
    };

    const confirmDisable = () => {
        onToggle(service.id, false);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className={classnames('integration-item', { active: isActive })}>
                <div className="item-header">
                    <div className="item-icon">
                        {service.icon}
                    </div>
                    <div className="item-info">
                        <div className="item-title">{service.title}</div>
                        <div className="item-description">{service.description}</div>
                    </div>
                </div>
                <div className="item-footer">
                    <div className="item-toggle-wrap">
                        <div className={classnames('gutenverse-toggle', { active: isActive })} onClick={handleToggle}>
                            <span className="toggle-label">{isActive ? __('ON', 'gutenverse-form') : __('OFF', 'gutenverse-form')}</span>
                            <div className="toggle-handle" />
                        </div>
                    </div>
                    {isActive && (
                        <button
                            onClick={() => {
                                window.location.href = admin_url + 'admin.php?page=form_integration&service=' + service.id;
                            }}
                            className="setup-link-button"
                        >
                            {__('Continue setup', 'gutenverse-form')}
                            <IconSettingsSVG />
                        </button>
                    )}
                </div>
            </div>
            <DisableModal 
                isOpen={isModalOpen} 
                onConfirm={confirmDisable} 
                onCancel={() => setIsModalOpen(false)} 
            />
        </>
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
                <p><span><InfoIcon /></span>{__('Enable or disable integrations globally. These settings apply to all forms by default unless overridden in individual Form Builder settings.', 'gutenverse-form')}</p>
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
                            {field.type === 'textarea' ? (
                                <TextareaControl
                                    label={field.label}
                                    value={settings[key] || ''}
                                    onChange={(val) => updateSetting(key, val)}
                                    placeholder={field.placeholder}
                                    rows={10}
                                />
                            ) : (
                                <TextControl
                                    label={field.label}
                                    value={settings[key] || ''}
                                    onChange={(val) => updateSetting(key, val)}
                                    placeholder={field.placeholder}
                                />
                            )}
                        </div>
                    );
                })}
                {config.integrationDocumentationUrl && (
                    <div className="setup-doc-note">
                        <p>
                            {__('Need help setting up this integration? ', 'gutenverse-form')}
                            <a href={config.integrationDocumentationUrl} target="_blank" rel="noreferrer">
                                {__('Check the service documentation for setup instructions', 'gutenverse-form')}
                            </a>
                        </p>
                    </div>
                )}
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
        <>
            <div className="gutenverse-form-integration-header">
                <h1>{__('Form Integration', 'gutenverse-form')}</h1>
                <p>{__('Connect your form with external services to automate data and workflows.', 'gutenverse-form')}</p>
            </div>
            <div className="gutenverse-form-integration-wrap">

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
        </>
    );
};

export default IntegrationPage;
