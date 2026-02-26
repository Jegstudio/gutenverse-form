import { Default, u } from 'gutenverse-core-frontend';
import isEmpty from 'lodash/isEmpty';
import apiFetch from '@wordpress/api-fetch';
import { applyFilters } from '@wordpress/hooks';

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
        this._initDynamicValues(formBuilder);
        if (formData.length !== 0) {
            if (formData[0]['require_login'] && !formData[0]['logged_in']) {
                formBuilder.remove();
            } else {
                formBuilder.attr('style', '');
                this._onSubmit(formBuilder, formData[0]);
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
				const notifclass = "guten-error";
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
                    if (( config.type === 'custom' || config.type === 'pro-dynamic' ) && config.custom) {
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
        const postId = formBuilder.data('post-id') || (!isEmpty(window['GutenverseData']) ? window['GutenverseData']['postId'] : 0);
        const hideAfterSubmit = formBuilder.data('hide-after');
        const redirectTo = formBuilder.data('redirect');

        formBuilder.on('submit', (e) => {
            e.preventDefault();
            let recaptchaResponse = null;
            const captcha = formBuilder.find('.gutenverse-recaptcha');
            if (captcha.nodes.length > 0) {
                const sitekey = u(captcha.nodes[0]).data('sitekey');
                if (sitekey) {
                    recaptchaResponse = grecaptcha.getResponse(); // eslint-disable-line
                }
            }

            const element = e.target;
            const currentFormBuilder = u(element);
            const values = [];
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
            if (captcha.nodes.length > 0 && !recaptchaResponse) {
                validFlag = false;
                const notifclass = 'guten-error';
                const message = window?.GutenverseFormValidationData?.recaptchaLabel || 'Please confirm that you are not a robot.';
                const notice = `<div class="form-notification"><div class="notification-body ${notifclass}">${message}</div></div>`;
                currentFormBuilder.find('.form-notification').remove();
                currentFormBuilder.prepend(notice);
            }

            //uncomment this when done debugging
            if (validFlag) {
                currentFormBuilder.addClass('loading');
                const requestBody = new FormData();
                requestBody.append('form-entry[formId]', formId);
                requestBody.append('form-entry[postId]', postId);

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
                    apiFetch({
                        path: 'gutenverse-form-client/v1/form/submit',
                        method: 'POST',
                        body: requestBody
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
                        if (captcha.nodes.length > 0) {
                            if (typeof grecaptcha !== 'undefined' && grecaptcha.getResponse().length > 0) {
                                grecaptcha.reset();
                            }
                        }
                        currentFormBuilder.removeClass('loading');

                        if (redirectTo && !isPayment) {
                            window.location = redirectTo;
                        }
                    });
                }, 500);

            }
        });
    }

	_requestMessage(currentFormBuilder, formData, notifClass, hideAfterSubmit) {
		const noticeBlock = currentFormBuilder.find(".guten-form-notice");
		let message = '';
		let notifclass = '';

		switch (notifClass) {
			case 'success':
				message = formData['form_success_notice'];
				notifclass = "guten-success";
				break;
			case "error":
				message = formData["form_error_notice"];
				notifclass = "guten-error";
				break;
			default:
				break;
		}

		if (noticeBlock.nodes.length > 0) {
			const noticeWrapper = noticeBlock.find(
				".guten-form-notice-wrapper",
			);
			const noticeContent = noticeBlock.find(
				".guten-form-notice-content",
			);
			const noticeIcon = noticeBlock.find(".guten-form-notice-icon");
			const noticeData = JSON.parse(
				noticeBlock.attr("data-notice") || "{}",
			);

			// Determine message
			let finalMessage = message;
			if (noticeData.messageSource === "custom") {
				finalMessage =
					notifClass === "success"
						? noticeData.successMessage
						: noticeData.errorMessage;
			}

			// Handle Icon
			noticeIcon.html("");
			const currentIcon =
				notifClass === "success"
					? noticeData.iconSuccess
					: noticeData.iconError;
			const currentType =
				notifClass === "success"
					? noticeData.iconSuccessType
					: noticeData.iconErrorType;
			const currentSVG =
				notifClass === "success"
					? noticeData.iconSuccessSVG
					: noticeData.iconErrorSVG;
			const currentLayout =
				notifClass === "success"
					? noticeData.iconLayoutSuccess
					: noticeData.iconLayoutError;

			if (currentIcon) {
				if (currentType === "svg") {
					noticeIcon.html(currentSVG);
				} else if (currentType === "icon") {
					noticeIcon.html(`<i class="${currentIcon}"></i>`);
				}
			}

			noticeContent.html(finalMessage);
			noticeBlock.removeClass(
				"status-success status-error notice-success notice-error show-notice",
			);
			noticeBlock.addClass(
				`status-${notifClass} notice-${notifClass} show-notice`,
			);

			noticeWrapper.removeClass(
				"layout-left layout-right layout-top layout-bottom",
			);
			noticeWrapper.addClass(`layout-${currentLayout}`);
			noticeWrapper.attr("style", "display: flex;");

			return;
		}

		if (!isEmpty(message)) {
			// REMINDER : instead of putting the notice div in block save.js, it is done this way to prevent "Block Recovery" issue.
			const notice = `<div class="form-notification"><div class="notification-body ${notifclass}">${message}</div></div>`;

			if (hideAfterSubmit === "true" || hideAfterSubmit === true) {
				currentFormBuilder.html(notice);
			} else {
				currentFormBuilder.prepend(notice);
			}

			return;
		}

		if (hideAfterSubmit === "true" || hideAfterSubmit === true) {
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
                if (value === '' || value.length === 0) {
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
