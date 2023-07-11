import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { ControlText, ControlTextarea, ControlCheckbox } from 'gutenverse-core/backend';
import { applyFilters } from '@wordpress/hooks';

const FormConfirmation = ({ settingValues, updateSettingValues, saving, saveData }) => {
    const {
        form_confirmation = {}
    } = settingValues;

    const updateValue = (id, value) => {
        updateSettingValues('form_confirmation', id, value);
    };

    return <div className="form-tab-body">
        <h2>{__('Confirmation Mail to User (Default Setting)')}</h2>
        <span>{__('This setting will be the default for "confirmation email to user" when you create a new form.', 'gutenverse')}</span>
        <ControlCheckbox
            id={'user_confirm'}
            title={__('Confirmation Mail to User', 'gutenverse')}
            description={__('Send confirmation email to user. (To be able to send email, please make sure you\'ve setup SMTP correctly).', 'gutenverse')}
            value={form_confirmation.user_confirm}
            updateValue={updateValue}
        />
        {form_confirmation.user_confirm && <>
            <ControlCheckbox
                id={'auto_select_email'}
                title={__('Auto Select Email', 'gutenverse')}
                description={__('This will automatically select emails inputted from email\'s fields.', 'gutenverse')}
                value={form_confirmation.auto_select_email}
                updateValue={updateValue}
            />
            {!form_confirmation.auto_select_email && <ControlText
                id={'email_input_name'}
                title={__('Use Input\'s Name', 'gutenverse')}
                description={__('Only the selected input name will be sent email. (e.g : input-email).', 'gutenverse')}
                defaultValue={'input-email'}
                value={form_confirmation.email_input_name}
                updateValue={updateValue}
            />}
            <ControlText
                id={'user_email_subject'}
                title={__('Email\'s Subject', 'gutenverse')}
                description={__('This will be your email\'s subject or title.', 'gutenverse')}
                value={form_confirmation.user_email_subject}
                updateValue={updateValue}
            />
            <ControlText
                id={'user_email_form'}
                title={__('Email\'s Sender', 'gutenverse')}
                description={__('Enter the sender email by which you want to send email to user. (Please make sure you use the same email in your SMTP setup).', 'gutenverse')}
                value={form_confirmation.user_email_form}
                updateValue={updateValue}
            />
            <ControlText
                id={'user_email_reply_to'}
                title={__('Email\'s Reply Target', 'gutenverse')}
                description={__('Enter email where user can reply/ you want to get reply.', 'gutenverse')}
                value={form_confirmation.user_email_reply_to}
                updateValue={updateValue}
            />
            <ControlTextarea
                id={'user_email_body'}
                title={__('Messages to User', 'gutenverse')}
                description={__('Enter your messages to include it in email\'s body which will be send to user.', 'gutenverse')}
                value={form_confirmation.user_email_body}
                updateValue={updateValue}
            />
        </>}
        <div className="actions">
            {saving ? <div className="gutenverse-button">
                {__('Saving...', 'gutenverse')}
            </div> : <div className="gutenverse-button" onClick={() => saveData(['form_confirmation', 'form_notification', 'form_paypal_payment', 'form_stripe_payment'])}>
                {__('Save Changes', 'gutenverse')}
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
        <h2>{__('Notification Mail to Admin (Default Setting)')}</h2>
        <span>{__('This setting will be the default for "admin notification" when you create a new form.', 'gutenverse')}</span>
        <ControlCheckbox
            id={'admin_confirm'}
            title={__('Notification Mail to Admin', 'gutenverse')}
            description={__('Send notification email to you or your admin. (To be able to send email, please make sure you\'ve setup SMTP correctly).', 'gutenverse')}
            value={form_notification.admin_confirm}
            updateValue={updateValue}
        />
        {form_notification.admin_confirm && <>
            <ControlText
                id={'admin_email_subject'}
                title={__('Email Subject', 'gutenverse')}
                description={__('This will be your email\'s subject or title.', 'gutenverse')}
                value={form_notification.admin_email_subject}
                updateValue={updateValue}
            />
            <ControlText
                id={'admin_email_to'}
                title={__('Email\'s Recipient', 'gutenverse')}
                description={__('Enter admin email where you want to send mail (For multiple email addresses please use "," as separator).', 'gutenverse')}
                value={form_notification.admin_email_to}
                updateValue={updateValue}
            />
            <ControlText
                id={'admin_email_from'}
                title={__('Email\'s Sender', 'gutenverse')}
                description={__('Enter the sender email by which you want to send email to admin. (Please make sure you use the same email in your SMTP setup).', 'gutenverse')}
                value={form_notification.admin_email_from}
                updateValue={updateValue}
            />
            <ControlText
                id={'admin_email_reply_to'}
                title={__('Email\'s Reply Target', 'gutenverse')}
                description={__('Enter email where admin can reply/ you want to get reply.', 'gutenverse')}
                value={form_notification.admin_email_reply_to}
                updateValue={updateValue}
            />
            <ControlTextarea
                id={'admin_note'}
                title={__('Messages to Admin', 'gutenverse')}
                description={__('Enter your messages to include it in email\'s body which will be send to admin.', 'gutenverse')}
                value={form_notification.admin_note}
                updateValue={updateValue}
            />
        </>}
        <div className="actions">
            {saving ? <div className="gutenverse-button">
                {__('Saving...', 'gutenverse')}
            </div> : <div className="gutenverse-button" onClick={() => saveData(['form_confirmation', 'form_notification', 'form_paypal_payment', 'form_stripe_payment'])}>
                {__('Save Changes', 'gutenverse')}
            </div>}
        </div>
    </div>;
};

const FormSetting = (props) => {
    const [formActive, setFormActive] = useState('confirmation');

    let form = '';

    switch (formActive) {
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
        <div className="form-setting">
            <div className={`${formActive === 'confirmation' ? 'active' : ''}`} onClick={() => setFormActive('confirmation')}>{__('User Confirmation', 'gutenverse')}</div>
            <div className={`${formActive === 'notification' ? 'active' : ''}`} onClick={() => setFormActive('notification')}>{__('Admin Notification', 'gutenverse')}</div>
        </div>
        <div>
            {form}
        </div>
        {applyFilters('gutenverse.dashboard.form.body', additionalMenu, props)}
    </>;
};

export default FormSetting;