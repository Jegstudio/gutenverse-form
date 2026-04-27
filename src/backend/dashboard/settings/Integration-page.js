import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { ButtonUpgradePro, EscListener } from 'gutenverse-core/components';
import { IconCloseSVG, InfoIcon } from 'gutenverse-core/icons';
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
    IconMailchimpSVG } from '../../../assets/icon/index';
import { TextControl, TextareaControl, SelectControl, Button, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { activeTheme, clientUrl, upgradeProUrl } from 'gutenverse-core/config';

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
    { id: 'convert_kit', title: 'Kit (Convert Kit)', description: __('Grow your audience with Kit integration.', 'gutenverse-form'), icon: <IconConvertKitSVG /> },
    { id: 'mailer', title: 'Mailer', description: __('Connect form data to your MailerLite account.', 'gutenverse-form'), icon: <IconMailerLiteSVG /> },
    { id: 'google_sheets', title: 'Google Sheets', description: __('Save form submissions directly to Google Sheets.', 'gutenverse-form'), icon: <IconGoogleSheetSVG /> },
];

const integrationConfig = window['GutenverseConfig'] || window['GutenverseDashboard'] || {};
const hasIntegrationPro = !!integrationConfig?.hasIntegrationPro;
const integrationUpgradeUrl = integrationConfig?.integrationUpgradeUrl || '';
const admin_url = integrationConfig?.adminUrl || '';
const integrationLicenseType = ['professional'];
const dashboardIntegrationUrl = `${admin_url}admin.php?page=gutenverse-dashboard&path=settings&settings=form&sub-menu=form_integrations`;
const integrationSetupUrl = (serviceId = '') => `${admin_url}admin.php?page=form_integration${serviceId ? `&service=${serviceId}` : ''}`;
const appendTrackingParams = (url) => {
    if (!url) {
        return null;
    }

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}utm_source=gutenverse&utm_medium=dashboard&utm_client_site=${clientUrl}&utm_client_theme=${activeTheme}`;
};

const DisableModal = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="gutenverse-modal-overlay" onClick={onCancel}>
            <div className="gutenverse-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onCancel}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

const UpgradeModal = ({ isOpen, onClose }) => {
    const popupRef = useRef(null);
    const popupImageDir = (window['GutenverseDashboard']?.imgDir || integrationConfig?.imgDir || '').replace(/\/$/, '');
    const upgradeLink = upgradeProUrl || integrationUpgradeUrl;

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <EscListener execute={onClose} />
            <div className="popup-pro">
                <div className="popup-content" ref={popupRef}>
                    {popupImageDir && (
                        <>
                            <img className="image popup-image-background" src={`${popupImageDir}/pop-up-bg-popup-banner.png`} />
                            <img className="image popup-image-mockup" src={`${popupImageDir}/pop-up-mockup-pro.png`} />
                            <img className="image popup-image-cube" src={`${popupImageDir}/pop-up-3d-cube-2.png`} />
                            <img className="image popup-image-element1" src={`${popupImageDir}/pop-up-icon-element.png`} />
                            <img className="image popup-image-element2" src={`${popupImageDir}/pop-up-icon-element-2.png`} />
                            <img className="image popup-image-element3" src={`${popupImageDir}/pop-up-icon-element-3.png`} />
                            <img className="image popup-image-arrow" src={`${popupImageDir}/banner-arrow-blue.png`} />
                        </>
                    )}
                    <div className="close" onClick={onClose}>
                        <IconCloseSVG size={20} />
                    </div>
                    <div className="content">
                        <h3 className="details">
                            {__('Form integrations require Gutenverse Pro with the Professional license tier or higher.', 'gutenverse-form')}
                        </h3>
                        <ButtonUpgradePro
                            location="popup"
                            isBanner={true}
                            link={appendTrackingParams(upgradeLink)}
                            customStyles={{ height: '16px', padding: '12px 25px 12px 30px' }}
                            licenseType={integrationLicenseType}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

const IntegrationItem = ({ service, status, onToggle }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
    const isActive = !!status;

    const handleToggle = () => {
        if (!hasIntegrationPro) {
            setIsUpgradeOpen(true);
            return;
        }

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
            <div className={classnames('integration-item', {
                active: isActive,
                locked: !hasIntegrationPro,
            })}>
                {!hasIntegrationPro && <p className="pro-label">{__('PRO', 'gutenverse-form')}</p>}
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
                                if (!hasIntegrationPro) {
                                    setIsUpgradeOpen(true);
                                    return;
                                }

                                window.location.href = integrationSetupUrl(service.id);
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
            <UpgradeModal
                isOpen={isUpgradeOpen}
                onClose={() => setIsUpgradeOpen(false)}
            />
        </>
    );
};

const TabSetting = ({ onSetup }) => {
    const [integrations, setIntegrations] = useState(integrationConfig?.integrations || {});
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

const formatFieldLabel = (field) => field?.required ? `${field.label} *` : field.label;

const SECRET_CLEAR_SENTINEL = '__gutenverse_clear_secret__';

const SecretField = ({ fieldKey, field, value, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const hasDraftValue = typeof value === 'string' && value.length > 0 && value !== SECRET_CLEAR_SENTINEL;
    const hasSavedValue = !!field?.hasSavedValue;

    const description = field.description || __('This value is stored securely and hidden after saving.', 'gutenverse-form');

    return (
        <div className="setup-secret-field">
            {!isEditing && hasSavedValue ? (
                <>
                    <div className="components-base-control">
                        <div className="components-base-control__field">
                            <label className="components-base-control__label">
                                {formatFieldLabel(field)}
                            </label>
                            <p>{__('Credentials saved.', 'gutenverse-form')}</p>
                            <p className="description">{description}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setIsEditing(true);
                                onChange(fieldKey, '');
                            }}
                        >
                            {__('Change Credentials', 'gutenverse-form')}
                        </Button>
                        <Button
                            variant="tertiary"
                            isDestructive
                            onClick={() => {
                                setIsEditing(true);
                                onChange(fieldKey, SECRET_CLEAR_SENTINEL);
                            }}
                        >
                            {__('Clear Credentials', 'gutenverse-form')}
                        </Button>
                    </div>
                </>
            ) : field.type === 'textarea' ? (
                <TextareaControl
                    label={formatFieldLabel(field)}
                    value={value === SECRET_CLEAR_SENTINEL ? '' : (value || '')}
                    onChange={(val) => onChange(fieldKey, val)}
                    placeholder={field.placeholder}
                    help={description}
                    rows={10}
                />
            ) : (
                <TextControl
                    label={formatFieldLabel(field)}
                    value={value === SECRET_CLEAR_SENTINEL ? '' : (value || '')}
                    onChange={(val) => onChange(fieldKey, val)}
                    placeholder={field.placeholder}
                    help={description}
                    type="password"
                />
            )}
            {isEditing && hasSavedValue && !hasDraftValue && value !== SECRET_CLEAR_SENTINEL && (
                <p className="description">
                    {__('Leave this empty to keep the currently saved credential, or paste a new one to replace it.', 'gutenverse-form')}
                </p>
            )}
        </div>
    );
};


const ServiceSetup = ({ serviceId, title }) => {
    const config = integrationConfig;
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
                            {field.sensitive ? (
                                <SecretField
                                    fieldKey={key}
                                    field={field}
                                    value={settings[key]}
                                    onChange={updateSetting}
                                />
                            ) : field.type === 'textarea' ? (
                                <TextareaControl
                                    label={formatFieldLabel(field)}
                                    value={settings[key] || ''}
                                    onChange={(val) => updateSetting(key, val)}
                                    placeholder={field.placeholder}
                                    help={field.description}
                                    rows={10}
                                />
                            ) : field.type === 'select' ? (
                                <SelectControl
                                    label={formatFieldLabel(field)}
                                    value={settings[key] || field.default || ''}
                                    options={field.options || []}
                                    onChange={(val) => updateSetting(key, val)}
                                    help={field.description}
                                />
                            ) : (
                                <TextControl
                                    label={formatFieldLabel(field)}
                                    value={settings[key] || ''}
                                    onChange={(val) => updateSetting(key, val)}
                                    placeholder={field.placeholder}
                                    help={field.description}
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

const IntegrationPage = () => {
    const [currentService, setCurrentService] = useState(window['GutenverseConfig']?.currentService || '');

    if (currentService) {
        const service = services.find(s => s.id === currentService);
        return (
            <div className="gutenverse-form-integration-wrap">
                <div className="integration-header">
                    <h1>{service ? service.title : __('Integration', 'gutenverse-form')}</h1>
                    <button className="back-button" onClick={() => {
                        window.location.href = dashboardIntegrationUrl;
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

    return (
        <>
            <div className="gutenverse-form-integration-wrap">

                {SettingTab}

                {applyFilters('gutenverse.form.integration.content.setting', null)}
            </div>
        </>
    );
};

export default IntegrationPage;
