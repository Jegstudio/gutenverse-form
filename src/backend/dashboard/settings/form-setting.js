import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { ControlText, ControlTextarea, ControlCheckbox, ControlSelect } from 'gutenverse-core/backend';
import { applyFilters } from '@wordpress/hooks';
import { activeTheme, clientUrl, upgradeProUrl } from 'gutenverse-core/config';
import { openFreemiusPopup, prefetchPricingPlanData } from 'gutenverse-core/helper';
import { EmailTemplateManager } from '../../form/src/form-content';

const formSettingKeys = ['form_settings'];

const ExampleFillButton = ({
    onClick,
    title = __('Need a quick starting point?', 'gutenverse-form'),
    description = __('Auto-fill these fields with sample values you can edit afterward.', 'gutenverse-form'),
    label = __('Use Example Data', 'gutenverse-form'),
    success = false
}) => (
    <div className={`gutenverse-example-fill ${success ? 'is-success' : ''}`}>
        <div className="gutenverse-example-fill-copy">
            <div className="gutenverse-example-fill-title">
                {success ? __('Example data inserted', 'gutenverse-form') : title}
            </div>
            <div className="gutenverse-example-fill-description">
                {success
                    ? __('You can tweak the values below to match your real setup.', 'gutenverse-form')
                    : description}
            </div>
        </div>
        <button
            type="button"
            className="gutenverse-example-fill-button"
            onClick={onClick}
        >
            {label}
        </button>
    </div>
);

