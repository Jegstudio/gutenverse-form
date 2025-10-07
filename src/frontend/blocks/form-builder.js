import { Default, u, apiFetch, applyFilters } from 'gutenverse-core-frontend';
import isEmpty from 'lodash/isEmpty';

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
        const formData = data.filter(el => el.formId == formId);
        this.__captchaJS(formBuilder);
        if (formData.length !== 0) {
            if (formData[0]['require_login'] && !formData[0]['logged_in']) {
                formBuilder.remove();
            } else {
                formBuilder.attr('style', '');
                this._onSubmit(formBuilder, formData[0]);
            }
            // REMINDER : button classes added here instead of from block save.js, it is done this way to prevent "Block Recovery" issue.
            formBuilder.find('.guten-submit-wrapper').each(item => {
                const button = u(item);
                const buttonClass = button.find('.gutenverse-input-submit').attr('class');
                const buttonObj = button.find('.gutenverse-input-submit').first().getBoundingClientRect();
                button.find('.gutenverse-input-submit-loader').addClass(buttonClass);
                button.find('.gutenverse-input-submit-loader').attr('style', `width:${buttonObj.width}px;height:${buttonObj.height}px;`);
            });
        } else {
            formBuilder.attr('style', '');
            formBuilder.on('submit', (e) => {
                e.preventDefault();
                const notifclass = 'guten-error';
                const notice = `<div class="form-notification"><div class="notification-body ${notifclass}">${missingLabel}</div></div>`;
                formBuilder.prepend(notice);
            });
            formBuilder.find('.guten-submit-wrapper').each(item => {
                const button = u(item);
                const buttonClass = button.find('.gutenverse-input-submit').attr('class');
                const buttonObj = button.find('.gutenverse-input-submit').first().getBoundingClientRect();
                button.find('.gutenverse-input-submit-loader').addClass(buttonClass);
                button.find('.gutenverse-input-submit-loader').attr('style', `width:${buttonObj.width}px;height:${buttonObj.height}px;`);
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
                case 'file':
                    currentFormBuilder.find(`input[name='${name}'][type='file']`).each(function (value) {
                        
                    });
                    break;
                default:
                    break;
            }
        }

        if (input.type === 'checkbox' && u(input).hasClass('gutenverse-input-switch')) {
            value = input.checked;
        }
        if (input.type === 'checkbox' && u(input).hasClass('gutenverse-input-gdpr')) {
            value = u(input).data('value');
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

    _onSubmit(formBuilder, formData) {
        const instance = this;
        const formId = formBuilder.data('form-id');
        const postId = !isEmpty(window['GutenverseData']) ? window['GutenverseData']['postId'] : 0;
        const hideAfterSubmit = formBuilder.data('hide-after');
        const redirectTo = formBuilder.data('redirect');

        formBuilder.on('submit', (e) => {
            e.preventDefault();
            let recaptchaResponse = null;
            let useCaptcha = false;
            const captcha = formBuilder.find('.gutenverse-recaptcha');
            if (captcha.nodes.length > 0) {
                useCaptcha = true;
                const sitekey = u(captcha.nodes[0]).data('sitekey');
                if (sitekey) {
                    recaptchaResponse = grecaptcha.getResponse();
                }
            }

            const element = e.target;
            const currentFormBuilder = u(element);
            const values = new FormData();
            let validFlag = true;
            let value = null;
            let isPayment = false;
            let paymentMethod = false;
            let paymentPrice = false;
            let paymentItemName = false;
            let paymentOption = false;
            formBuilder.find('.gutenverse-input').each(function (input) {
                const currentInput = u(input);
                const validation = JSON.parse(currentInput.data('validation'));
                const name = currentInput.attr('name');
                value = instance._getInputValue(currentFormBuilder, input, validation);
                const valid = instance.__validate(currentInput, value, validation);
                const parent = currentInput.closest('.guten-form-input');
                const type = instance._getInputType(validation, parent);
                if (valid) {
                    u(parent).removeClass('input-invalid');
                } else {
                    u(parent).addClass('input-invalid');
                }
                validFlag = validFlag && valid;
                validFlag = applyFilters('gutenverse-form.form-builder-submit', validFlag);
                const rule = u(parent).data('guten-input-rule');
                if (!(rule && 'hide' === rule)) {
                    values.push({
                        id: name,
                        value,
                        type
                    });
                    if (validation) {
                        isPayment = ('payment' === validation.type) && value;
                        paymentMethod = ('payment' === validation.type) ? value : false;
                        paymentOption = ('payment' === validation.type) ? JSON.parse(currentInput.data('payment-option')) : false;
                    } else {
                        isPayment = false;
                        paymentMethod = false;
                        paymentOption = false;
                    }
                }
            });

            if (validFlag) {
                currentFormBuilder.addClass('loading');

                // remove existing notification on another submit
                currentFormBuilder.find('.form-notification').remove();
                apiFetch({
                    path: 'gutenverse-form-client/v1/form/submit',
                    method: 'POST',
                    data: {
                        ['form-entry']: {
                            formId,
                            postId,
                            data: values
                        },
                        'g-recaptcha-response': captcha ? recaptchaResponse : null,
                    },
                }).then(({ entry_id }) => {
                    if (isPayment) {
                        const amountId = paymentOption.amountInput;
                        const price = values.find(item => item.id === amountId);
                        paymentPrice = price.value;
                        const message = 'Please wait you are being redirected';
                        const notifclass = 'guten-loading';
                        const notice = `<div class="form-notification"><div class="notification-body ${notifclass}">${message}</div></div>`;
                        currentFormBuilder.prepend(notice);

                        apiFetch({
                            path: 'gutenverse-pro/v1/form-payment',
                            method: 'POST',
                            data: {
                                payment: {
                                    paymentMethod,
                                    paymentPrice,
                                    paymentOption,
                                    paymentItemName,
                                    redirectTo,
                                    id: entry_id,
                                    currentUrl: window.location.href
                                }
                            },
                        }).then((data) => {
                            window.location = data.url;
                        }).catch((e) => {
                            currentFormBuilder.find('.form-notification').remove();
                            const message = (e.data && e.data.error) ? e.data.error : e.message;
                            const notifclass = 'guten-error';
                            const notice = `<div class="form-notification"><div class="notification-body ${notifclass}">${message}</div></div>`;
                            currentFormBuilder.prepend(notice);
                            currentFormBuilder.removeClass('loading');
                        });
                    } else {
                        this._requestMessage(currentFormBuilder, formData, 'success', hideAfterSubmit);
                    }
                }).catch((e) => {
                    currentFormBuilder.find('.form-notification').remove();
                    const message = (e.data && e.data.error) ? e.data.error : e.message;
                    const notifclass = 'guten-error';
                    const notice = `<div class="form-notification"><div class="notification-body ${notifclass}">${message}</div></div>`;
                    currentFormBuilder.prepend(notice);
                    currentFormBuilder.removeClass('loading');
                    this._requestMessage(currentFormBuilder, formData, 'error', hideAfterSubmit);
                }).finally(() => {
                    if (captcha) {
                        if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse().length > 0) {
                            grecaptcha.reset();
                        }
                        if (!isPayment) {
                            currentFormBuilder.removeClass('loading');
                        }
                        if (redirectTo && !isPayment) {
                            window.location = redirectTo;
                        }
                    }

                });
            }
        });
    }

    _requestMessage(currentFormBuilder, formData, notifClass, hideAfterSubmit) {
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


    __validate(currentInput, value, validation) {
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
                if (value === '' || value.length === 0) {
                    return false;
                }
            }

            if ('character' === validation.validationType) {
                const length = value.length;
                return length >= validation.validationMin && length <= validation.validationMax;
            }

            if ('word' === validation.validationType) {
                const length = value.split(' ').length;
                return length >= validation.validationMin && length <= validation.validationMax;
            }

            if ('email' === validation.type) {
                return this.__validateEmail(value);
            }
        }

        return true;
    }
}

export default GutenverseFormValidation;