import classnames from 'classnames';
import { AlertControl } from 'gutenverse-core/controls';
import { ControlText, ControlTextarea, ControlCheckbox, ControlSelect } from 'gutenverse-core/backend';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { IconCloseSVG } from 'gutenverse-core/icons';
import apiFetch from '@wordpress/api-fetch';
import { isEmpty } from 'gutenverse-core/helper';
import { CardPro } from 'gutenverse-core/components';
import { Modal, Button } from '@wordpress/components';

const FormGroup = ({ title, description, children, className = '' }) => {
    return (
        <div className={`gutenverse-form-group ${className}`}>
            {title && <h4 className="gutenverse-form-group-title">{title}</h4>}
            {description && <p className="gutenverse-form-group-description">{description}</p>}
            {children}
        </div>
    );
};

const InlineNotice = ({ type = 'info', children }) => {
    if (!children) {
        return null;
    }

    return <div className={`gutenverse-inline-notice ${type}`}>{children}</div>;
};

const TabGeneral = (props) => {
    const { values, updateValue } = props;
    const defaultSettings = [
        {
            Component: <ControlText
                id={'title'}
                title={__('Form Title', 'gutenverse-form')}
                description={__('The form title, used for identification in the editor.', 'gutenverse-form')}
                value={values.title}
                {...props}
            />
        },
        {
            Component: <ControlCheckbox
                id={'require_login'}
                title={__('Require Login', 'gutenverse-form')}
                description={__('Hide the form for non-logged-in users.', 'gutenverse-form')}
                value={values.require_login}
                updateValue={updateValue}
            />,
        },
        {
            Component: <ControlCheckbox
                id={'user_browser'}
                title={__('Capture User Data', 'gutenverse-form')}
                description={__('Collect user metadata including IP address and browser information. Ensure compliance with GDPR regulations.', 'gutenverse-form')}
                value={values.user_browser}
                updateValue={updateValue}
            />,
        },
        {
            Component: <ControlText
                id={'form_success_notice'}
                title={__('Success Message', 'gutenverse-form')}
                description={__('The message displayed after successful submission.', 'gutenverse-form')}
                value={values.form_success_notice}
                updateValue={updateValue}
            />,
        },
        {
            Component: <ControlText
                id={'form_error_notice'}
                title={__('Error Message', 'gutenverse-form')}
                description={__('The message displayed if submission fails.', 'gutenverse-form')}
                value={values.form_error_notice}
                updateValue={updateValue}
            />,
        },
        {
            Component: <ControlCheckbox
                id={'use_captcha'}
                title={__('Enable Captcha', 'gutenverse-form')}
                description={__('Protect your form from spam using captcha. Require you to enter captcha secret key in the form settings', 'gutenverse-form')}
                value={values.use_captcha}
                updateValue={updateValue}
            />
        }
    ];
    let formSettings = applyFilters('gutenverse-form.general-form-action-settings', defaultSettings);

    const getControl = (id) => {
        const setting = formSettings.find(el => el.Component.props.id === id);
        return setting ? setting.Component : null;
    };

    const placedIds = ['title', 'require_login', 'user_browser', 'use_captcha', 'form_success_notice', 'form_error_notice'];
    const extraSettings = formSettings.filter(el => !placedIds.includes(el.Component.props.id));

    return <div className="form-tab-body">
        <FormGroup
            title={__('Form Configuration', 'gutenverse-form')}
            description={__('Name this action and choose what happens before a visitor can submit.', 'gutenverse-form')}
        >
            {getControl('title')}
            {getControl('require_login')}
            {getControl('user_browser')}
            {getControl('use_captcha')}
        </FormGroup>

        <FormGroup
            title={__('Submission Notices', 'gutenverse-form')}
            description={__('These messages appear on the page after the form request finishes.', 'gutenverse-form')}
        >
            {getControl('form_success_notice')}
            {getControl('form_error_notice')}
        </FormGroup>

        {extraSettings.length > 0 && (
            <FormGroup title={__('Additional Settings', 'gutenverse-form')}>
                {extraSettings.map((el, index) => (
                    <div key={index}>{el.Component}</div>
                ))}
            </FormGroup>
        )}
    </div>;
};


const getAdminUrl = () => {
    if (window.ajaxurl) {
        return window.ajaxurl.replace('admin-ajax.php', '');
    }
    return '/wp-admin/';
};

const decodeEntities = (html) => {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
};

