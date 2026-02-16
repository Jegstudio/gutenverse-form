import classnames from 'classnames';
import { AlertControl } from 'gutenverse-core/controls';
import { ControlText, ControlTextarea, ControlCheckbox, ControlSelect } from 'gutenverse-core/backend';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { IconCloseSVG, IconTrashSVG } from 'gutenverse-core/icons';
import apiFetch from '@wordpress/api-fetch';
import { isEmpty } from 'gutenverse-core/helper';
import { CardPro } from 'gutenverse-core/components';

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

const TabFieldTags = (props) => {
    const { values, updateValue } = props;
    const mapping = Array.isArray(values.variable_mapping) ? values.variable_mapping : [];

    const addMapping = () => {
        updateValue('variable_mapping', [...mapping, '']);
    };

    const removeMapping = (index) => {
        const newMapping = [...mapping];
        newMapping.splice(index, 1);
        updateValue('variable_mapping', newMapping);
    };

    const updateItem = (index, value) => {
        const newMapping = [...mapping];
        newMapping[index] = value;
        updateValue('variable_mapping', newMapping);
    };

    return (
        <div className="form-tab-body">
            <div className="gutenverse-field-tags" style={{ paddingTop: '10px' }}>
                <h4 style={{ marginBottom: '10px' }}>{__('Field Tags', 'gutenverse-form')}</h4>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
                    {__('Please add variable tags from the form builder that will be forwarded and used in the email templates.', 'gutenverse-form')}
                </p>
                <div className="tags-list">
                    {mapping.map((tag, index) => (
                        <div key={index} style={{
                            display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '15px',
                        }}
                        >
                            <div style={{ flex: 1 }}>
                                <ControlText
                                    title={__('Field Name / Tag', 'gutenverse-form')}
                                    value={typeof tag === 'string' ? tag : (tag.name || '')}
                                    updateValue={(id, val) => updateItem(index, val)}
                                    description={__('Enter the field name exactly as defined in the builder.', 'gutenverse-form')}
                                />
                            </div>
                            <div
                                className="gutenverse-button cancel"
                                onClick={() => removeMapping(index)}
                                style={{
                                    marginTop: '28px', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}
                            >
                                <IconTrashSVG size={14} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="gutenverse-button create" onClick={addMapping} style={{ display: 'inline-block', marginTop: '10px' }}>
                    {__('Add New Tag', 'gutenverse-form')}
                </div>
            </div>
        </div>
    );
};

const TabConfirmation = (props) => {
    const {
        values, updateValue, placeholderDescription,
    } = props;

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
            {!values.auto_select_email && (
                <ControlText
                    id={'email_input_name'}
                    title={__('Use Input\'s Name', 'gutenverse-form')}
                    description={__('Only the selected input name will be sent email. (e.g : input-email).', 'gutenverse-form')}
                    defaultValue={'input-email'}
                    value={values.email_input_name}
                    updateValue={updateValue}
                />
            )}
            <ControlText
                id={'user_email_subject'}
                title={__('Email\'s Subject', 'gutenverse-form')}
                description={placeholderDescription(__('This will be your email\'s subject or title. (e.g : Thank you for your submission).', 'gutenverse-form'))}
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
                description={placeholderDescription(__('Enter your messages to include it in email\'s body which will be send to user. (e.g : Thank you for your participation in the survey!).', 'gutenverse-form'))}
                value={values.user_email_body}
                updateValue={updateValue}
            />
            <ControlSelect
                id={'user_email_template'}
                title={__('Email Template', 'gutenverse-form')}
                description={__('Select an email template to use. This will override the message body.', 'gutenverse-form')}
                value={values.user_email_template}
                options={props.emailTemplates || []}
                updateValue={updateValue}
            />
        </>}
    </div>;
};

const TabNotification = (props) => {
    const { values, updateValue, placeholderDescription } = props;

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
                description={placeholderDescription(__('This will be your email\'s subject or title. (e.g : User submission).', 'gutenverse-form'))}
                value={values.admin_email_subject}
                updateValue={updateValue}
            />
            <ControlSelect
                id={'admin_email_type'}
                title={__('Recipient Type', 'gutenverse-form')}
                description={__('Choose whether to send to a static email or dynamic recipient.', 'gutenverse-form')}
                value={values.admin_email_type || 'static'}
                options={[
                    { label: __('Static Email', 'gutenverse-form'), value: 'static' },
                    { label: __('Dynamic Recipient', 'gutenverse-form'), value: 'dynamic' },
                ]}
                updateValue={updateValue}
            />
            {values.admin_email_type === 'dynamic' ? (
                <>
                    <ControlSelect
                        id={'admin_email_source'}
                        title={__('Dynamic Source', 'gutenverse-form')}
                        description={__('Select the source to get the recipient email address.', 'gutenverse-form')}
                        value={values.admin_email_source || 'post_author'}
                        options={[
                            { label: __('Post Author', 'gutenverse-form'), value: 'post_author' },
                            { label: __('Post Metadata (Custom Field)', 'gutenverse-form'), value: 'post_meta' },
                            { label: __('Custom (Developer Hook)', 'gutenverse-form'), value: 'custom' },
                        ]}
                        updateValue={updateValue}
                    />
                    {values.admin_email_source === 'post_meta' && (
                        <ControlText
                            id={'admin_email_meta_key'}
                            title={__('Meta Key', 'gutenverse-form')}
                            description={__('Enter the meta key (custom field name) that holds the email address.', 'gutenverse-form')}
                            value={values.admin_email_meta_key}
                            updateValue={updateValue}
                        />
                    )}
                </>
            ) : (
                <ControlText
                    id={'admin_email_to'}
                    title={__('Email\'s Recipient', 'gutenverse-form')}
                    description={__('Enter admin email where you want to send mail (For multiple email addresses please use "," as separator).', 'gutenverse-form')}
                    value={values.admin_email_to}
                    updateValue={updateValue}
                />
            )}
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
            <ControlSelect
                id={'admin_message_type'}
                title={__('Message Type', 'gutenverse-form')}
                description={__('Choose whether to use a static message or a value from a form input.', 'gutenverse-form')}
                value={values.admin_message_type || 'static'}
                options={[
                    { label: __('Static Text', 'gutenverse-form'), value: 'static' },
                    { label: __('Form Input (Dynamic)', 'gutenverse-form'), value: 'dynamic' },
                ]}
                updateValue={updateValue}
            />
            {values.admin_message_type === 'dynamic' ? (
                <ControlText
                    id={'admin_message_input_name'}
                    title={__('Message Input ID', 'gutenverse-form')}
                    description={__('Enter the ID of the form input field that contains the message body.', 'gutenverse-form')}
                    value={values.admin_message_input_name}
                    updateValue={updateValue}
                />
            ) : (
                <ControlTextarea
                    id="admin_note"
                    title={__('Messages to Admin', 'gutenverse-form')}
                    description={placeholderDescription(__('Enter your messages to include it in email\'s body which will be send to admin. You can use field tags to include user submitted data.', 'gutenverse-form'))}
                    value={values.admin_note}
                    updateValue={updateValue}
                />
            )}
            <ControlSelect
                id={'admin_email_template'}
                title={__('Email Template', 'gutenverse-form')}
                description={__('Select an email template to use. This will override the message body.', 'gutenverse-form')}
                value={values.admin_email_template}
                options={props.emailTemplates || []}
                updateValue={updateValue}
            />
        </>}
    </div>;
};



export const FormContent = (props) => {
    const [tab, setActiveTab] = useState('general');
    const [hideFormNotice, setHideFormNotice] = useState(!isEmpty(window['GutenverseConfig']) && window['GutenverseConfig']['hideFormNotice'] ? window['GutenverseConfig']['hideFormNotice'] : false);

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

        tags: {
            label: __('Field Tags', 'gutenverse-form'),
        },
        pro: {
            label: __('Pro', 'gutenverse-form'),
            pro: true
        },
    };

    const [emailTemplates, setEmailTemplates] = useState([]);

    useEffect(() => {
        apiFetch({ path: '/wp/v2/gutenverse-email-tpl?per_page=100' }).then(posts => {
            const options = posts.map(post => ({ label: post.title.rendered, value: post.id }));
            setEmailTemplates([{ label: __('Default', 'gutenverse-form'), value: '' }, ...options]);
        });
    }, []);

    const placeholderDescription = (original) => (
        <>
            {original}
            <br />
            <span style={{
                color: '#007cba', display: 'block', marginTop: '5px', fontSize: '11px',
            }}
            >
                {__('Use {{site_title}}, {{form_title}}, {{entry_id}}, or the field tags you\'ve added in the Field Tags tab.', 'gutenverse-form')}
            </span>
        </>
    );

    const tabProps = {
        ...props, emailTemplates, placeholderDescription,
    };

    const changeActive = key => {
        setActiveTab(key);
    };

    const ConfirmationTab = applyFilters(
        'gutenverse.form.tab.confirmation',
        <TabConfirmation {...tabProps} />,
        tabProps
    );
    const NotificationTab = applyFilters(
        'gutenverse.form.tab.notification',
        <TabNotification {...tabProps} />,
        tabProps
    );

    const ProTab = applyFilters(
        'gutenverse-form.pro-form-action-settings',
        <div className="form-tab-body">
            <CardPro />
        </div>,
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
        changeActive,
    };
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
        <div className="form-tab-header">
            {Object.keys(tabs).map(key => {
                const item = tabs[key];
                const classes = classnames('header-item', {
                    active: key === tab
                });

                return item.pro
                    ? applyFilters(
                        'gutenverse-form.tab-pro-button',
                        <div className={classes} key={key} onClick={() => {
                            changeActive(key);
                        }}>
                            {item.label}
                        </div>,
                        { ...proPopupProps, item, classes, key }
                    )
                    : (
                        <div className={classes} key={key} onClick={() => changeActive(key)}>
                            {item.label}
                        </div>
                    );
            })}
        </div>
        {tab === 'general' && <TabGeneral {...props} />}
        {tab === 'tags' && <TabFieldTags {...tabProps} />}
        {tab === 'confirmation' && ConfirmationTab}
        {tab === 'notification' && NotificationTab}
        {tab === 'pro' && ProTab}
    </div>;
};

export default FormContent;