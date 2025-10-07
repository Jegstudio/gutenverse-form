import classnames from 'classnames';
import { AlertControl } from 'gutenverse-core/controls';
import { ControlText, ControlTextarea, ControlCheckbox } from 'gutenverse-core/backend';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { IconCloseSVG } from 'gutenverse-core/icons';
import apiFetch from '@wordpress/api-fetch';
import { isEmpty } from 'lodash';
import { CardBannerPro, PopupInsufficientTier, PopupPro } from 'gutenverse-core/components';


const TabGeneral = (props) => {
    const { values, updateValue } = props;
    const defaultSettings = [
        {
            Component: <ControlText
                id={'title'}
                title={__('Form Title', 'gutenverse-form')}
                description={__('This title will be searchable in Gutenverse Form Builder Block.', 'gutenverse-form')}
                value={values.title}
                {...props}
            />
        },
        {
            Component: <ControlCheckbox
                id={'require_login'}
                title={__('Require Login', 'gutenverse-form')}
                description={__('Hide form if the user is not logged in.', 'gutenverse-form')}
                value={values.require_login}
                updateValue={updateValue}
            />,
        },
        {
            Component: <ControlCheckbox
                id={'user_browser'}
                title={__('Capture User Browser Data', 'gutenverse-form')}
                description={__('Store user\'s browser data such as ip, browser name, etc. (If you served website for countries with GDPR law, please make sure you\'ve setup notice for your user regarding the datas you collect.)', 'gutenverse-form')}
                value={values.user_browser}
                updateValue={updateValue}
            />,
        },
        {
            Component: <ControlText
                id={'form_success_notice'}
                title={__('Success Notice on Submit', 'gutenverse-form')}
                description={__('This will be your success notice when form is successfully submitted. (If empty, notice will not be showed).', 'gutenverse-form')}
                value={values.form_success_notice}
                updateValue={updateValue}
            />,
        },
        {
            Component: <ControlText
                id={'form_error_notice'}
                title={__('Error Notice on Submit', 'gutenverse-form')}
                description={__('This will be your error notice when form is failed on submit. (If empty, notice will not be showed).', 'gutenverse-form')}
                value={values.form_error_notice}
                updateValue={updateValue}
            />,
        },
        {
            Component: <ControlCheckbox
                id={'use_captcha'}
                title={__('Use Captcha', 'gutenverse-form')}
                description={__('Check this if you want to use captcha.', 'gutenverse-form')}
                value={values.use_captcha}
                updateValue={updateValue}
            />
        }
    ];
    let formSettings = applyFilters('gutenverse-form.general-form-action-settings', defaultSettings);
    return <div className="form-tab-body">
        {formSettings.map((el, index) => (
            <div key={index}>{el.Component}</div>
        ))}
    </div>;
};