const FormConfirmation = ({ settingValues, updateSettingValues, saving, saveData, emailTemplates, refreshTemplates }) => {
    const {
        form_confirmation = {}
    } = settingValues;
    const [exampleFilled, setExampleFilled] = useState(false);

    const updateValue = (id, value) => {
        updateSettingValues('form_confirmation', id, value);
    };

    const fillConfirmationExample = () => {
        updateValue('email_input_name', 'input-email');
        updateValue('user_email_form', __('johndoe@gmail.com', 'gutenverse-form'));
        if (form_confirmation.user_email_subject_type === 'post_meta') {
            updateValue('user_email_subject_meta_key', __('custom_email_subject', 'gutenverse-form'));
        } else {
            updateValue('user_email_subject', __('Thank you for contacting us', 'gutenverse-form'));
        }
        if (!form_confirmation.user_email_reply_to_type || form_confirmation.user_email_reply_to_type === 'static') {
            updateValue('user_email_reply_to', __('johndoe@gmail.com', 'gutenverse-form'));
        }
        if (!form_confirmation.user_message_type || form_confirmation.user_message_type === 'static') {
            updateValue('user_email_body', __('Hi {{input-email}}, thanks for your submission.', 'gutenverse-form'));
        }
        setExampleFilled(true);
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
            <ExampleFillButton
                onClick={fillConfirmationExample}
                title={__('Want help filling this email?', 'gutenverse-form')}
                description={__('Insert a sample confirmation setup so you can edit from a realistic starting point.', 'gutenverse-form')}
                success={exampleFilled}
            />
            <ControlText
                id={'email_input_name'}
                title={__('Recipient Field ID', 'gutenverse-form')}
                description={__('The specific input ID (name) to use as the recipient email address.', 'gutenverse-form')}
                defaultValue={'input-email'}
                value={form_confirmation.email_input_name}
                updateValue={updateValue}
            />
            <ControlSelect
                id={'user_email_subject_type'}
                title={__('Subject Type', 'gutenverse-form')}
                description={__('Choose between static text or a meta action value.', 'gutenverse-form')}
                value={form_confirmation.user_email_subject_type || 'static'}
                options={[
                    { label: __('Static Text', 'gutenverse-form'), value: 'static' },
                    { label: __('Meta Action', 'gutenverse-form'), value: 'post_meta' },
                ]}
                updateValue={updateValue}
            />
            {form_confirmation.user_email_subject_type === 'post_meta' ? (
                <ControlText
                    id={'user_email_subject_meta_key'}
                    title={__('Meta Key', 'gutenverse-form')}
                    description={__('The custom field name containing the subject.', 'gutenverse-form')}
                    value={form_confirmation.user_email_subject_meta_key}
                    updateValue={updateValue}
                />
            ) : (
                <ControlText
                    id={'user_email_subject'}
                    title={__('Email Subject', 'gutenverse-form')}
                    description={__('The subject line for the confirmation email.', 'gutenverse-form')}
                    value={form_confirmation.user_email_subject}
                    updateValue={updateValue}
                />
            )}
            <ControlText
                id={'user_email_form'}
                title={__('Sender Email', 'gutenverse-form')}
                description={__('The email address the confirmation is sent from. Must match your SMTP settings.', 'gutenverse-form')}
                value={form_confirmation.user_email_form}
                updateValue={updateValue}
            />
            <ControlSelect
                id={'user_email_reply_to_type'}
                title={__('Reply-To Type', 'gutenverse-form')}
                description={__('Choose a fixed reply address or use the current post author with the site admin as fallback.', 'gutenverse-form')}
                value={form_confirmation.user_email_reply_to_type || 'static'}
                options={[
                    { label: __('Static Email', 'gutenverse-form'), value: 'static' },
                    { label: __('Post Author / Site Admin', 'gutenverse-form'), value: 'dynamic' },
                ]}
                updateValue={updateValue}
            />
            {form_confirmation.user_email_reply_to_type === 'dynamic' ? (
                <p className="gutenverse-form-description">
                    {__('Replies to this confirmation email will go to the current post author when available. If the form is not submitted from a post, replies go to the site admin email.', 'gutenverse-form')}
                </p>
            ) : (
                <ControlText
                    id={'user_email_reply_to'}
                    title={__('Reply-To Address', 'gutenverse-form')}
                    description={__('The static email address where user replies will be sent.', 'gutenverse-form')}
                    value={form_confirmation.user_email_reply_to}
                    updateValue={updateValue}
                />
            )}
            <div className="gutenverse-form-group">
                <h4 className="gutenverse-form-group-title">{__('Email Content', 'gutenverse-form')}</h4>
                <p className="gutenverse-form-group-description">{__('Use a quick text message or design a reusable email template.', 'gutenverse-form')}</p>
                <ControlSelect
                    id={'user_message_type'}
                    title={__('Email Content Type', 'gutenverse-form')}
                    description={__('Choose between a custom static message or an email template.', 'gutenverse-form')}
                    value={form_confirmation.user_message_type || 'static'}
                    options={[
                        { label: __('Static Text', 'gutenverse-form'), value: 'static' },
                        { label: __('Email Template', 'gutenverse-form'), value: 'template' },
                    ]}
                    updateValue={updateValue}
                />
                {(!form_confirmation.user_message_type || form_confirmation.user_message_type === 'static') && (
                    <ControlTextarea
                        id={'user_email_body'}
                        title={__('Email Body', 'gutenverse-form')}
                        description={__('The content of the confirmation email.', 'gutenverse-form')}
                        value={form_confirmation.user_email_body}
                        updateValue={updateValue}
                    />
                )}
                {form_confirmation.user_message_type === 'template' && (
                    <EmailTemplateManager
                        templateId={form_confirmation.user_email_template}
                        fieldName={'user_email_template'}
                        updateValue={updateValue}
                        emailTemplates={emailTemplates}
                        onRefresh={refreshTemplates}
                        formTitle={__('Default Confirmation Email', 'gutenverse-form')}
                        formValues={form_confirmation}
                    />
                )}
            </div>
        </>}
        <div className="actions">
            {saving ? <div className="gutenverse-button">
                {__('Saving...', 'gutenverse-form')}
            </div> : <div className="gutenverse-button" onClick={() => saveData(formSettingKeys)}>
                {__('Save Changes', 'gutenverse-form')}
            </div>}
        </div>
    </div>;
};

