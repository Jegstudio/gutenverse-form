import classnames from 'classnames';
import { AlertControl } from 'gutenverse-core/controls';
import { ControlText, ControlTextarea, ControlCheckbox } from 'gutenverse-core/backend';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { IconCloseSVG } from 'gutenverse-core/icons';
import apiFetch from '@wordpress/api-fetch';
import { isEmpty } from 'lodash';
import { ButtonUpgradePro } from 'gutenverse-core/components';
import { ImageFormNoticeSVG } from '../../../assets/image';

const TabGeneral = (props) => {
    const { values, updateValue } = props;

    return <div className="form-tab-body">
        <ControlText
            id={'title'}
            title={__('Form Title', 'gutenverse')}
            description={__('This title will be searchable in Gutenverse Form Builder Block.', 'gutenverse')}
            value={values.title}
            {...props}
        />
        <ControlCheckbox
            id={'require_login'}
            title={__('Require Login', 'gutenverse')}
            description={__('Hide form if the user is not logged in.', 'gutenverse')}
            value={values.require_login}
            updateValue={updateValue}
        />
        <ControlCheckbox
            id={'user_browser'}
            title={__('Capture User Browser Data', 'gutenverse')}
            description={__('Store user\'s browser data such as ip, browser name, etc. (If you served website for countries with GDPR law, please make sure you\'ve setup notice for your user regarding the datas you collect.)', 'gutenverse')}
            value={values.user_browser}
            updateValue={updateValue}
        />
        <ControlText
            id={'form_success_notice'}
            title={__('Success Notice on Submit', 'gutenverse')}
            description={__('This will be your success notice when form is successfully submitted. (If empty, notice will not be showed).', 'gutenverse')}
            value={values.form_success_notice}
            updateValue={updateValue}
        />
        <ControlText
            id={'form_error_notice'}
            title={__('Error Notice on Submit', 'gutenverse')}
            description={__('This will be your error notice when form is failed on submit. (If empty, notice will not be showed).', 'gutenverse')}
            value={values.form_error_notice}
            updateValue={updateValue}
        />
    </div>;
};

const TabConfirmation = (props) => {
    const { values, updateValue } = props;

    return <div className="form-tab-body">
        <ControlCheckbox
            id={'user_confirm'}
            title={__('Confirmation Mail to User', 'gutenverse')}
            description={__('Send confirmation email to user. (To be able to send email, please make sure you\'ve setup SMTP correctly).', 'gutenverse')}
            value={values.user_confirm}
            updateValue={updateValue}
        />
        {values.user_confirm && <>
            <ControlCheckbox
                id={'auto_select_email'}
                title={__('Auto Select Email', 'gutenverse')}
                description={__('This will automatically select emails inputted from email\'s fields. Please make sure the input field is "email" and not "text"', 'gutenverse')}
                value={values.auto_select_email}
                updateValue={updateValue}
            />
            {!values.auto_select_email && <ControlText
                id={'email_input_name'}
                title={__('Use Input\'s Name', 'gutenverse')}
                description={__('Only the selected input name will be sent email. (e.g : input-email).', 'gutenverse')}
                defaultValue={'input-email'}
                value={values.email_input_name}
                updateValue={updateValue}
            />}
            <ControlText
                id={'user_email_subject'}
                title={__('Email\'s Subject', 'gutenverse')}
                description={__('This will be your email\'s subject or title. (e.g : Thank you for your submission).', 'gutenverse')}
                value={values.user_email_subject}
                updateValue={updateValue}
            />
            <ControlText
                id={'user_email_form'}
                title={__('Email\'s Sender', 'gutenverse')}
                description={__('Enter the sender email by which you want to send email to user. (Please make sure you use the same email in your SMTP setup).', 'gutenverse')}
                value={values.user_email_form}
                updateValue={updateValue}
            />
            <ControlText
                id={'user_email_reply_to'}
                title={__('Email\'s Reply Target', 'gutenverse')}
                description={__('Enter email where user can reply/ you want to get reply. (e.g : supportreply@email.com).', 'gutenverse')}
                value={values.user_email_reply_to}
                updateValue={updateValue}
            />
            <ControlTextarea
                id={'user_email_body'}
                title={__('Messages to User', 'gutenverse')}
                description={__('Enter your messages to include it in email\'s body which will be send to user. (e.g : Thank you for your participation in the survey!).', 'gutenverse')}
                value={values.user_email_body}
                updateValue={updateValue}
            />
        </>}
    </div>;
};

