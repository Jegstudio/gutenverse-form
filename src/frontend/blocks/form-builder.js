import { Default, u } from 'gutenverse-core-frontend';
import isEmpty from 'lodash/isEmpty';
import { applyFilters } from '@wordpress/hooks';

const getRestUrl = (path) => {
    const apiRoot = window?.wpApiSettings?.root || `${window.location.origin}/wp-json/`;
    return `${apiRoot.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const getWpNonce = () => window?.wpApiSettings?.nonce || '';

const submitPublicForm = (url, body, options = {}) => {
    const headers = {};

    if (options.nonce) {
        headers['X-WP-Nonce'] = options.nonce;
    }

    return fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers,
        body
    }).then(response => {
        return response.json().catch(() => ({})).then(data => {
            if (!response.ok) {
                const error = new Error(data?.message || response.statusText);
                error.data = data;
                throw error;
            }

            return data;
        });
    });
};

const submitJson = (url, data) => {
    return fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        return response.json().catch(() => ({})).then(result => {
            if (!response.ok) {
                const error = new Error(result?.message || result?.error || response.statusText);
                error.data = result;
                throw error;
            }

            return result;
        });
    });
};

const renderNoticeIcon = (icon, iconType = 'icon', iconSVG = '') => {
    if (iconType === 'svg' && iconSVG) {
        try {
            const svgData = atob(iconSVG);
            return `<div class="gutenverse-icon-svg">${svgData}</div>`;
        } catch (e) {
            if (iconSVG.trim().startsWith('<svg')) {
                return `<div class="gutenverse-icon-svg">${iconSVG}</div>`;
            }

            return '';
        }
    }

    if (icon) {
        return `<i class="${icon}"></i>`;
    }

    return '';
};

class GutenverseFormValidation extends Default {
    /* public */
    init() {
        this._elements.map(element => {
            this._init(element);
        });
    }

    /* private */
    _init(element) {
        const formBuilder = u(element);
        const formId = formBuilder.data('form-id');
        const { data, missingLabel, isAdmin } = window['GutenverseFormValidationData'];
        const matchedFormData = data.find(el => el.formId == formId);
        const hasAssignedForm = !!formId;

        this.__captchaJS(formBuilder);
        this._initDynamicValues(formBuilder);
        if (matchedFormData || hasAssignedForm) {
            const formData = matchedFormData || {
                formId,
                require_login: false,
                logged_in: true,
                form_success_notice: false,
                form_error_notice: false
            };

            if (formData['require_login'] && !formData['logged_in']) {
                formBuilder.remove();
            } else {
                formBuilder.attr('style', '');
                this._onSubmit(formBuilder, formData);
            }
            // REMINDER : button classes added here instead of from block save.js, it is done this way to prevent "Block Recovery" issue.
            const buttonUpdates = [];
            formBuilder.find('.guten-submit-wrapper').each(item => {
                const button = u(item);
                const buttonClass = button.find('.gutenverse-input-submit').attr('class');
                const buttonObj = button.find('.gutenverse-input-submit').first().getBoundingClientRect();
                const loader = button.find('.gutenverse-input-submit-loader');
                buttonUpdates.push({ loader, buttonClass, width: buttonObj.width, height: buttonObj.height });
            });

            buttonUpdates.forEach(({ loader, buttonClass, width, height }) => {
                loader.addClass(buttonClass);
                loader.attr('style', `width:${width}px;height:${height}px;`);
            });
        } else {
            formBuilder.attr('style', '');
            formBuilder.on('submit', (e) => {
                e.preventDefault();
                const notifclass = 'guten-error';
                const notice = `<div class="form-notification"><div class="notification-body ${notifclass}">${missingLabel}</div></div>`;
                formBuilder.prepend(notice);
            });
            const buttonUpdates = [];
            formBuilder.find('.guten-submit-wrapper').each(item => {
                const button = u(item);
                const buttonClass = button.find('.gutenverse-input-submit').attr('class');
                const buttonObj = button.find('.gutenverse-input-submit').first().getBoundingClientRect();
                const loader = button.find('.gutenverse-input-submit-loader');
                buttonUpdates.push({ loader, buttonClass, width: buttonObj.width, height: buttonObj.height });
            });

            buttonUpdates.forEach(({ loader, buttonClass, width, height }) => {
                loader.addClass(buttonClass);
                loader.attr('style', `width:${width}px;height:${height}px;`);
            });

            if (isAdmin) {
                const notifclass = 'guten-error';
                const notice = `<div class="form-notification"><div class="notification-body ${notifclass}">${missingLabel}</div></div>`;
                formBuilder.prepend(notice);
            }
        }
    }

    __captchaJS(formBuilder) {
        const captcha = formBuilder.find('.gutenverse-recaptcha');
        if (captcha.nodes.length > 0) {
            if (document.getElementById('gutenverse-recaptcha-script')) return; // Prevent duplicate

            const script = document.createElement('script');
            script.id = 'gutenverse-recaptcha-script';
            script.src = 'https://www.google.com/recaptcha/api.js';
            script.async = true;
            script.defer = true;

            setTimeout(() => {
                document.head.appendChild(script);
            }, 300);
        }
    }

    _initDynamicValues(formBuilder) {
        formBuilder.find('.gutenverse-input').each(input => {
            const dynamicConfig = u(input).data('dynamic-value');
            if (dynamicConfig) {
                try {
                    const config = typeof dynamicConfig === 'string' ? JSON.parse(dynamicConfig) : dynamicConfig;
                    if ((config.type === 'custom' || config.type === 'pro-dynamic') && config.custom) {
                        if (!input.value) input.value = config.custom;
                    } else if (config.type === 'query' && config.query?.key) {
                        const urlParams = new URLSearchParams(window.location.search);
                        const val = urlParams.get(config.query.key);
                        if (val && !input.value) input.value = val;
                    } else if (config.type === 'user' && config.user?.type) {
                        const userData = window['GutenverseFormValidationData']?.userData;
                        if (userData) {
                            let val = '';
                            if (config.user.type === 'role') {
                                val = userData.role ? userData.role.join(', ') : '';
                            } else if (config.user.type === 'meta' && config.user.meta) {
                                val = userData[config.user.meta] || '';
                            } else {
                                val = userData[config.user.type];
                            }
                            if (val && !input.value) input.value = val;
                        }
                    }
                } catch (e) {
                    console.error('Gutenverse Form: Error parsing dynamic value', e);
                }
            }
        });
    }

    _getInputValue(currentFormBuilder, input, validation) {
        let value = input.value;

        if (validation) {
            const name = u(input).attr('name');

            switch (validation.type) {
                case 'checkbox':
                    value = [];
                    currentFormBuilder.find(`input[name='${name}'][type='checkbox']`).each(function (checkbox) {
                        if (checkbox.checked) {
                            value.push(checkbox.value);
                        }
                    });
                    break;
                case 'radio':
                case 'image-radio':
                case 'payment':
                    currentFormBuilder.find(`input[name='${name}'][type='radio']`).each(function (radio) {
                        if (radio.checked) {
                            value = radio.value;
                        }
                    });
                    break;
                case 'multiselect':
                    value = [];
                    currentFormBuilder.find(`select[name='${name}']`).filter('.gutenverse-input-multiselect').each(function (option) {
                        u(option).find('option').each(function (opt) {
                            if (u(opt).attr('value')) {
                                value.push(u(opt).attr('value'));
                            }
                        });
                    });
                    break;
                case 'multi-group-select':
                    value = [];
                    currentFormBuilder.find(`select[name='${name}']`).filter('.multi-group-select').each(function (option) {
                        u(option).find('option').each(function (opt) {
                            if (u(opt).attr('value')) {
                                value.push(u(opt).attr('value'));
                            }
                        });
                    });
                    break;
                default:
                    value = applyFilters('gutenverse-form.form-builder-get-value',
                        value,
                        input,
                        validation,
                    );
                    break;
            }
        }

        if (input.type === 'checkbox' && u(input).hasClass('gutenverse-input-switch')) {
            value = input.checked;
        }
        if (input.type === 'checkbox' && u(input).hasClass('gutenverse-input-gdpr')) {
            value = input.checked ? u(input).data('value') : u(input).data('unchecked-value');
        }

        if (u(input).hasClass('gutenverse-input-mobile')) {
            const inputValue = u(input).find('.gutenverse-input-mobile-text').first().value;
            const countryCode = u(input).find('.gutenverse-input-prefix').first().innerText;

            if (validation) {
                const valid = this.__validate(input, inputValue, validation);
                if (valid) {
                    value = countryCode + inputValue;
                } else {
                    value = '';
                }
            } else {
                value = countryCode + inputValue;
            }
        }

        return value;
    }

    _getInputType(data, parent) {
        if (parent.hasClass('guten-form-input-switch')) {
            return 'switch';
        }
        if (parent.hasClass('guten-form-input-gdpr')) {
            return 'gdpr';
        }
        if (data && data.type && parent.hasClass(`guten-form-input-${data.type}`)) {
            return data.type;
        }
        return null;
    }

    _getRecaptchaResponse(captcha) {
        if (captcha.nodes.length === 0) {
            return null;
        }

        const sitekey = u(captcha.nodes[0]).data('sitekey');
        const recaptcha = window.grecaptcha;

        if (!sitekey || !recaptcha || typeof recaptcha.getResponse !== 'function') {
            return null;
        }

        try {
            const form = u(captcha.nodes[0]).closest('form');
            const responseField = form.find('textarea[name="g-recaptcha-response"]').nodes
                .find(field => field?.value);

            if (responseField?.value) {
                return responseField.value;
            }

            const defaultResponse = recaptcha.getResponse();
            if (defaultResponse) {
                return defaultResponse;
            }

            const clientIds = Object.keys(window.___grecaptcha_cfg?.clients || {})
                .map(id => Number(id))
                .filter(id => Number.isInteger(id));

            for (const clientId of clientIds) {
                const response = recaptcha.getResponse(clientId);
                if (response) {
                    return response;
                }
            }

            return null;
        } catch {
            return null;
        }
    }

    _resetRecaptcha(captcha) {
        if (captcha.nodes.length === 0) {
            return;
        }

        const recaptcha = window.grecaptcha;

        if (!recaptcha || typeof recaptcha.getResponse !== 'function' || typeof recaptcha.reset !== 'function') {
            return;
        }

        try {
            const recaptchaResponse = this._getRecaptchaResponse(captcha);

            if (recaptchaResponse) {
                recaptcha.reset();
            }
        } catch {
            // The external script can become unavailable after submit; keep cleanup non-blocking.
        }
    }

    _onSubmit(formBuilder, formData) {
        const instance = this;
        const formId = formBuilder.data('form-id');
        const postId = formBuilder.data('post-id') || (!isEmpty(window['GutenverseData']) ? window['GutenverseData']['postId'] : 0);
        const submitUrl = formBuilder.data('submit-url') || getRestUrl('gutenverse-form-client/v1/form/submit');
        const hideAfterSubmit = formBuilder.data('hide-after');
        const redirectTo = formBuilder.data('redirect');
        const startedAtInput = formBuilder.find('input[name="gutenverse-form-started-at"]').first();
        const loadStartedAt = window.performance && typeof window.performance.now === 'function' ? window.performance.now() : Date.now();

        if (startedAtInput && !startedAtInput.value) {
            startedAtInput.value = Date.now();
        }

        formBuilder.on('submit', (e) => {
            e.preventDefault();
            const captcha = formBuilder.find('.gutenverse-recaptcha');
            const recaptchaResponse = instance._getRecaptchaResponse(captcha);

            const element = e.target;
            const currentFormBuilder = u(element);
            const values = [];
            let validFlag = true;
            let value = null;
            let isPayment = false;
            formBuilder.find('.gutenverse-input').each(function (input) {
                const currentInput = u(input);
                const validation = JSON.parse(currentInput.data('validation'));
                const name = currentInput.attr('name');
                const parent = currentInput.closest('.guten-form-input');
                value = instance._getInputValue(currentFormBuilder, input, validation);
                const valid = instance.__validate(currentInput, value, validation, formData);
                const type = instance._getInputType(validation, parent);
                if (valid) {
                    u(parent).removeClass('input-invalid');
                } else {
                    u(parent).addClass('input-invalid');
                }
                validFlag = validFlag && valid;
                const rule = u(parent).data('guten-input-rule');
                if (!(rule && 'hide' === rule)) {
                    values.push({
                        id: name,
                        value: value,
                        type
                    });
                    if (validation && 'payment' === validation.type && value) {
                        isPayment = true;
                    }
                }
            });
            if (captcha.nodes.length > 0 && !recaptchaResponse) {
                validFlag = false;
                const message = window?.GutenverseFormValidationData?.recaptchaLabel || 'Please confirm that you are not a robot.';
                this._requestMessage(currentFormBuilder, formData, 'error', hideAfterSubmit, message);
            }

            //uncomment this when done debugging
            if (validFlag) {
                currentFormBuilder.addClass('loading');
                const requestBody = new FormData();
                requestBody.append('form-entry[formId]', formId);
                requestBody.append('form-entry[postId]', postId);

                const integrationSourceInput = currentFormBuilder.find('input[name="gutenverse-form-integration-source"]').first();
                if (integrationSourceInput) {
                    requestBody.append('form-entry[integrationSource]', integrationSourceInput.value);
                }

                const honeypotInput = currentFormBuilder.find('input[name="gutenverse-form-hp"]').first();
                const currentStartedAtInput = currentFormBuilder.find('input[name="gutenverse-form-started-at"]').first();
                const currentTime = window.performance && typeof window.performance.now === 'function' ? window.performance.now() : Date.now();
                requestBody.append('gutenverse-form-hp', honeypotInput ? honeypotInput.value : '');
                requestBody.append('gutenverse-form-started-at', currentStartedAtInput && currentStartedAtInput.value ? currentStartedAtInput.value : Date.now());
                requestBody.append('gutenverse-form-elapsed', Math.max(0, Math.floor(currentTime - loadStartedAt)));

                // append each value field
                values.forEach(({ id, value, type }, idx) => {
                    requestBody.append(`form-entry[data][${idx}][id]`, id);
                    requestBody.append(`form-entry[data][${idx}][${id}-${idx}-value]`, value);
                    requestBody.append(`form-entry[data][${idx}][type]`, type);
                });

                // add captcha if exists
                if (captcha.nodes.length > 0) {
                    requestBody.append('g-recaptcha-response', recaptchaResponse);
                }
                // remove existing notification on another submit
                currentFormBuilder.find('.form-notification').remove();
                setTimeout(() => {
                    submitPublicForm(submitUrl, requestBody, {
                        nonce: formData['require_login'] ? getWpNonce() : ''
                    }).then(({ entry_id }) => {
                        if (isPayment) {
                            const message = 'Please wait you are being redirected';
                            const notifclass = 'guten-loading';
                            const notice = `<div class="form-notification"><div class="notification-body ${notifclass}">${message}</div></div>`;
                            currentFormBuilder.prepend(notice);

                            submitJson(getRestUrl('gutenverse-pro/v1/form-payment'), {
                                payment: {
                                    id: entry_id
                                }
                            }).then((data) => {
                                window.location = data.url;
                            }).catch((e) => {
                                const message = (e.data && e.data.error) ? e.data.error : e.message;
                                this._requestMessage(currentFormBuilder, formData, 'error', hideAfterSubmit, message);
                                currentFormBuilder.removeClass('loading');
                            });
                        } else {
                            this._requestMessage(currentFormBuilder, formData, 'success', hideAfterSubmit);
                        }
                    }).catch((e) => {
                        const message = (e.data && e.data.error) ? e.data.error : e.message;
                        this._requestMessage(currentFormBuilder, formData, 'error', hideAfterSubmit, message);
                        currentFormBuilder.removeClass('loading');
                    }).finally(() => {
                        instance._resetRecaptcha(captcha);
                        currentFormBuilder.removeClass('loading');

                        if (redirectTo && !isPayment) {
                            window.location = redirectTo;
                        }
                    });
                }, 500);

            }
        });
    }

    _requestMessage(currentFormBuilder, formData, notifClass, hideAfterSubmit, overrideMessage = '') {
        const noticeBlock = currentFormBuilder.find('.guten-form-notice');
        let message = '';
        let notifclass = '';

        switch (notifClass) {
            case 'success':
                message = formData['form_success_notice'];
                notifclass = 'guten-success';
                break;
            case 'error':
                message = formData['form_error_notice'];
                notifclass = 'guten-error';
                break;
            default:
                break;
        }

        if (!isEmpty(overrideMessage)) {
            message = overrideMessage;
        }

        if (noticeBlock.nodes.length > 0) {
            const noticeWrapper = noticeBlock.find(
                '.guten-form-notice-wrapper',
            );
            const noticeContent = noticeBlock.find(
                '.guten-form-notice-content',
            );
            const noticeIcon = noticeBlock.find('.guten-form-notice-icon');
            const noticeData = JSON.parse(
                noticeBlock.attr('data-notice') || '{}',
            );

            // Determine message
            let finalMessage = message;
            if (isEmpty(overrideMessage) && noticeData.messageSource === 'custom') {
                finalMessage =
                    notifClass === 'success'
                        ? noticeData.successMessage
                        : noticeData.errorMessage;
            }

            // Handle Icon
            noticeIcon.html('');
            const currentIcon =
                notifClass === 'success'
                    ? noticeData.iconSuccess
                    : noticeData.iconError;
            const currentType =
                notifClass === 'success'
                    ? noticeData.iconSuccessType
                    : noticeData.iconErrorType;
            const currentSVG =
                notifClass === 'success'
                    ? noticeData.iconSuccessSVG
                    : noticeData.iconErrorSVG;
            const currentLayout =
                notifClass === 'success'
                    ? noticeData.iconLayoutSuccess
                    : noticeData.iconLayoutError;

            noticeIcon.html(renderNoticeIcon(currentIcon, currentType, currentSVG));

            noticeContent.html(finalMessage);
            noticeBlock.removeClass(
                'status-success status-error notice-success notice-error show-notice',
            );
            noticeBlock.addClass(
                `status-${notifClass} notice-${notifClass} show-notice`,
            );

            noticeWrapper.removeClass(
                'layout-left layout-right layout-top layout-bottom',
            );
            noticeWrapper.addClass(`layout-${currentLayout}`);
            noticeWrapper.attr('style', 'display: flex;');

            return;
        }

        if (!isEmpty(message)) {
            // REMINDER : instead of putting the notice div in block save.js, it is done this way to prevent "Block Recovery" issue.
            const notice = `<div class="form-notification"><div class="notification-body ${notifclass}">${message}</div></div>`;

            if (hideAfterSubmit === 'true' || hideAfterSubmit === true) {
                currentFormBuilder.html(notice);
            } else {
                currentFormBuilder.prepend(notice);
            }

            return;
        }

        if (hideAfterSubmit === 'true' || hideAfterSubmit === true) {
            currentFormBuilder.remove();
        }
    }

    __validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }


    __validate(currentInput, value, validation, formData) {
        const parent = currentInput.closest('.guten-form-input');
        const rule = u(parent).data('guten-input-rule');
        if (rule && 'hide' === rule) {
            return true;
        }
        if (validation) {
            if (validation.required === true) {
                if ('radio' === validation.type || 'image-radio' === validation.type || 'payment' === validation.type) {
                    return value !== undefined;
                }
                if ('checkbox' === validation.type) {
                    return value.length !== 0;
                }
                if (value === '' || value === undefined || value.length === 0) {
                    return false;
                }
            }

            if ('character' === validation.validationType) {
                const length = value.length;
                const min = parseFloat(validation.validationMin);
                const max = parseFloat(validation.validationMax);

                if (!isNaN(min) && length < min) {
                    return false;
                }
                if (!isNaN(max) && length > max) {
                    return false;
                }
                return true;
            }

            if ('word' === validation.validationType) {
                const length = value.split(' ').length;
                const min = parseFloat(validation.validationMin);
                const max = parseFloat(validation.validationMax);

                if (!isNaN(min) && length < min) {
                    return false;
                }
                if (!isNaN(max) && length > max) {
                    return false;
                }
                return true;
            }

            if ('email' === validation.type) {
                return this.__validateEmail(value);
            }

            let valid = true;
            valid = applyFilters('gutenverse-form.form-builder-validation', valid, value, formData, validation, parent);
            return valid;
        }

        return true;
    }
}

const selected = u('.guten-form-builder');

if (selected) {
    new GutenverseFormValidation(selected);
}