const normalizeTemplateTitle = (title) => {
    return decodeEntities(title)
        .replace(/&#8211;|&#8212;|[\u2013\u2014]/g, '-')
        .replace(/\s+-\s+/g, ' - ')
        .trim();
};

const EmailTemplateManager = ({ templateId, fieldName, updateValue, emailTemplates, onRefresh, formTitle }) => {
    const [saving, setSaving] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const adminUrl = getAdminUrl();
    const template = emailTemplates ? emailTemplates.find(t => t.value === templateId) : null;
    const templateTitle = template ? normalizeTemplateTitle(template.label) : __('(No Template Found)', 'gutenverse-form');
    const templateType = fieldName === 'user_email_template'
        ? __('confirmation', 'gutenverse-form')
        : __('notification', 'gutenverse-form');

    const handleCreate = () => {
        setSaving(true);
        setMessage('');
        setError('');
        const type = fieldName === 'user_email_template' ? __('Confirmation', 'gutenverse-form') : __('Notification', 'gutenverse-form');
        const cleanTitle = normalizeTemplateTitle(formTitle) || __('Untitled Form', 'gutenverse-form');
        const name = `${cleanTitle} - ${type}`;

        apiFetch({
            path: '/wp/v2/gutenverse-email-tpl',
            method: 'POST',
            data: {
                title: name,
                status: 'publish'
            }
        }).then(response => {
            if (response && response.id) {
                updateValue(fieldName, response.id);
                if (onRefresh) onRefresh();
                setMessage(__('Template created. Open it to design the email, then save this form action.', 'gutenverse-form'));
            }
            setSaving(false);
        }).catch(err => {
            console.error(err); // eslint-disable-line no-console
            setError(err?.message || __('Could not create the email template. Please try again.', 'gutenverse-form'));
            setSaving(false);
        });
    };

    const handleDelete = () => {
        setSaving(true);
        setMessage('');
        setError('');
        apiFetch({
            path: `/wp/v2/gutenverse-email-tpl/${templateId}?force=true`,
            method: 'DELETE',
        }).then(() => {
            updateValue(fieldName, '');
            if (onRefresh) onRefresh();
            setSaving(false);
            setIsDeleteModalOpen(false);
            setMessage(__('Template deleted.', 'gutenverse-form'));
        }).catch(err => {
            console.error(err); // eslint-disable-line no-console
            setError(err?.message || __('Could not delete the email template. Please try again.', 'gutenverse-form'));
            setSaving(false);
            setIsDeleteModalOpen(false);
        });
    };

    if (!templateId) {
        return (
            <div className="gutenverse-email-template-manager">
                <InlineNotice>
                    {__('Create a dedicated template for this email. Each confirmation and notification keeps its own template.', 'gutenverse-form')}
                </InlineNotice>
                <button
                    type="button"
                    className={`gutenverse-button create ${saving ? 'disabled' : ''}`}
                    onClick={!saving ? handleCreate : undefined}
                    disabled={saving}
                >
                    {saving ? __('Creating...', 'gutenverse-form') : __('Create Email Template', 'gutenverse-form')}
                </button>
                <InlineNotice type="success">{message}</InlineNotice>
                <InlineNotice type="error">{error}</InlineNotice>
            </div>
        );
    }

    const editUrl = `${adminUrl}post.php?post=${templateId}&action=edit`;

    return (
        <div className="gutenverse-email-template-manager has-template">
            <InlineNotice>
                {__('This form action will send this dedicated template only. Other form emails cannot be assigned here.', 'gutenverse-form')}
            </InlineNotice>
            <div className="template-card">
                <div>
                    <span className="template-label">{templateTitle}</span>
                    <span className="template-description">
                        {__('Used for this form', 'gutenverse-form')} {templateType} {__('email', 'gutenverse-form')}
                    </span>
                </div>
                <span className="template-id">ID: {templateId}</span>
            </div>
            <div className="template-actions">
                <a
                    href={editUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gutenverse-button"
                >
                    {__('Edit Template', 'gutenverse-form')}
                </a>
                <button
                    type="button"
                    className={`gutenverse-button cancel ${saving ? 'disabled' : ''}`}
                    onClick={!saving ? () => setIsDeleteModalOpen(true) : undefined}
                    disabled={saving}
                >
                    {saving ? __('Deleting...', 'gutenverse-form') : __('Delete', 'gutenverse-form')}
                </button>
                <button
                    type="button"
                    className="gutenverse-button"
                    onClick={onRefresh}
                >
                    {__('Refresh', 'gutenverse-form')}
                </button>
            </div>
            <InlineNotice type="success">{message}</InlineNotice>
            <InlineNotice type="error">{error}</InlineNotice>

            {isDeleteModalOpen && (
                <Modal
                    title={__('Delete Email Template', 'gutenverse-form')}
                    onRequestClose={() => setIsDeleteModalOpen(false)}
                    className="gutenverse-form-confirm-modal"
                >
                    <div className="gutenverse-form-confirm-content">
                        <p>
                            {__('Are you sure you want to permanently delete this email template? This action cannot be undone.', 'gutenverse-form')}
                        </p>
                        <div className="gutenverse-form-confirm-actions">
                            <Button isSecondary onClick={() => setIsDeleteModalOpen(false)}>
                                {__('Cancel', 'gutenverse-form')}
                            </Button>
                            <Button isPrimary isDestructive onClick={handleDelete} disabled={saving}>
                                {saving ? __('Deleting...', 'gutenverse-form') : __('Delete Permanently', 'gutenverse-form')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const TabConfirmation = (props) => {
    const {
        values, updateValue, placeholderDescription,
    } = props;

    return <div className="form-tab-body">
        <div style={{ marginBottom: '20px' }}>
            <ControlCheckbox
                id={'user_confirm'}
                title={__('Send Confirmation Email', 'gutenverse-form')}
                description={__('Send an automated confirmation email to the user upon submission.', 'gutenverse-form')}
                value={values.user_confirm}
                updateValue={updateValue}
            />
        </div>
        {values.user_confirm && <>
            <FormGroup
                title={__('Recipient Settings', 'gutenverse-form')}
                description={__('Choose which submitted email address receives the confirmation.', 'gutenverse-form')}
            >
                {!values.auto_select_email && (
                    <ControlText
                        id={'email_input_name'}
                        title={__('Recipient Field ID', 'gutenverse-form')}
                        description={__('The specific input ID (name) to use as the recipient email address.', 'gutenverse-form')}
                        defaultValue={'input-email'}
                        value={values.email_input_name}
                        updateValue={updateValue}
                    />
                )}
            </FormGroup>

            <FormGroup
                title={__('Email Details', 'gutenverse-form')}
                description={__('Set the subject, sender, and reply-to address for the confirmation email.', 'gutenverse-form')}
            >
                <ControlSelect
                    id={'user_email_subject_type'}
                    title={__('Subject Type', 'gutenverse-form')}
                    description={__('Choose between static text, post title, or meta action.', 'gutenverse-form')}
                    value={values.user_email_subject_type || 'static'}
                    options={[
                        { label: __('Static Text', 'gutenverse-form'), value: 'static' },
                        { label: __('Meta Action', 'gutenverse-form'), value: 'post_meta' },
                    ]}
                    updateValue={updateValue}
                />
                {values.user_email_subject_type === 'post_meta' && (
                    <ControlText
                        id={'user_email_subject_meta_key'}
                        title={__('Meta Key', 'gutenverse-form')}
                        description={__('The custom field name containing the subject.', 'gutenverse-form')}
                        value={values.user_email_subject_meta_key || ''}
                        updateValue={updateValue}
                    />
                )}
                {(!values.user_email_subject_type || values.user_email_subject_type === 'static') && (
                    <ControlText
                        id={'user_email_subject'}
                        title={__('Email Subject', 'gutenverse-form')}
                        description={placeholderDescription(__('The subject line for the confirmation email.', 'gutenverse-form'))}
                        value={values.user_email_subject}
                        updateValue={updateValue}
                    />
                )}
                <ControlText
                    id={'user_email_form'}
                    title={__('Sender Email', 'gutenverse-form')}
                    description={__('The email address the confirmation is sent from. Must match your SMTP settings.', 'gutenverse-form')}
                    value={values.user_email_form}
                    updateValue={updateValue}
                />
                <ControlSelect
                    id={'user_email_reply_to_type'}
                    title={__('Reply-To Type', 'gutenverse-form')}
                    description={__('Choose between a static email address or a dynamic recipient based on form data.', 'gutenverse-form')}
                    value={values.user_email_reply_to_type || 'static'}
                    options={[
                        { label: __('Static Email', 'gutenverse-form'), value: 'static' },
                        { label: __('Dynamic Recipient', 'gutenverse-form'), value: 'dynamic' },
                    ]}
                    updateValue={updateValue}
                />
                {values.user_email_reply_to_type === 'dynamic' ? (
                    <ControlText
                        id={'user_email_reply_to_dynamic'}
                        title={__('Reply-To Field ID', 'gutenverse-form')}
                        description={__('The specific input ID (name) to use as the reply-to email address.', 'gutenverse-form')}
                        value={values.user_email_reply_to_dynamic}
                        updateValue={updateValue}
                    />
                ) : (
                    <ControlText
                        id={'user_email_reply_to'}
                        title={__('Reply-To Address', 'gutenverse-form')}
                        description={__('The static email address where user replies will be sent.', 'gutenverse-form')}
                        value={values.user_email_reply_to}
                        updateValue={updateValue}
                    />
                )}
            </FormGroup>

            <FormGroup
                title={__('Message Content', 'gutenverse-form')}
                description={__('Use a quick text message or design a reusable email template.', 'gutenverse-form')}
            >
                <ControlSelect
                    id={'user_message_type'}
                    title={__('Message Content Type', 'gutenverse-form')}
                    description={__('Choose between a custom static message or an email template.', 'gutenverse-form')}
                    value={values.user_message_type || 'static'}
                    options={[
                        { label: __('Static Text', 'gutenverse-form'), value: 'static' },
                        { label: __('Email Template', 'gutenverse-form'), value: 'template' },
                    ]}
                    updateValue={updateValue}
                />
                {(!values.user_message_type || values.user_message_type === 'static') && (
                    <ControlTextarea
                        id={'user_email_body'}
                        title={__('Email Body', 'gutenverse-form')}
                        description={placeholderDescription(__('The content of the confirmation email.', 'gutenverse-form'))}
                        value={values.user_email_body}
                        updateValue={updateValue}
                    />
                )}
                {values.user_message_type === 'template' && (
                    <EmailTemplateManager
                        templateId={values.user_email_template}
                        fieldName={'user_email_template'}
                        updateValue={updateValue}
                        emailTemplates={props.emailTemplates}
                        onRefresh={props.refreshTemplates}
                        formTitle={values.title}
                    />
                )}
            </FormGroup>
        </>}
    </div>;
};

const TabNotification = (props) => {
    const { values, updateValue, placeholderDescription } = props;

    return <div className="form-tab-body">
        <div style={{ marginBottom: '20px' }}>
            <ControlCheckbox
                id={'admin_confirm'}
                title={__('Send Admin Notification', 'gutenverse-form')}
                description={__('Send an email notification to the site administrator upon submission.', 'gutenverse-form')}
                value={values.admin_confirm}
                updateValue={updateValue}
            />
        </div>
        {values.admin_confirm && <>
            <FormGroup
                title={__('Email Details', 'gutenverse-form')}
                description={__('Set the subject, sender, and reply-to address for the admin notification.', 'gutenverse-form')}
            >
                <ControlSelect
                    id={'admin_email_subject_type'}
                    title={__('Subject Type', 'gutenverse-form')}
                    description={__('Choose between static text, post title, or meta action.', 'gutenverse-form')}
                    value={values.admin_email_subject_type || 'static'}
                    options={[
                        { label: __('Static Text', 'gutenverse-form'), value: 'static' },
                        { label: __('Meta Action', 'gutenverse-form'), value: 'post_meta' },
                    ]}
                    updateValue={updateValue}
                />
                {values.admin_email_subject_type === 'post_meta' && (
                    <ControlText
                        id={'admin_email_subject_meta_key'}
                        title={__('Meta Key', 'gutenverse-form')}
                        description={__('The custom field name containing the subject.', 'gutenverse-form')}
                        value={values.admin_email_subject_meta_key || ''}
                        updateValue={updateValue}
                    />
                )}
                {(!values.admin_email_subject_type || values.admin_email_subject_type === 'static') && (
                    <ControlText
                        id={'admin_email_subject'}
                        title={__('Email Subject', 'gutenverse-form')}
                        description={placeholderDescription(__('The subject line for the notification email.', 'gutenverse-form'))}
                        value={values.admin_email_subject}
                        updateValue={updateValue}
                    />
                )}
                <ControlText
                    id={'admin_email_from'}
                    title={__('Sender Email', 'gutenverse-form')}
                    description={__('The email address the notification is sent from. Must match your SMTP settings.', 'gutenverse-form')}
                    value={values.admin_email_from}
                    updateValue={updateValue}
                />
                <ControlSelect
                    id={'admin_email_reply_to_type'}
                    title={__('Reply-To Type', 'gutenverse-form')}
                    description={__('Choose between a static email address or a dynamic recipient based on form data.', 'gutenverse-form')}
                    value={values.admin_email_reply_to_type || 'static'}
                    options={[
                        { label: __('Static Email', 'gutenverse-form'), value: 'static' },
                        { label: __('Dynamic Recipient', 'gutenverse-form'), value: 'dynamic' },
                    ]}
                    updateValue={updateValue}
                />
                {values.admin_email_reply_to_type === 'dynamic' ? (
                    <ControlText
                        id={'admin_email_reply_to_dynamic'}
                        title={__('Reply-To Field ID', 'gutenverse-form')}
                        description={__('The specific input ID (name) to use as the reply-to email address.', 'gutenverse-form')}
                        value={values.admin_email_reply_to_dynamic}
                        updateValue={updateValue}
                    />
                ) : (
                    <ControlText
                        id={'admin_email_reply_to'}
                        title={__('Reply-To Address', 'gutenverse-form')}
                        description={__('The static email address where admin replies will be sent.', 'gutenverse-form')}
                        value={values.admin_email_reply_to}
                        updateValue={updateValue}
                    />
                )}
            </FormGroup>

            <FormGroup
                title={__('Recipient Settings', 'gutenverse-form')}
                description={__('Choose who receives the notification when someone submits this form.', 'gutenverse-form')}
            >
                <ControlSelect
                    id={'admin_email_type'}
                    title={__('Recipient Type', 'gutenverse-form')}
                    description={__('Choose between a static email address or a dynamic recipient based on form data.', 'gutenverse-form')}
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
                            title={__('Recipient Source', 'gutenverse-form')}
                            description={__('Select the source to get the recipient email address.', 'gutenverse-form')}
                            value={values.admin_email_source || 'post_author'}
                            options={[
                                { label: __('Post Author', 'gutenverse-form'), value: 'post_author' },
                                { label: __('Meta Action', 'gutenverse-form'), value: 'post_meta' },
                            ]}
                            updateValue={updateValue}
                        />
                        {values.admin_email_source === 'post_meta' && (
                            <ControlText
                                id={'admin_email_meta_key'}
                                title={__('Meta Key', 'gutenverse-form')}
                                description={__('The custom field name containing the recipient\'s email address.', 'gutenverse-form')}
                                value={values.admin_email_meta_key || ''}
                                updateValue={updateValue}
                            />
                        )}
                    </>
                ) : (
                    <ControlText
                        id={'admin_email_to'}
                        title={__('Recipient Email', 'gutenverse-form')}
                        description={__('The email address(es) to receive notifications. Separate multiple emails with commas.', 'gutenverse-form')}
                        value={values.admin_email_to}
                        updateValue={updateValue}
                    />
                )}
            </FormGroup>

            <FormGroup
                title={__('Message Content', 'gutenverse-form')}
                description={__('Use a static note, a submitted field, or a designed email template.', 'gutenverse-form')}
            >
                <ControlSelect
                    id={'admin_message_type'}
                    title={__('Message Content Type', 'gutenverse-form')}
                    description={__('Choose between a custom static message, content from a form input, or an email template.', 'gutenverse-form')}
                    value={values.admin_message_type || 'static'}
                    options={[
                        { label: __('Static Text', 'gutenverse-form'), value: 'static' },
                        { label: __('Form Input (Dynamic)', 'gutenverse-form'), value: 'dynamic' },
                        { label: __('Email Template', 'gutenverse-form'), value: 'template' },
                    ]}
                    updateValue={updateValue}
                />
                {values.admin_message_type === 'dynamic' && (
                    <ControlText
                        id={'admin_message_input_name'}
                        title={__('Message Field ID', 'gutenverse-form')}
                        description={__('The form input ID that contains the message body.', 'gutenverse-form')}
                        value={values.admin_message_input_name}
                        updateValue={updateValue}
                    />
                )}
                {(!values.admin_message_type || values.admin_message_type === 'static') && (
                    <ControlTextarea
                        id="admin_note"
                        title={__('Email Body', 'gutenverse-form')}
                        description={placeholderDescription(__('The content of the notification email. You can use field tags to include form data.', 'gutenverse-form'))}
                        value={values.admin_note}
                        updateValue={updateValue}
                    />
                )}
                {values.admin_message_type === 'template' && (
                    <EmailTemplateManager
                        templateId={values.admin_email_template}
                        fieldName={'admin_email_template'}
                        updateValue={updateValue}
                        emailTemplates={props.emailTemplates}
                        onRefresh={props.refreshTemplates}
                        formTitle={values.title}
                    />
                )}
            </FormGroup>
        </>}
    </div>;
};



const autoGenerateTags = ({ clientId, values, updateValue }) => {
    if (!clientId || !window.wp || !window.wp.data) return;

    const blocks = window.wp.data.select('core/block-editor').getBlocks(clientId);
    const inputs = [];
    const traverseBlocks = (innerBlocks) => {
        innerBlocks.forEach(block => {
            if (block.name.startsWith('gutenverse/form-input') || block.name === 'gutenverse/form-textarea') {
                const name = block.attributes.inputName;
                if (name) {
                    inputs.push({ name, input: name });
                }
            }
            if (block.innerBlocks) {
                traverseBlocks(block.innerBlocks);
            }
        });
    };
    traverseBlocks(blocks);

    const existing = Array.isArray(values.variable_mapping) ? values.variable_mapping : [];
    const existingInputs = existing.map(m => (typeof m === 'string' ? '' : m.input));
    const newMapping = [...existing];

    inputs.forEach(input => {
        if (!existingInputs.includes(input.input)) {
            newMapping.push(input);
        }
    });

    if (newMapping.length !== existing.length) {
        updateValue('variable_mapping', newMapping);
    }
};

export const FormContent = (props) => {
    const [tab, setActiveTab] = useState('general');
    const [hideFormNotice, setHideFormNotice] = useState(!isEmpty(window['GutenverseConfig']) && window['GutenverseConfig']['hideFormNotice'] ? window['GutenverseConfig']['hideFormNotice'] : false);
    const values = props.values || {};

    const tabs = {
        general: {
            label: __('General', 'gutenverse-form'),
            status: values.title ? __('Ready', 'gutenverse-form') : '',
        },
        confirmation: {
            label: __('Confirmation', 'gutenverse-form'),
            status: values.user_confirm ? __('On', 'gutenverse-form') : __('Off', 'gutenverse-form'),
        },
        notification: {
            label: __('Notification', 'gutenverse-form'),
            status: values.admin_confirm ? __('On', 'gutenverse-form') : __('Off', 'gutenverse-form'),
        },
        pro: {
            label: __('Pro', 'gutenverse-form'),
            pro: true
        },
    };

    const [emailTemplates, setEmailTemplates] = useState([]);
    const [metaKeys, setMetaKeys] = useState([]);

    const fetchEmailTemplates = () => {
        apiFetch({ path: '/wp/v2/gutenverse-email-tpl?per_page=100' }).then(posts => {
            const options = posts.map(post => ({ label: normalizeTemplateTitle(post.title.rendered), value: post.id }));
            setEmailTemplates([{ label: __('Default', 'gutenverse-form'), value: '' }, ...options]);
        });
    };

    useEffect(() => {
        fetchEmailTemplates();

        apiFetch({ path: 'gutenverse-form-client/v1/form/meta-keys' }).then(keys => {
            setMetaKeys([{ label: __('Select Meta Key', 'gutenverse-form'), value: '' }, ...keys]);
        }).catch(() => {
            setMetaKeys([{ label: __('Failed to load meta keys', 'gutenverse-form'), value: '' }]);
        });

        if (props.isEditor && props.clientId) {
            autoGenerateTags(props);
        }
    }, []);

    const placeholderDescription = (original) => (
        <>
            {original}
            <br />
            <span className="gutenverse-placeholder-hint">
                {__('Use {{site_title}}, {{form_title}}, {{entry_id}}, or field names from your form inputs.', 'gutenverse-form')}
            </span>
        </>
    );

    const tabProps = {
        ...props, emailTemplates, metaKeys, placeholderDescription, refreshTemplates: fetchEmailTemplates,
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
                            <span>{item.label}</span>
                            {item.status && <small>{item.status}</small>}
                        </div>,
                        { ...proPopupProps, item, classes, key }
                    )
                    : (
                        <div className={classes} key={key} onClick={() => changeActive(key)}>
                            <span>{item.label}</span>
                            {item.status && <small>{item.status}</small>}
                        </div>
                    );
            })}
        </div>
        {tab === 'general' && <TabGeneral {...props} />}
        {tab === 'confirmation' && ConfirmationTab}
        {tab === 'notification' && NotificationTab}
        {tab === 'pro' && ProTab}
    </div>;
};

export default FormContent;