const TabNotification = (props) => {
    const { values, updateValue } = props;

    return <div className="form-tab-body">
        <ControlCheckbox
            id={'admin_confirm'}
            title={__('Notification Mail to Admin', 'gutenverse')}
            description={__('Send notification email to you or your admin. (To be able to send email, please make sure you\'ve setup SMTP correctly).', 'gutenverse')}
            value={values.admin_confirm}
            updateValue={updateValue}
        />
        {values.admin_confirm && <>
            <ControlText
                id={'admin_email_subject'}
                title={__('Email Subject', 'gutenverse')}
                description={__('This will be your email\'s subject or title. (e.g : User submission).', 'gutenverse')}
                value={values.admin_email_subject}
                updateValue={updateValue}
            />
            <ControlText
                id={'admin_email_to'}
                title={__('Email\'s Recipient', 'gutenverse')}
                description={__('Enter admin email where you want to send mail (For multiple email addresses please use "," as separator).', 'gutenverse')}
                value={values.admin_email_to}
                updateValue={updateValue}
            />
            <ControlText
                id={'admin_email_from'}
                title={__('Email\'s Sender', 'gutenverse')}
                description={__('Enter the sender email by which you want to send email to admin. (Please make sure you use the same email in your SMTP setup).', 'gutenverse')}
                value={values.admin_email_from}
                updateValue={updateValue}
            />
            <ControlText
                id={'admin_email_reply_to'}
                title={__('Email\'s Reply Target', 'gutenverse')}
                description={__('Enter email where admin can reply/ you want to get reply. (e.g : admnreply@email.com).', 'gutenverse')}
                value={values.admin_email_reply_to}
                updateValue={updateValue}
            />
            <ControlTextarea
                id={'admin_note'}
                title={__('Messages to Admin', 'gutenverse')}
                description={__('Enter your messages to include it in email\'s body which will be send to admin. (e.g : A submission from user with the following data.).', 'gutenverse')}
                value={values.admin_note}
                updateValue={updateValue}
            />
        </>}
    </div>;
};

export const FormContent = (props) => {
    const [tab, setActiveTab] = useState('general');
    const [hideFormNotice, setHideFormNotice] = !isEmpty(window['GutenverseConfig']) ? useState(window['GutenverseConfig']['hideFormNotice']) : useState(false);

    const tabs = {
        general: __('General', 'gutenverse'),
        confirmation: __('Confirmation', 'gutenverse'),
        notification: __('Notification', 'gutenverse'),
    };

    const changeActive = key => {
        setActiveTab(key);
    };

    const ConfirmationTab = applyFilters(
        'gutenverse.form.tab.confirmation',
        <TabConfirmation {...props} />,
        props
    );
    const NotificationTab = applyFilters(
        'gutenverse.form.tab.notification',
        <TabNotification {...props} />,
        props
    );

    const closeNotice = (id) => {
        apiFetch({
            path: 'gutenverse-client/v1/notice/close',
            method: 'POST',
            data: {
                id: id
            }
        }).then(() => { });
    };

    return <div>
        {!hideFormNotice && <div className="form-notice-wrapper">
            <AlertControl>
                <>
                    <div>
                        <p>
                            {__('Please make sure you have setup SMTP first to be able to use this form full functionality, otherwise the form will not be able to send email. ', 'gutenverse')}
                            {__('Please check this ', 'gutenverse')}<a href="https://gutenverse.com/docs/how-to-setup-smtp">{__('documentation', 'gutenverse')}</a>{__(' on how to use our form.', 'gutenverse')}
                        </p>
                    </div>
                    <div className="gutenverse-close" onClick={() => {
                        setHideFormNotice(true);
                        closeNotice('form_action_notice');
                    }}>
                        <IconCloseSVG size={14} />
                    </div>
                </>
            </AlertControl>
        </div>}
        <div className="form-notice-wrapper">
            <div className="form-pro-notice">
                <h3 className="title">{__('Upgrade to Gutenverse Pro', 'gutenverse-form')}</h3>
                <p className="description">{__('Explore the full potential of Gutenverse Form', 'gutenverse-form')}</p>
                <ButtonUpgradePro thin={true} smallText={true} />
                <div className="boxes">
                    <ImageFormNoticeSVG />
                </div>
            </div>
        </div>
        <div className="form-tab-header">
            {Object.keys(tabs).map(key => {
                const item = tabs[key];
                const classes = classnames('header-item', {
                    active: key === tab
                });
                return <div className={classes} key={key} onClick={() => changeActive(key)}>
                    {item}
                </div>;
            })}
        </div>
        {tab === 'general' && <TabGeneral {...props} />}
        {tab === 'confirmation' && ConfirmationTab}
        {tab === 'notification' && NotificationTab}
    </div>;
};

export default FormContent;