import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { ControlText, ControlTextarea, ControlCheckbox } from 'gutenverse-core/backend';
import { applyFilters } from '@wordpress/hooks';
import apiFetch from '@wordpress/api-fetch';

const FormConfirmation = ({ settingValues, updateSettingValues, saving, saveData }) => {
    const {
        form_confirmation = {}
    } = settingValues;

    const updateValue = (id, value) => {
        updateSettingValues('form_confirmation', id, value);
    };

    return <div className="form-tab-body">
        <h2>{__('Confirmation Mail to User (Default Setting)', 'gutenverse-form')}</h2>
        <span>{__('This setting will be the default for "confirmation email to user" when you create a new form.', 'gutenverse-form')}</span>
        <ControlCheckbox
            id={'user_confirm'}
            title={__('Confirmation Mail to User', 'gutenverse-form')}
            description={__('Send confirmation email to user. (To be able to send email, please make sure you\'ve setup SMTP correctly).', 'gutenverse-form')}
            value={form_confirmation.user_confirm}
            updateValue={updateValue}
        />
        {form_confirmation.user_confirm && <>
            <ControlCheckbox
                id={'auto_select_email'}
                title={__('Auto Select Email', 'gutenverse-form')}
                description={__('This will automatically select emails inputted from email\'s fields.', 'gutenverse-form')}
                value={form_confirmation.auto_select_email}
                updateValue={updateValue}
            />
            {!form_confirmation.auto_select_email && <ControlText
                id={'email_input_name'}
                title={__('Use Input\'s Name', 'gutenverse-form')}
                description={__('Only the selected input name will be sent email. (e.g : input-email).', 'gutenverse-form')}
                defaultValue={'input-email'}
                value={form_confirmation.email_input_name}
                updateValue={updateValue}
            />}
            <ControlText
                id={'user_email_subject'}
                title={__('Email\'s Subject', 'gutenverse-form')}
                description={__('This will be your email\'s subject or title.', 'gutenverse-form')}
                value={form_confirmation.user_email_subject}
                updateValue={updateValue}
            />
            <ControlText
                id={'user_email_form'}
                title={__('Email\'s Sender', 'gutenverse-form')}
                description={__('Enter the sender email by which you want to send email to user. (Please make sure you use the same email in your SMTP setup).', 'gutenverse-form')}
                value={form_confirmation.user_email_form}
                updateValue={updateValue}
            />
            <ControlText
                id={'user_email_reply_to'}
                title={__('Email\'s Reply Target', 'gutenverse-form')}
                description={__('Enter email where user can reply/ you want to get reply.', 'gutenverse-form')}
                value={form_confirmation.user_email_reply_to}
                updateValue={updateValue}
            />
            <ControlTextarea
                id={'user_email_body'}
                title={__('Messages to User', 'gutenverse-form')}
                description={__('Enter your messages to include it in email\'s body which will be send to user.', 'gutenverse-form')}
                value={form_confirmation.user_email_body}
                updateValue={updateValue}
            />
        </>}
        <div className="actions">
            {saving ? <div className="gutenverse-button">
                {__('Saving...', 'gutenverse-form')}
            </div> : <div className="gutenverse-button" onClick={() => saveData(['form_confirmation', 'form_notification', 'form_paypal_payment', 'form_stripe_payment', 'form_captcha_settings'])}>
                {__('Save Changes', 'gutenverse-form')}
            </div>}
        </div>
    </div>;
};

