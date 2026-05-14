import classnames from 'classnames';
import { AlertControl } from 'gutenverse-core/controls';
import { ControlText, ControlTextarea, ControlCheckbox, ControlSelect } from 'gutenverse-core/backend';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, createInterpolateElement } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { IconCloseSVG } from 'gutenverse-core/icons';
import apiFetch from '@wordpress/api-fetch';
import { CardPro } from 'gutenverse-core/components';
import { Modal } from '@wordpress/components';
import { isEmpty, openFreemiusPopup, prefetchPricingPlanData } from 'gutenverse-core/helper';
import { activeTheme, clientUrl, upgradeProUrl } from 'gutenverse-core/config';
import { CardBannerPro, PopupInsufficientTier } from 'gutenverse-core/components';

const FormGroup = ({ title, description, children, className = '' }) => {
    return (
        <div className={`gutenverse-form-group ${className}`}>
            {title && <h4 className="gutenverse-form-group-title">{title}</h4>}
            {description && <p className="gutenverse-form-group-description">{description}</p>}
            {children}
        </div>
    );
};

const InlineNotice = ({ type = 'info', children, onClose }) => {
    if (!children) {
        return null;
    }

    const noticeTypes = type.split(' ');
    const hasWarningIcon = noticeTypes.includes('warning');
    const hasSuccessIcon = noticeTypes.includes('success');
    const hasIcon = hasWarningIcon || hasSuccessIcon;

    return (
        <div className={`gutenverse-inline-notice ${type}`}>
            {hasIcon && (
                <span className="gutenverse-inline-notice-icon" aria-hidden="true">
                    <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 3C3.13428 3 0 6.13541 0 10C0 13.8668 3.13428 17 7 17C10.8657 17 14 13.8668 14 10C14 6.13541 10.8657 3 7 3ZM7 6.10484C7.65473 6.10484 8.18548 6.6356 8.18548 7.29032C8.18548 7.94505 7.65473 8.47581 7 8.47581C6.34527 8.47581 5.81452 7.94505 5.81452 7.29032C5.81452 6.6356 6.34527 6.10484 7 6.10484ZM8.58064 13.2742C8.58064 13.4612 8.42899 13.6129 8.24193 13.6129H5.75806C5.57101 13.6129 5.41935 13.4612 5.41935 13.2742V12.5968C5.41935 12.4097 5.57101 12.2581 5.75806 12.2581H6.09677V10.4516H5.75806C5.57101 10.4516 5.41935 10.3 5.41935 10.1129V9.43548C5.41935 9.24843 5.57101 9.09677 5.75806 9.09677H7.56452C7.75157 9.09677 7.90323 9.24843 7.90323 9.43548V12.2581H8.24193C8.42899 12.2581 8.58064 12.4097 8.58064 12.5968V13.2742Z" fill={hasSuccessIcon ? '#12B33F' : '#FFC908'} />
                    </svg>
                </span>
            )}
            <span className="gutenverse-inline-notice-content">{children}</span>
            {onClose && (
                <button
                    type="button"
                    className="gutenverse-inline-notice-close"
                    aria-label={__('Dismiss notice', 'gutenverse-form')}
                    onClick={onClose}
                >
                    <IconCloseSVG size={14} />
                </button>
            )}
        </div>
    );
};

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

const findPreferredInputId = (inputFields = [], keywords = [], fallback = '') => {
    const searchTerms = keywords.map(keyword => keyword.toLowerCase());
    const match = inputFields.find(field => {
        const haystack = `${field.name || ''} ${field.label || ''}`.toLowerCase();
        return searchTerms.some(keyword => haystack.includes(keyword));
    });

    return match?.name || inputFields[0]?.name || fallback;
};

const FieldIdControl = ({
    id,
    title,
    description,
    value,
    defaultValue,
    updateValue,
    inputFields = [],
}) => {
    const inputValue = value === undefined ? defaultValue : value;
    const listId = `${id}-available-inputs`;
    const inputId = `${id}-field-id`;
    const inputChange = (event) => {
        updateValue(id, event.target.value);
    };

    return (
        <div className="control-wrapper control-text gutenverse-field-id-control">
            <label className="control-title" htmlFor={inputId}>{title}</label>
            <input
                id={inputId}
                type="text"
                list={inputFields.length > 0 ? listId : undefined}
                value={inputValue || ''}
                onChange={inputChange}
            />
            {inputFields.length > 0 && (
                <datalist id={listId}>
                    {inputFields.map(field => (
                        <option
                            key={field.name}
                            value={field.name}
                            label={field.label && field.label !== field.name ? field.label : undefined}
                        />
                    ))}
                </datalist>
            )}
            {description !== '' && (
                <span className="control-description">
                    {inputFields.length > 0
                        ? (
                            <>
                                {description}
                                <br />
                                {__('Type a custom input ID, or choose one from this form builder while typing.', 'gutenverse-form')}
                            </>
                        )
                        : description}
                </span>
            )}
        </div>
    );
};