const FormDailySummary = ({ settingValues, updateSettingValues, saving, saveData }) => {
    const {
        dashboard = {}
    } = settingValues;

    const updateValue = (id, value) => {
        updateSettingValues('dashboard', id, value);
    };

    return <div className="form-tab-body form-daily-summary-setting">
        <h2>{__('Dashboard', 'gutenverse-form')}</h2>
        <span>{__('Manage form dashboard reporting preferences.', 'gutenverse-form')}</span>
        <ControlCheckbox
            id={'daily_admin_summary'}
            title={__('Daily Admin Summary Email', 'gutenverse-form')}
            description={__('Send one daily dashboard summary to the site admin email with submission totals and quick links to entries.', 'gutenverse-form')}
            value={dashboard.daily_admin_summary}
            updateValue={updateValue}
        />
        <div className="actions">
            {saving ? <div className="gutenverse-button">
                {__('Saving...', 'gutenverse-form')}
            </div> : <div className="gutenverse-button" onClick={() => saveData(formSettingKeys)}>
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
            </div> : <div className="gutenverse-button" onClick={() => saveData(formSettingKeys)}>
                {__('Save Changes', 'gutenverse-form')}
            </div>}
        </div>
    </div>;
};

const FormReCaptcha = ({ settingValues, updateSettingValues, saving, saveData }) => {
    const {
        form_captcha_settings = {}
    } = settingValues;
    const emptyLicense = applyFilters('gutenverse.panel.tab.pro.content', true);
    const isLocked = emptyLicense;

    const updateValue = (id, value) => {
        if (isLocked) {
            return;
        }
        updateSettingValues('form_captcha_settings', id, value);
    };

    const openUpgradePopup = (event = null) => {
        openFreemiusPopup(
            event,
            `${upgradeProUrl}?utm_source=gutenverse&utm_medium=formCaptchaSetting&utm_client_site=${clientUrl}&utm_client_theme=${activeTheme}`,
            { medium: 'formCaptchaSetting' }
        );
    };

    return <div className="form-captcha">
        <h2>{__('Form Captcha Settings', 'gutenverse-form')}</h2>
        <span>{__('This setting will be used in form reCaptcha feature', 'gutenverse-form')}</span>
        <div
            className={`form-captcha-field${isLocked ? ' is-locked' : ''}`}
            onMouseEnter={isLocked ? prefetchPricingPlanData : undefined}
            onFocus={isLocked ? prefetchPricingPlanData : undefined}
        >
            <ControlText
                id={'captcha_key'}
                title={<span className="form-captcha-title">
                    <span>{__('Captcha Secret Key', 'gutenverse-form')}</span>
                    {isLocked && <span className="pro-label">{__('PRO', 'gutenverse-form')}</span>}
                </span>}
                description={isLocked ? '' : __('Enter your captcha secret here.', 'gutenverse-form')}
                value={form_captcha_settings.captcha_key}
                updateValue={updateValue}
                disabled={isLocked}
            />
            {isLocked && <>
                <button
                    type="button"
                    className="form-captcha-lock-overlay"
                    onClick={openUpgradePopup}
                    aria-label={__('Upgrade to Pro to unlock Captcha Secret Key editing', 'gutenverse-form')}
                />
            </>}
        </div>
        <div className="actions">
            {saving ? <div className="gutenverse-button">
                {__('Saving...', 'gutenverse-form')}
            </div> : <div className={`gutenverse-button${isLocked ? ' disabled' : ''}`} onClick={() => !isLocked && saveData(formSettingKeys)}>
                {__('Save Changes', 'gutenverse-form')}
            </div>}
        </div>
    </div>;
};

const FormSetting = (props) => {
    const [formActive, setFormActive] = useState('dashboard');

    let form = '';

    switch (formActive) {
        case 'dashboard':
            form = <FormDailySummary {...props} />;
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
        <div className="form-notification-settings">
            <h2>{__('Form Notification Settings', 'gutenverse-form')}</h2>
            <p>{__('This setting will be used for form on submit notifications', 'gutenverse-form')}</p>
            <div className="form-setting">
                <div className={`${formActive === 'dashboard' ? 'active' : ''}`} onClick={() => setFormActive('dashboard')}>{__('Dashboard', 'gutenverse-form')}</div>
                <div className={`${formActive === 'confirmation' ? 'active' : ''}`} onClick={() => setFormActive('confirmation')}>{__('User Confirmation', 'gutenverse-form')}</div>
                <div className={`${formActive === 'notification' ? 'active' : ''}`} onClick={() => setFormActive('notification')}>{__('Admin Notification', 'gutenverse-form')}</div>
            </div>
            <div className="form-setting-content">
                {form}
            </div>
        </div>

        {applyFilters('gutenverse.dashboard.form.body', additionalMenu, props)}
    </>;
};

export default FormSetting;