const FormNotification = ({ settingValues, updateSettingValues, saving, saveData }) => {
    const {
        form_notification = {}
    } = settingValues;

    const updateValue = (id, value) => {
        updateSettingValues('form_notification', id, value);
    };

    return <div className="form-tab-body">
        <h2>{__('Notification Mail to Admin (Default Setting)', 'gutenverse-form')}</h2>
        <span>{__('This setting will be the default for "admin notification" when you create a new form.', 'gutenverse-form')}</span>
        <ControlCheckbox
            id={'admin_confirm'}
            title={__('Notification Mail to Admin', 'gutenverse-form')}
            description={__('Send notification email to you or your admin. (To be able to send email, please make sure you\'ve setup SMTP correctly).', 'gutenverse-form')}
            value={form_notification.admin_confirm}
            updateValue={updateValue}
        />
        {form_notification.admin_confirm && <>
            <ControlText
                id={'admin_email_subject'}
                title={__('Email Subject', 'gutenverse-form')}
                description={__('This will be your email\'s subject or title.', 'gutenverse-form')}
                value={form_notification.admin_email_subject}
                updateValue={updateValue}
            />
            <ControlText
                id={'admin_email_to'}
                title={__('Email\'s Recipient', 'gutenverse-form')}
                description={__('Enter admin email where you want to send mail (For multiple email addresses please use "," as separator).', 'gutenverse-form')}
                value={form_notification.admin_email_to}
                updateValue={updateValue}
            />
            <ControlText
                id={'admin_email_from'}
                title={__('Email\'s Sender', 'gutenverse-form')}
                description={__('Enter the sender email by which you want to send email to admin. (Please make sure you use the same email in your SMTP setup).', 'gutenverse-form')}
                value={form_notification.admin_email_from}
                updateValue={updateValue}
            />
            <ControlText
                id={'admin_email_reply_to'}
                title={__('Email\'s Reply Target', 'gutenverse-form')}
                description={__('Enter email where admin can reply/ you want to get reply.', 'gutenverse-form')}
                value={form_notification.admin_email_reply_to}
                updateValue={updateValue}
            />
            <ControlTextarea
                id={'admin_note'}
                title={__('Messages to Admin', 'gutenverse-form')}
                description={__('Enter your messages to include it in email\'s body which will be send to admin.', 'gutenverse-form')}
                value={form_notification.admin_note}
                updateValue={updateValue}
            />
        </>}
        <div className="actions">
            {saving ? <div className="gutenverse-button">
                {__('Saving...', 'gutenverse-form')}
            </div> : <div className="gutenverse-button" onClick={() => saveData(['form_confirmation', 'form_notification', 'form_paypal_payment', 'form_stripe_payment', 'form_captcha_settings'])}>
                {__('Save Changes', 'gutenverse-form')}
            </div>}
        </div>
    </div>;
};

const FormReCaptcha = ({ settingValues, updateSettingValues, saving, saveData }) => {
    const {
        form_captcha_settings = {}
    } = settingValues;

    const updateValue = (id, value) => {
        updateSettingValues('form_captcha_settings', id, value);
    };

    return <div className="form-captcha">
        <h2>{__('Form Captcha Settings', 'gutenverse-form')}</h2>
        <span>{__('This setting will be used in form reCaptcha feature', 'gutenverse-form')}</span>
        <ControlText
            id={'captcha_key'}
            title={__('Captcha Secret Key', 'gutenverse-form')}
            description={__('Enter your captcha secret here.', 'gutenverse-form')}
            value={form_captcha_settings.captcha_key}
            updateValue={updateValue}
        />
        <div className="actions">
            {saving ? <div className="gutenverse-button">
                {__('Saving...', 'gutenverse-form')}
            </div> : <div className="gutenverse-button" onClick={() => saveData(['form_confirmation', 'form_notification', 'form_paypal_payment', 'form_stripe_payment', 'form_captcha_settings'])}>
                {__('Save Changes', 'gutenverse-form')}
            </div>}
        </div>
    </div>;
};

