import { Default, u } from 'gutenverse-core-frontend';

class GutenverseInputSelect extends Default {
    _createIcon(iconData) {
        if (!iconData) return null;

        if (typeof iconData === 'string') {
            const i = document.createElement('i');
            i.className = iconData;
            return i;
        }

        const { props } = iconData;
        const { children = [] } = props;
        let result = null;
        if (children.length) {
            children.forEach((ele) => {
                if (ele) {
                    const { type, props } = ele;
                    const element = document.createElement(type);
                    if (props) {
                        if (props.className) {
                            element.className = props.className;
                        }
                        if (props.dangerouslySetInnerHTML) {
                            element.innerHTML = props.dangerouslySetInnerHTML.__html;
                        }
                        if (props['aria-hidden']) {
                            element.setAttribute('aria-hidden', props['aria-hidden']);
                        }
                    }
                    result = element;
                }
            });
        }
        return result;
    }

    /* public */
    init() {
        this.choiceInstance = null;
        this._elements.map(element => {
            this._selectItems(element);
        });
    }

    _choiceFunc(select, afterInit = () => { }) {
        return import(/* webpackChunkName: "chunk-choices" */ 'choices.js').then(({ default: Choices }) => {
            const obj = new Choices(select, {
                removeItemButton: true,
                shouldSort: false,
            });
            if (afterInit) {
                afterInit(obj);
            }
            return obj;
        });
    }

    _selectItems(element) {
        const selects = u(element).find('.gutenverse-input-select');
        selects.map(select => {
            const afterInitFunc = () => {
                let dataDropDown = select.getAttribute('data-dropdown');
                if (dataDropDown) {
                    const { iconClose, iconOpen, useCustomDropdown } = JSON.parse(dataDropDown);
                    // Wait briefly to let Choices build the DOM
                    setTimeout(() => {
                        const $choiceWrapper = u(element).find('.choices');
                        if (useCustomDropdown) {
                            $choiceWrapper.addClass('custom-dropdown');
                        }
                        const $inner = $choiceWrapper.find('.choices__inner');

                        $inner.each(innerEl => {
                            innerEl.style.position = 'relative';

                            // Create Icon
                            let currentIcon = this._createIcon(iconOpen);
                            if (currentIcon) innerEl.appendChild(currentIcon);

                            // Attach events to that specific dropdown container
                            const wrapper = $choiceWrapper.first();

                            wrapper.addEventListener('showDropdown', () => {
                                if (currentIcon) currentIcon.remove();
                                currentIcon = this._createIcon(iconClose);
                                if (currentIcon) innerEl.appendChild(currentIcon);
                            });

                            wrapper.addEventListener('hideDropdown', () => {
                                if (currentIcon) currentIcon.remove();
                                currentIcon = this._createIcon(iconOpen);
                                if (currentIcon) innerEl.appendChild(currentIcon);
                            });
                        });
                        let selector = '';
                        u(element).nodes[0].classList.forEach(el => {
                            selector += `.${el}`;
                        });
                        // Hide Choices default arrow (only once is fine)
                        if (!document.getElementById('choices-hide-arrow-style')) {
                            const style = document.createElement('style');
                            style.id = 'choices-hide-arrow-style';
                            style.textContent = `
                                ${selector} .choices[data-type*="select-one"]::after {
                                    display: none;
                                }
                            `;
                            document.head.appendChild(style);
                        }
                    }, 100);
                }
            };
            this.choiceInstance = this._choiceFunc(select, afterInitFunc);
        });
    }

    destroy() {
        this.choiceInstance.destroy();
    }
}

const selected = u('.guten-form-input-select');

if (selected) {
    new GutenverseInputSelect(selected);
}