const TabGeneral = (props) => {
    const { values, updateValue, availableInputFields = [], placeholderDescription } = props;
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
            title={__('Entry Title', 'gutenverse-form')}
            description={__('Choose how each submitted entry is named in the admin entry list and email references.', 'gutenverse-form')}
        >
            <ControlSelect
                id={'entry_title_type'}
                title={__('Entry Title Format', 'gutenverse-form')}
                description={__('Choose the title format for new submitted entries.', 'gutenverse-form')}
                value={values.entry_title_type || 'form'}
                options={[
                    { label: __('Form Name + Entry ID', 'gutenverse-form'), value: 'form' },
                    { label: __('Static Text + Entry ID', 'gutenverse-form'), value: 'static' },
                    { label: __('Submitted Field + Entry ID', 'gutenverse-form'), value: 'input' },
                    { label: __('Custom Format', 'gutenverse-form'), value: 'custom' },
                ]}
                updateValue={updateValue}
            />
            {values.entry_title_type === 'static' && (
                <ControlText
                    id={'entry_title_static_text'}
                    title={__('Static Title Text', 'gutenverse-form')}
                    description={__('This text will be followed by the entry ID, for example: Support Request #123.', 'gutenverse-form')}
                    value={values.entry_title_static_text}
                    updateValue={updateValue}
                />
            )}
            {values.entry_title_type === 'input' && (
                <FieldIdControl
                    id={'entry_title_input_name'}
                    title={__('Title Field ID', 'gutenverse-form')}
                    description={__('Use the submitted value from this input as the entry title, followed by the entry ID.', 'gutenverse-form')}
                    value={values.entry_title_input_name}
                    updateValue={updateValue}
                    inputFields={availableInputFields}
                />
            )}
            {values.entry_title_type === 'custom' && (
                <ControlText
                    id={'entry_title_custom_format'}
                    title={__('Custom Title Format', 'gutenverse-form')}
                    description={placeholderDescription(__('Use a custom format for entry titles, for example: {{form_title}} - {{input-subject}} #{{entry_id}}.', 'gutenverse-form'))}
                    value={values.entry_title_custom_format}
                    updateValue={updateValue}
                />
            )}
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

const escapeHtml = (value) => {
    const div = document.createElement('div');
    div.textContent = value || '';
    return div.innerHTML;
};

const formatInputLabel = (name) => {
    return (name || '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, letter => letter.toUpperCase());
};

const normalizeFormInputField = ({ name, label }) => {
    if (!name) return null;

    return {
        name,
        label: label || formatInputLabel(name) || name,
    };
};

const formatTemplateInputLabel = (label, isConfirmation) => {
    if (isConfirmation) {
        return label;
    }

    const neutralLabel = (label || '').replace(/^your\s+/i, '').trim();

    return neutralLabel || label;
};

const mergeFormInputs = (...fieldGroups) => {
    const fields = [];

    fieldGroups.flat().forEach(field => {
        const normalized = normalizeFormInputField(field || {});
        if (!normalized || fields.some(item => item.name === normalized.name)) {
            return;
        }

        fields.push(normalized);
    });

    return fields;
};

const collectFormInputsFromValues = (values = {}) => {
    const mappings = Array.isArray(values.variable_mapping) ? values.variable_mapping : [];
    const mappedFields = mappings.map(mapping => {
        if (typeof mapping === 'string') {
            return { name: mapping };
        }

        return {
            name: mapping?.input || mapping?.name,
            label: mapping?.label || mapping?.name || mapping?.input,
        };
    });
    const availableFields = Array.isArray(values.available_inputs)
        ? values.available_inputs.map(name => ({ name }))
        : [];

    return mergeFormInputs(mappedFields, availableFields);
};

const collectFormInputs = (clientId) => {
    if (!clientId || !window.wp || !window.wp.data) return [];

    const blockEditor = window.wp.data.select('core/block-editor');
    if (!blockEditor?.getBlocks) return [];

    const blocks = blockEditor.getBlocks(clientId);
    const inputs = [];

    const traverseBlocks = (innerBlocks) => {
        innerBlocks.forEach(block => {
            if (
                block.name &&
                block.name.startsWith('gutenverse/form-input') &&
                block.name !== 'gutenverse/form-input-submit' &&
                block.name !== 'gutenverse/form-input-recaptcha'
            ) {
                const name = block.attributes?.inputName;
                const label = block.attributes?.inputLabel;
                if (name && !inputs.some(input => input.name === name)) {
                    inputs.push(normalizeFormInputField({ name, label }));
                }
            }
            if (block.innerBlocks) {
                traverseBlocks(block.innerBlocks);
            }
        });
    };

    traverseBlocks(blocks);

    return inputs;
};

const collectFormInputNames = (clientId) => collectFormInputs(clientId).map(input => input.name);

const buildEmailTemplateStarter = (starter, fieldName, inputFields = []) => {
    if (starter === 'blank') {
        return {};
    }

    const isConfirmation = fieldName === 'user_email_template';
    const fields = inputFields.length > 0
        ? inputFields
        : [{ name: 'your_field_tag', label: __('Field Tag', 'gutenverse-form') }];
    const fieldRows = fields.map(input => ({
        label: formatTemplateInputLabel(input.label, isConfirmation),
        value: `{{${input.name}}}`,
    }));
    const summaryRows = [
        { label: __('Form', 'gutenverse-form'), value: '{{form_title}}' },
        { label: __('Reference', 'gutenverse-form'), value: '{{entry_title}}' },
        { label: __('Site', 'gutenverse-form'), value: '{{site_title}}' },
        ...fieldRows,
    ];

    const buildTableRows = (rows, { labelWidth = '32%', valueWidth = '68%', compact = false } = {}) => {
        const labelStyle = [
            `width:${labelWidth}`,
            compact ? 'padding:8px 14px 8px 0' : 'padding:11px 18px 11px 0',
            'border-bottom:1px solid #e2e8f0',
            'color:#475569',
            compact ? 'font-size:12px' : 'font-size:13px',
            'font-weight:600',
            'line-height:1.45',
            'vertical-align:top',
            'word-break:break-word',
            'overflow-wrap:anywhere',
        ].join(';');
        const valueStyle = [
            `width:${valueWidth}`,
            compact ? 'padding:8px 0' : 'padding:11px 0',
            'border-bottom:1px solid #e2e8f0',
            'color:#0f172a',
            compact ? 'font-size:13px' : 'font-size:14px',
            'font-weight:400',
            compact ? 'line-height:1.55' : 'line-height:1.6',
            'vertical-align:top',
            'word-break:break-word',
            'overflow-wrap:anywhere',
        ].join(';');
        const valueTextStyle = [
            'display:block',
            'max-width:100%',
            'white-space:normal',
            'word-break:break-word',
            'overflow-wrap:anywhere',
        ].join(';');

        return rows.map(row => (
            `<tr><td width="${labelWidth}" style="${labelStyle}">${escapeHtml(row.label)}</td><td width="${valueWidth}" style="${valueStyle}"><span style="${valueTextStyle}">${escapeHtml(row.value)}</span></td></tr>`
        )).join('');
    };

    const buildMjmlDocument = (content, { padding = '30px 32px' } = {}) => `
        <mjml>
            <mj-body background-color="#eef2f7" width="620px">
                <mj-section background-color="#ffffff" padding="${padding}">
                    <mj-column>
                        ${content}
                    </mj-column>
                </mj-section>
            </mj-body>
        </mjml>
    `.trim();

    const buildHtmlDocument = (content, { padding = '30px 32px' } = {}) => `
        <html>
            <body style="margin:0;background:#eef2f7;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;color:#334155;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;">
                    <tr>
                        <td style="padding:${padding};">
                            ${content}
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    `.trim();

    if (starter === 'thank-you') {
        const title = isConfirmation
            ? __('Thank you for your submission', 'gutenverse-form')
            : __('A new form submission is here', 'gutenverse-form');
        const copy = isConfirmation
            ? __('We received your response for {{form_title}} and will get back to you soon.', 'gutenverse-form')
            : __('This email was triggered by {{form_title}} on {{site_title}}.', 'gutenverse-form');
        const reference = __('Reference: {{entry_title}}', 'gutenverse-form');

        return {
            mjml: buildMjmlDocument(`
                <mj-text align="center" padding="0 0 12px" font-size="22px" font-weight="700" line-height="1.3" color="#0f172a">${escapeHtml(title)}</mj-text>
                <mj-text align="center" padding="0 0 12px" font-size="14px" line-height="1.6" color="#334155">${escapeHtml(copy)}</mj-text>
                <mj-text align="center" padding="0" font-size="12px" line-height="1.5" color="#64748b">${escapeHtml(reference)}</mj-text>
            `),
            html: buildHtmlDocument(`
                <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;line-height:1.3;color:#0f172a;text-align:center;">${escapeHtml(title)}</h1>
                <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#334155;text-align:center;">${escapeHtml(copy)}</p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;text-align:center;">${escapeHtml(reference)}</p>
            `),
        };
    }

    if (starter === 'compact') {
        const compactRows = buildTableRows(fieldRows, { labelWidth: '34%', valueWidth: '66%', compact: true });
        const title = __('New submission', 'gutenverse-form');
        const copy = __('A visitor submitted {{form_title}}. The main details are listed below.', 'gutenverse-form');
        const meta = __('Reference: {{entry_title}} | Site: {{site_title}}', 'gutenverse-form');

        return {
            mjml: buildMjmlDocument(`
                <mj-text padding="0 0 10px" font-size="20px" font-weight="700" line-height="1.3" color="#0f172a">${escapeHtml(title)}</mj-text>
                <mj-text padding="0 0 10px" font-size="14px" line-height="1.6" color="#334155">${escapeHtml(copy)}</mj-text>
                <mj-text padding="0 0 14px" font-size="12px" line-height="1.5" color="#64748b">${escapeHtml(meta)}</mj-text>
                <mj-text padding="0">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;table-layout:fixed;">
                        ${compactRows}
                    </table>
                </mj-text>
            `, { padding: '24px 28px' }),
            html: buildHtmlDocument(`
                <h1 style="margin:0 0 10px;font-size:20px;font-weight:700;line-height:1.3;color:#0f172a;">${escapeHtml(title)}</h1>
                <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#334155;">${escapeHtml(copy)}</p>
                <p style="margin:0 0 14px;font-size:12px;line-height:1.5;color:#64748b;">${escapeHtml(meta)}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;table-layout:fixed;">
                    ${compactRows}
                </table>
            `, { padding: '24px 28px' }),
        };
    }

    const dataRows = buildTableRows(summaryRows);
    const title = isConfirmation
        ? __('Submission summary', 'gutenverse-form')
        : __('New submission summary', 'gutenverse-form');
    const copy = isConfirmation
        ? __('Thank you for your submission to {{form_title}}. A copy of your details is included below.', 'gutenverse-form')
        : __('A new submission for {{form_title}} has been received. Review the details below.', 'gutenverse-form');
    const showFallbackTip = inputFields.length === 0;
    const fallbackTip = __('Tip: replace {{your_field_tag}} with one of your form field tags from the builder.', 'gutenverse-form');

    return {
        mjml: buildMjmlDocument(`
            <mj-text padding="0 0 10px" font-size="22px" font-weight="700" line-height="1.3" color="#0f172a">${escapeHtml(title)}</mj-text>
            <mj-text padding="0 0 18px" font-size="14px" line-height="1.6" color="#334155">${escapeHtml(copy)}</mj-text>
            <mj-text padding="0">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;table-layout:fixed;">
                    ${dataRows}
                </table>
            </mj-text>
            ${showFallbackTip ? `<mj-text padding="16px 0 0" font-size="12px" line-height="1.6" color="#64748b">${escapeHtml(fallbackTip)}</mj-text>` : ''}
        `, { padding: '26px 30px 28px' }),
        html: buildHtmlDocument(`
            <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;line-height:1.3;color:#0f172a;">${escapeHtml(title)}</h1>
            <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#334155;">${escapeHtml(copy)}</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;table-layout:fixed;">
                ${dataRows}
            </table>
            ${showFallbackTip ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#64748b;">${escapeHtml(fallbackTip)}</p>` : ''}
        `, { padding: '26px 30px 28px' }),
    };
};

const createEmailTemplate = ({ fieldName, formTitle, starter = 'blank', inputFields = [], formActionId = '' }) => {
    const type = fieldName === 'user_email_template'
        ? __('Confirmation', 'gutenverse-form')
        : __('Notification', 'gutenverse-form');
    const cleanTitle = normalizeTemplateTitle(formTitle) || __('Untitled Form', 'gutenverse-form');
    const name = `${cleanTitle} - ${type}`;
    const templateInputFields = mergeFormInputs(inputFields);
    const starterContent = buildEmailTemplateStarter(starter, fieldName, templateInputFields);
    const templateInputNames = templateInputFields.map(input => input.name);

    return apiFetch({
        path: '/wp/v2/gutenverse-email-tpl',
        method: 'POST',
        data: {
            title: name,
            status: 'publish',
            meta: {
                gutenverse_email_design: starterContent.design ? JSON.stringify(starterContent.design) : '',
                gutenverse_email_html: starterContent.html || '',
                gutenverse_email_mjml: starterContent.mjml || '',
                gutenverse_email_input_names: JSON.stringify(templateInputNames),
                gutenverse_email_form_action: formActionId ? String(formActionId) : '',
            }
        }
    });
};

const EmailTemplateManager = ({ templateId, fieldName, updateValue, emailTemplates, onRefresh, formTitle, clientId, formActionId, formValues }) => {
    const [saving, setSaving] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const adminUrl = getAdminUrl();
    const template = emailTemplates ? emailTemplates.find(t => String(t.value) === String(templateId)) : null;
    const templateTitle = template ? normalizeTemplateTitle(template.label) : __('(No Template Found)', 'gutenverse-form');
    const templateHtml = template?.html || '';
    const templateType = fieldName === 'user_email_template'
        ? __('confirmation', 'gutenverse-form')
        : __('notification', 'gutenverse-form');
    const isConfirmationTemplate = fieldName === 'user_email_template';
    const templateStarters = [
        {
            id: 'blank',
            title: __('Start Blank', 'gutenverse-form'),
            description: __('Open an empty template and design it from scratch', 'gutenverse-form'),
            note: __('*Best for full customization.', 'gutenverse-form'),
        },
        ...(isConfirmationTemplate ? [
            {
                id: 'thank-you',
                title: __('Thank You Email', 'gutenverse-form'),
                description: __('A polished thank-you confirmation email with a professional tone.', 'gutenverse-form'),
                note: __('*Best for simple confirmations.', 'gutenverse-form'),
                recommended: true,
            },
            {
                id: 'data',
                title: __('Submission Summary', 'gutenverse-form'),
                description: __('A receipt-style email with the submitted form details.', 'gutenverse-form'),
                note: __('*Best for detailed responses.', 'gutenverse-form'),
            },
        ] : [
            {
                id: 'data',
                title: __('Submission Summary', 'gutenverse-form'),
                description: __('A detailed email with all submitted form data.', 'gutenverse-form'),
                note: __('*Best for reviewing full submissions.', 'gutenverse-form'),
                recommended: true,
            },
            {
                id: 'compact',
                title: __('Compact Notification', 'gutenverse-form'),
                description: __('A concise email with key submission details.', 'gutenverse-form'),
                note: __('*Best for quick admin alerts.', 'gutenverse-form'),
            },
        ]),
    ];

    const handleCreate = (starter = 'blank') => {
        setSaving(true);
        setMessage('');
        setError('');
        createEmailTemplate({
            fieldName,
            formTitle,
            starter,
            inputFields: mergeFormInputs(collectFormInputs(clientId), collectFormInputsFromValues(formValues)),
            formActionId,
        }).then(response => {
            if (response && response.id) {
                updateValue(fieldName, response.id);
                if (onRefresh) onRefresh();
                setMessage(createInterpolateElement(
                    __('Template created. Click the <strong>Edit Template</strong> button to design the email, then save this form action.', 'gutenverse-form'),
                    { strong: <strong /> }
                ));
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
                <InlineNotice type="warning email-template-notice">
                    {__('Choose how to start this email template. You can begin with a blank canvas or a starter layout and customize it afterward.', 'gutenverse-form')}
                </InlineNotice>
                <div className="email-template-starters">
                    {templateStarters.map(starter => (
                        <button
                            key={starter.id}
                            type="button"
                            className={`gutenverse-button email-template-starter ${starter.recommended ? 'is-recommended' : ''} ${saving ? 'disabled' : ''}`}
                            onClick={!saving ? () => handleCreate(starter.id) : undefined}
                            disabled={saving}
                        >
                            {starter.recommended && <span className="starter-badge" aria-hidden="true" />}
                            <span className="starter-title">{starter.title}</span>
                            <span className="starter-description">{starter.description}</span>
                            <em>{starter.note}</em>
                        </button>
                    ))}
                </div>
                <InlineNotice type="success" onClose={() => setMessage('')}>{message}</InlineNotice>
                <InlineNotice type="error">{error}</InlineNotice>
            </div>
        );
    }

    const editUrl = `${adminUrl}post.php?post=${templateId}&action=edit`;
    const templateActions = (
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
                aria-label={saving ? __('Deleting email template', 'gutenverse-form') : __('Delete email template', 'gutenverse-form')}
                aria-busy={saving}
                title={__('Delete email template', 'gutenverse-form')}
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                    <path d="M12.7008 3.10083L12.945 4.79167H16.25C16.4158 4.79167 16.5747 4.85751 16.6919 4.97472C16.8092 5.09193 16.875 5.25091 16.875 5.41667C16.875 5.58243 16.8092 5.7414 16.6919 5.85861C16.5747 5.97582 16.4158 6.04167 16.25 6.04167H15.6092L14.8817 14.5292C14.8375 15.0458 14.8017 15.4708 14.7442 15.8142C14.6858 16.1717 14.5967 16.4917 14.4225 16.7883C14.149 17.2543 13.7424 17.6278 13.255 17.8608C12.945 18.0083 12.6183 18.0692 12.2567 18.0975C11.9092 18.125 11.4833 18.125 10.965 18.125H9.035C8.51667 18.125 8.09083 18.125 7.74333 18.0975C7.38167 18.0692 7.055 18.0083 6.745 17.8608C6.25757 17.6278 5.85098 17.2543 5.5775 16.7883C5.4025 16.4917 5.315 16.1717 5.25583 15.8142C5.19833 15.47 5.1625 15.0458 5.11833 14.5292L4.39083 6.04167H3.75C3.58424 6.04167 3.42527 5.97582 3.30806 5.85861C3.19085 5.7414 3.125 5.58243 3.125 5.41667C3.125 5.25091 3.19085 5.09193 3.30806 4.97472C3.42527 4.85751 3.58424 4.79167 3.75 4.79167H7.055L7.29917 3.10083L7.30833 3.05C7.46 2.39167 8.025 1.875 8.73333 1.875H11.2667C11.975 1.875 12.54 2.39167 12.6917 3.05L12.7008 3.10083ZM8.3175 4.79167H11.6817L11.4683 3.31167C11.4283 3.1725 11.3267 3.125 11.2658 3.125H8.73417C8.67333 3.125 8.57167 3.1725 8.53167 3.31167L8.3175 4.79167ZM9.375 8.75C9.375 8.58424 9.30915 8.42527 9.19194 8.30806C9.07473 8.19085 8.91576 8.125 8.75 8.125C8.58424 8.125 8.42527 8.19085 8.30806 8.30806C8.19085 8.42527 8.125 8.58424 8.125 8.75V12.9167C8.125 13.0824 8.19085 13.2414 8.30806 13.3586C8.42527 13.4758 8.58424 13.5417 8.75 13.5417C8.91576 13.5417 9.07473 13.4758 9.19194 13.3586C9.30915 13.2414 9.375 13.0824 9.375 12.9167V8.75ZM11.875 8.75C11.875 8.58424 11.8092 8.42527 11.6919 8.30806C11.5747 8.19085 11.4158 8.125 11.25 8.125C11.0842 8.125 10.9253 8.19085 10.8081 8.30806C10.6908 8.42527 10.625 8.58424 10.625 8.75V12.9167C10.625 13.0824 10.6908 13.2414 10.8081 13.3586C10.9253 13.4758 11.0842 13.5417 11.25 13.5417C11.4158 13.5417 11.5747 13.4758 11.6919 13.3586C11.8092 13.2414 11.875 13.0824 11.875 12.9167V8.75Z" fill="white" />
                </svg>
            </button>
            <button
                type="button"
                className="gutenverse-button refresh"
                onClick={onRefresh}
                aria-label={__('Refresh email template', 'gutenverse-form')}
                title={__('Refresh email template', 'gutenverse-form')}
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                    <path d="M16.6663 16.6667V12.5H12.4997M3.33301 3.33332V7.49999H7.49967M16.6147 9.16665C16.4402 7.78116 15.8352 6.4854 14.8849 5.46218C13.9346 4.43897 12.687 3.73996 11.3182 3.46376C9.94931 3.18756 8.52829 3.34811 7.25558 3.92278C5.98287 4.49744 4.92271 5.4572 4.22467 6.66665M3.38467 10.8333C3.55911 12.2188 4.16416 13.5146 5.11446 14.5378C6.06476 15.561 7.31234 16.26 8.68119 16.5362C10.05 16.8124 11.4711 16.6519 12.7438 16.0772C14.0165 15.5025 15.0766 14.5428 15.7747 13.3333" stroke="#011627" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );

    return (
        <div className="gutenverse-email-template-manager has-template">
            <InlineNotice type="warning">
                {__('This form action will send this dedicated template only. Other form emails cannot be assigned here.', 'gutenverse-form')}
            </InlineNotice>
            <div className="template-card">
                <div className="template-card-content">
                    <span className="template-label">{templateTitle}</span>
                    <span className="template-description">
                        {__('Used for this form', 'gutenverse-form')} {templateType} {__('email', 'gutenverse-form')}
                    </span>
                </div>
                <div className="template-card-meta">
                    <span className="template-id">ID: {templateId}</span>
                </div>
            </div>
            <div className="template-preview-wrapper">
                <div className="template-preview-header">
                    <span>{__('Template Preview', 'gutenverse-form')}</span>
                    <div className="template-preview-header-actions">
                        <span className="template-preview-note">{__('Read-only snapshot', 'gutenverse-form')}</span>
                        {templateActions}
                    </div>
                </div>
                {templateHtml && (
                    <div className="template-preview-frame">
                        <iframe
                            title={__('Email template preview', 'gutenverse-form')}
                            srcDoc={templateHtml}
                            sandbox=""
                        />
                    </div>
                )}
            </div>
            <InlineNotice type="success" onClose={() => setMessage('')}>{message}</InlineNotice>
            <InlineNotice type="error">{error}</InlineNotice>

            {isDeleteModalOpen && (
                <Modal
                    title={__('Delete Email Template', 'gutenverse-form')}
                    onRequestClose={() => setIsDeleteModalOpen(false)}
                    className="gutenverse-form-confirm-modal gutenverse-email-delete-modal"
                >
                    <div className="gutenverse-email-delete-dialog">
                        <button
                            type="button"
                            className="gutenverse-email-delete-close"
                            aria-label={__('Close dialog', 'gutenverse-form')}
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            <IconCloseSVG size={34} />
                        </button>
                        <div className="gutenverse-email-delete-body">
                            <div className="gutenverse-email-delete-icon" aria-hidden="true">
                                <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24.4019 8.25C25.5566 6.25 28.4434 6.25 29.5981 8.25L49.0836 42C50.2383 44 48.7949 46.5 46.4856 46.5H7.51443C5.20503 46.5 3.76165 44 4.91635 42L24.4019 8.25Z" fill="currentColor" />
                                    <path d="M24.5 20.25H29.5V33H24.5V20.25Z" fill="#fff" />
                                    <path d="M24.5 37H29.5V42H24.5V37Z" fill="#fff" />
                                </svg>
                            </div>
                            <h2>{__('Delete Email Template', 'gutenverse-form')}</h2>
                            <p>
                                {__('Are you sure you want to permanently delete this email template? This action cannot be undone.', 'gutenverse-form')}
                            </p>
                        </div>
                        <div className="gutenverse-email-delete-actions">
                            <button
                                type="button"
                                className="gutenverse-email-delete-cancel"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={saving}
                            >
                                {__('Cancel', 'gutenverse-form')}
                            </button>
                            <button
                                type="button"
                                className="gutenverse-email-delete-confirm"
                                onClick={handleDelete}
                                disabled={saving}
                            >
                                {saving ? __('Deleting...', 'gutenverse-form') : __('Delete Permanently', 'gutenverse-form')}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const TabConfirmation = (props) => {
    const {
        values, updateValue, placeholderDescription, availableInputFields = [],
    } = props;
    const [exampleFilled, setExampleFilled] = useState(false);
    const fillConfirmationExample = () => {
        updateValue('email_input_name', findPreferredInputId(availableInputFields, ['email', 'mail'], 'input-email'));
        updateValue('user_email_form', __('johndoe@gmail.com', 'gutenverse-form'));
        if (values.user_email_subject_type === 'post_meta') {
            updateValue('user_email_subject_meta_key', __('custom_email_subject', 'gutenverse-form'));
        } else {
            updateValue('user_email_subject', __('Thank you for contacting us', 'gutenverse-form'));
        }
        if (!values.user_email_reply_to_type || values.user_email_reply_to_type === 'static') {
            updateValue('user_email_reply_to', __('johndoe@gmail.com', 'gutenverse-form'));
        }
        if (!values.user_message_type || values.user_message_type === 'static') {
            updateValue('user_email_body', __('Hi {{name}}, thanks for your submission.', 'gutenverse-form'));
        }
        setExampleFilled(true);
    };

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
            <ExampleFillButton
                onClick={fillConfirmationExample}
                title={__('Want help filling this email?', 'gutenverse-form')}
                description={__('Insert a sample confirmation setup so you can edit from a realistic starting point.', 'gutenverse-form')}
                success={exampleFilled}
            />
            <FormGroup
                title={__('Recipient Settings', 'gutenverse-form')}
                description={__('Choose which submitted email address receives the confirmation.', 'gutenverse-form')}
            >
                {!values.auto_select_email && (
                    <FieldIdControl
                        id={'email_input_name'}
                        title={__('Recipient Field ID', 'gutenverse-form')}
                        description={__('The specific input ID (name) to use as the recipient email address.', 'gutenverse-form')}
                        defaultValue={'input-email'}
                        value={values.email_input_name}
                        updateValue={updateValue}
                        inputFields={availableInputFields}
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
                    description={__('Choose a fixed reply address or use the current post author with the site admin as fallback.', 'gutenverse-form')}
                    value={values.user_email_reply_to_type || 'static'}
                    options={[
                        { label: __('Static Email', 'gutenverse-form'), value: 'static' },
                        { label: __('Post Author / Site Admin', 'gutenverse-form'), value: 'dynamic' },
                    ]}
                    updateValue={updateValue}
                />
                {values.user_email_reply_to_type === 'dynamic' ? (
                    <InlineNotice type="warning">
                        {__('Replies to this confirmation email will go to the current post author when available. If the form is not submitted from a post, replies go to the site admin email.', 'gutenverse-form')}
                    </InlineNotice>
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
                title={__('Email Content', 'gutenverse-form')}
                description={__('Use a quick text message or design a reusable email template.', 'gutenverse-form')}
            >
                <ControlSelect
                    id={'user_message_type'}
                    title={__('Email Content Type', 'gutenverse-form')}
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
                        clientId={props.clientId}
                        formActionId={props.formActionId}
                        formValues={values}
                    />
                )}
            </FormGroup>
        </>}
    </div>;
};

const TabNotification = (props) => {
    const { values, updateValue, placeholderDescription, availableInputFields = [] } = props;
    const [exampleFilled, setExampleFilled] = useState(false);
    const fillNotificationExample = () => {
        updateValue('admin_email_from', __('johndoe@gmail.com', 'gutenverse-form'));
        if (values.admin_email_subject_type === 'post_meta') {
            updateValue('admin_email_subject_meta_key', __('custom_email_subject', 'gutenverse-form'));
        } else {
            updateValue('admin_email_subject', __('New form submission received', 'gutenverse-form'));
        }
        if (values.admin_email_reply_to_type === 'dynamic') {
            updateValue('admin_email_reply_to_dynamic', findPreferredInputId(availableInputFields, ['email', 'mail'], 'email'));
        } else {
            updateValue('admin_email_reply_to', __('johndoe@gmail.com', 'gutenverse-form'));
        }
        if (values.admin_email_type === 'dynamic') {
            if (values.admin_email_source === 'post_meta') {
                updateValue('admin_email_meta_key', __('assigned_email', 'gutenverse-form'));
            }
        } else {
            updateValue('admin_email_to', __('johndoe@gmail.com, janedoe@gmail.com', 'gutenverse-form'));
        }
        if (values.admin_message_type === 'dynamic') {
            updateValue('admin_message_input_name', findPreferredInputId(availableInputFields, ['message', 'textarea', 'comment', 'note'], 'message'));
        } else if (!values.admin_message_type || values.admin_message_type === 'static') {
            updateValue('admin_note', __('A new entry was submitted on {{site_title}}.', 'gutenverse-form'));
        }
        setExampleFilled(true);
    };

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
            <ExampleFillButton
                onClick={fillNotificationExample}
                title={__('Need a notification example?', 'gutenverse-form')}
                description={__('Insert sample notification values for recipients, subject, sender, and message content.', 'gutenverse-form')}
                success={exampleFilled}
            />
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
                    <FieldIdControl
                        id={'admin_email_reply_to_dynamic'}
                        title={__('Reply-To Field ID', 'gutenverse-form')}
                        description={__('The specific input ID (name) to use as the reply-to email address.', 'gutenverse-form')}
                        value={values.admin_email_reply_to_dynamic}
                        updateValue={updateValue}
                        inputFields={availableInputFields}
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
                title={__('Email Content', 'gutenverse-form')}
                description={__('Use a static note, a submitted field, or a designed email template.', 'gutenverse-form')}
            >
                <ControlSelect
                    id={'admin_message_type'}
                    title={__('Email Content Type', 'gutenverse-form')}
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
                    <FieldIdControl
                        id={'admin_message_input_name'}
                        title={__('Message Field ID', 'gutenverse-form')}
                        description={__('The form input ID that contains the message body.', 'gutenverse-form')}
                        value={values.admin_message_input_name}
                        updateValue={updateValue}
                        inputFields={availableInputFields}
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
                        clientId={props.clientId}
                        formActionId={props.formActionId}
                        formValues={values}
                    />
                )}
            </FormGroup>
        </>}
    </div>;
};

const autoGenerateTags = ({ clientId, values, updateValue }) => {
    const inputs = collectFormInputNames(clientId).map(name => ({ name, input: name }));

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
    const [hideFormNotice, setHideFormNotice] = !isEmpty(window['GutenverseConfig']) ? useState(window['GutenverseConfig']['hideFormNotice']) : useState(false);
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
            label: __('PRO', 'gutenverse-form'),
            pro: true
        },
    };

    const [emailTemplates, setEmailTemplates] = useState([]);
    const [metaKeys, setMetaKeys] = useState([]);

    const fetchEmailTemplates = () => {
        apiFetch({ path: '/wp/v2/gutenverse-email-tpl?per_page=100' }).then(posts => {
            const options = posts.map(post => ({
                label: normalizeTemplateTitle(post.title.rendered),
                value: post.id,
                html: post?.meta?.gutenverse_email_html || '',
            }));
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

    const availableInputFields = mergeFormInputs(
        collectFormInputs(props.clientId),
        collectFormInputsFromValues(props.values)
    );

    const tabProps = {
        ...props, availableInputFields, emailTemplates, metaKeys, placeholderDescription, refreshTemplates: fetchEmailTemplates,
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

    const openUpgradePopup = (event = null) => {
        openFreemiusPopup(
            event,
            `${upgradeProUrl}?utm_source=gutenverse&utm_medium=formProNotice&utm_client_site=${clientUrl}&utm_client_theme=${activeTheme}`,
            { medium: 'formProNotice' }
        );
    };

    const prefetchUpgradePopup = () => {
        prefetchPricingPlanData();
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
                        <div
                            className={classes}
                            key={key}
                            onClick={openUpgradePopup}
                            onMouseEnter={prefetchUpgradePopup}
                            onFocus={prefetchUpgradePopup}
                        >
                            {item.label}
                        </div>,
                        { ...proPopupProps, item, classes, key }
                    )
                    : (
                        <div className={classes} key={key} onClick={() => changeActive(key)}>
                            <span>{item.label}</span>
                        </div>
                    );
            })}
        </div>
        {tab === 'general' && <TabGeneral {...tabProps} />}
        {tab === 'confirmation' && ConfirmationTab}
        {tab === 'notification' && NotificationTab}
        {tab === 'pro' && ProTab}
    </div>;
};

export default FormContent;