const FormDashboard = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        apiFetch({
            path: '/gutenverse-form-client/v1/form-action/dashboard',
            method: 'GET',
        }).then((response) => {
            setForms(Array.isArray(response) ? response : []);
            setLoading(false);
        }).catch((err) => {
            setError(err?.message || __('Could not load the form dashboard.', 'gutenverse-form'));
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="gutenverse-form-dashboard-page-empty">{__('Loading form dashboard...', 'gutenverse-form')}</div>;
    }

    if (error) {
        return <div className="gutenverse-form-dashboard-page-empty is-error">{error}</div>;
    }

    if (!forms.length) {
        return <div className="gutenverse-form-dashboard-page-empty">{__('No forms found yet.', 'gutenverse-form')}</div>;
    }

    return <div className="gutenverse-form-dashboard-page">
        <div className="gutenverse-form-dashboard-page-hero">
            <div>
                <h2>{__('Form Dashboard', 'gutenverse-form')}</h2>
                <p>{__('Open a form quickly, review total entries, and jump straight to the post or page where the form is used.', 'gutenverse-form')}</p>
            </div>
            <div className="gutenverse-form-dashboard-page-overview">
                <div className="overview-item">
                    <strong>{forms.length}</strong>
                    <span>{__('Forms', 'gutenverse-form')}</span>
                </div>
                <div className="overview-item">
                    <strong>{forms.reduce((total, form) => total + (form.total_entries || 0), 0)}</strong>
                    <span>{__('Total Entries', 'gutenverse-form')}</span>
                </div>
            </div>
        </div>
        <div className="gutenverse-form-dashboard-page-list">
            {forms.map((form) => {
                const primaryLocation = form.locations?.[0];

                return <div key={form.id} className="gutenverse-form-dashboard-page-card">
                    <div className="card-header">
                        <div>
                            <h3>{form.title}</h3>
                            <span>{form.modified ? `${__('Updated', 'gutenverse-form')} ${form.modified}` : ''}</span>
                        </div>
                        <div className="card-actions">
                            {primaryLocation?.edit_url && <a href={primaryLocation.edit_url} className="gutenverse-button">{__('Edit Post', 'gutenverse-form')}</a>}
                            {form.entries_url && <a href={form.entries_url} className="gutenverse-button is-secondary">{__('View Entries', 'gutenverse-form')}</a>}
                        </div>
                    </div>
                    <div className="card-metrics">
                        <div className="metric-box">
                            <strong>{form.total_entries || 0}</strong>
                            <span>{__('Total Entries', 'gutenverse-form')}</span>
                        </div>
                        <div className="metric-box">
                            <strong>{form.entries_last_week || 0}</strong>
                            <span>{__('Last 7 Days', 'gutenverse-form')}</span>
                        </div>
                        <div className="metric-box">
                            <strong>{form.location_count || 0}</strong>
                            <span>{__('Locations', 'gutenverse-form')}</span>
                        </div>
                        <div className="metric-box">
                            <strong>{form.last_entry_date || '-'}</strong>
                            <span>{__('Last Entry', 'gutenverse-form')}</span>
                        </div>
                    </div>
                    <div className="card-grid">
                        <div className="card-panel">
                            <div className="panel-heading">{__('Where this form is used', 'gutenverse-form')}</div>
                            {form.locations?.length ? form.locations.map((location) => (
                                <div key={location.id} className="location-row">
                                    <div>
                                        <strong>{location.title}</strong>
                                        <span>{`${location.type} • ${location.status}`}</span>
                                    </div>
                                    <div className="location-actions">
                                        {location.view_url && <a href={location.view_url}>{__('View', 'gutenverse-form')}</a>}
                                        {location.edit_url && <a href={location.edit_url}>{__('Edit', 'gutenverse-form')}</a>}
                                    </div>
                                </div>
                            )) : <div className="empty-copy">{__('No linked post or page detected yet.', 'gutenverse-form')}</div>}
                        </div>
                        <div className="card-panel">
                            <div className="panel-heading">{__('Recent entries', 'gutenverse-form')}</div>
                            {form.latest_entries?.length ? form.latest_entries.map((entry) => (
                                <div key={entry.id} className="location-row">
                                    <div>
                                        <strong>{entry.title}</strong>
                                        <span>{entry.source_title ? `${entry.date} • ${entry.source_title}` : entry.date}</span>
                                    </div>
                                    <div className="location-actions">
                                        {entry.edit_url && <a href={entry.edit_url}>{__('Open Entry', 'gutenverse-form')}</a>}
                                    </div>
                                </div>
                            )) : <div className="empty-copy">{__('No entries have been submitted yet.', 'gutenverse-form')}</div>}
                        </div>
                    </div>
                </div>;
            })}
        </div>
    </div>;
};

const FormSetting = (props) => {
    const [formActive, setFormActive] = useState('dashboard');

    let form = '';

    switch (formActive) {
        case 'dashboard':
            form = <FormDashboard />;
            break;
        case 'confirmation':
            form = <FormConfirmation {...props} />;
            break;
        case 'notification':
            form = <FormNotification {...props} />;
            break;
        default:
            form = null;
            break;
    }

    const additionalMenu = [];

    return <>
        <FormReCaptcha {...props} />
        <div className="form-setting">
            <div className={`${formActive === 'dashboard' ? 'active' : ''}`} onClick={() => setFormActive('dashboard')}>{__('Dashboard', 'gutenverse-form')}</div>
            <div className={`${formActive === 'confirmation' ? 'active' : ''}`} onClick={() => setFormActive('confirmation')}>{__('User Confirmation', 'gutenverse-form')}</div>
            <div className={`${formActive === 'notification' ? 'active' : ''}`} onClick={() => setFormActive('notification')}>{__('Admin Notification', 'gutenverse-form')}</div>
        </div>
        <div>
            {form}
        </div>
        {applyFilters('gutenverse.dashboard.form.body', additionalMenu, props)}
    </>;
};

export default FormSetting;