const TabConfirmation = (props) => {
    const { values, updateValue } = props;

    return <div className="form-tab-body">
        <ControlCheckbox
            id={'user_confirm'}
            title={__('Confirmation Mail to User', 'gutenverse-form')}
            description={__('Send confirmation email to user. (To be able to send email, please make sure you\'ve setup SMTP correctly).', 'gutenverse-form')}
            value={values.user_confirm}
            updateValue={updateValue}
        />
        {values.user_confirm && <>
            <ControlCheckbox
                id={'auto_select_email'}
                title={__('Auto Select Email', 'gutenverse-form')}
                description={__('This will automatically select emails inputted from email\'s fields. Please make sure the input field is "email" and not "text"', 'gutenverse-form')}
                value={values.auto_select_email}
                updateValue={updateValue}
            />
            {!values.auto_select_email && <ControlText
                id={'email_input_name'}
                title={__('Use Input\'s Name', 'gutenverse-form')}
                description={__('Only the selected input name will be sent email. (e.g : input-email).', 'gutenverse-form')}
                defaultValue={'input-email'}
                value={values.email_input_name}
                updateValue={updateValue}
            />}
            <ControlText
                id={'user_email_subject'}
                title={__('Email\'s Subject', 'gutenverse-form')}
                description={__('This will be your email\'s subject or title. (e.g : Thank you for your submission).', 'gutenverse-form')}
                value={values.user_email_subject}
                updateValue={updateValue}
            />
            <ControlText
                id={'user_email_form'}
                title={__('Email\'s Sender', 'gutenverse-form')}
                description={__('Enter the sender email by which you want to send email to user. (Please make sure you use the same email in your SMTP setup).', 'gutenverse-form')}
                value={values.user_email_form}
                updateValue={updateValue}
            />
            <ControlText
                id={'user_email_reply_to'}
                title={__('Email\'s Reply Target', 'gutenverse-form')}
                description={__('Enter email where user can reply/ you want to get reply. (e.g : supportreply@email.com).', 'gutenverse-form')}
                value={values.user_email_reply_to}
                updateValue={updateValue}
            />
            <ControlTextarea
                id={'user_email_body'}
                title={__('Messages to User', 'gutenverse-form')}
                description={__('Enter your messages to include it in email\'s body which will be send to user. (e.g : Thank you for your participation in the survey!).', 'gutenverse-form')}
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
            title={__('Notification Mail to Admin', 'gutenverse-form')}
            description={__('Send notification email to you or your admin. (To be able to send email, please make sure you\'ve setup SMTP correctly).', 'gutenverse-form')}
            value={values.admin_confirm}
            updateValue={updateValue}
        />
        {values.admin_confirm && <>
            <ControlText
                id={'admin_email_subject'}
                title={__('Email Subject', 'gutenverse-form')}
                description={__('This will be your email\'s subject or title. (e.g : User submission).', 'gutenverse-form')}
                value={values.admin_email_subject}
                updateValue={updateValue}
            />
            <ControlText
                id={'admin_email_to'}
                title={__('Email\'s Recipient', 'gutenverse-form')}
                description={__('Enter admin email where you want to send mail (For multiple email addresses please use "," as separator).', 'gutenverse-form')}
                value={values.admin_email_to}
                updateValue={updateValue}
            />
            <ControlText
                id={'admin_email_from'}
                title={__('Email\'s Sender', 'gutenverse-form')}
                description={__('Enter the sender email by which you want to send email to admin. (Please make sure you use the same email in your SMTP setup).', 'gutenverse-form')}
                value={values.admin_email_from}
                updateValue={updateValue}
            />
            <ControlText
                id={'admin_email_reply_to'}
                title={__('Email\'s Reply Target', 'gutenverse-form')}
                description={__('Enter email where admin can reply/ you want to get reply. (e.g : admnreply@email.com).', 'gutenverse-form')}
                value={values.admin_email_reply_to}
                updateValue={updateValue}
            />
            <ControlTextarea
                id={'admin_note'}
                title={__('Messages to Admin', 'gutenverse-form')}
                description={__('Enter your messages to include it in email\'s body which will be send to admin. (e.g : A submission from user with the following data.).', 'gutenverse-form')}
                value={values.admin_note}
                updateValue={updateValue}
            />
        </>}
    </div>;
};

export const FormContent = (props) => {
    const [tab, setActiveTab] = useState('general');
    const [hideFormNotice, setHideFormNotice] = !isEmpty(window['GutenverseConfig']) ? useState(window['GutenverseConfig']['hideFormNotice']) : useState(false);
    const [popupActive, setPopupActive] = useState(false);
    const [popupInsufficientTier, setPopupInsufficientTier] = useState(false);
    const [insufficientTierDesc, setInsufficientTierDesc] = useState('');

    const tabs = {
        general: {
            label: __('General', 'gutenverse-form'),
        },
        confirmation: {
            label: __('Confirmation', 'gutenverse-form'),
        },
        notification: {
            label: __('Notification', 'gutenverse-form'),
        },
        pro: {
            label: __('Pro', 'gutenverse-form'),
            pro: true
        },
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

    const proPopupProps = {
        setPopupInsufficientTier,
        setInsufficientTierDesc
    }
    return <div>
        {!hideFormNotice && <div className="form-notice-wrapper">
            <AlertControl>
                <>
                    <div>
                        <p>
                            {__('Please make sure you have setup SMTP first to be able to use this form full functionality, otherwise the form will not be able to send email. ', 'gutenverse-form')}
                            {__('Please check this ', 'gutenverse-form')}<a href="https://gutenverse.com/docs/how-to-setup-smtp">{__('documentation', 'gutenverse-form')}</a>{__(' on how to use our form.', 'gutenverse-form')}
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
        <PopupPro
            active={popupActive}
            setActive={setPopupActive}
            description={<>{__('Upgrade ', '--gctd--')}<span>{__(' Gutenverse PRO ', '--gctd--')}</span>{__(' version to ', '--gctd--')}<br />{__(' unlock these premium features', '--gctd--')}</>}
        />
        <PopupInsufficientTier
            active={popupInsufficientTier}
            setActive={setPopupInsufficientTier}
            description={insufficientTierDesc}
        />
        <div className="form-notice-wrapper">
            <CardBannerPro title={__('Upgrade to Gutenverse Pro', 'gutenverse-form')} description={__('Explore the full potential of Gutenverse Form', 'gutenverse-form')} backgroundImg="card-banner-bg-form.png" />
        </div>
        <div className="form-tab-header">
            {Object.keys(tabs).map(key => {
                const item = tabs[key];
                const classes = classnames('header-item', {
                    active: key === tab
                });

                return item.pro
                    ? applyFilters(
                        'gutenverse-form.tab-pro-button',
                        <div className={classes} key={key} onClick={() => setPopupActive(true)}>
                            {item.label}
                        </div>,
                        proPopupProps
                    )
                    : (
                        <div className={classes} key={key} onClick={() => changeActive(key)}>
                            {item.label}
                        </div>
                    );
            })}
        </div>
        {tab === 'general' && <TabGeneral {...props} />}
        {tab === 'confirmation' && ConfirmationTab}
        {tab === 'notification' && NotificationTab}
        {tab === 'pro' && applyFilters('gutenverse-form.pro-form-action-settings', '', props)}
    </div>;
};

export default FormContent;