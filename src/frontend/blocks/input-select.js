import { Default, u } from 'gutenverse-core-frontend';

class GutenverseInputSelect extends Default {
    /* public */
    init() {
        this.choiceInstance = null;
        this._elements.map(element => {
            this._selectItems(element);
        });
    }

    _choiceFunc(select) {
        return import(/* webpackChunkName: "chunk-choices" */ 'choices.js').then(({ default: Choices }) => {
            return new Choices(select, {
                removeItemButton: true,
                shouldSort: false,
            });
        });
    }

    _selectItems(element) {
        const selects = u(element).find('.gutenverse-input-select');
        selects.map(select => {

            this.choiceInstance = this._choiceFunc(select);
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

                        // Create Font Awesome icon element
                        const icon = document.createElement('i');
                        icon.className = iconOpen;

                        innerEl.appendChild(icon);

                        // Attach events to that specific dropdown container
                        const wrapper = $choiceWrapper.first();

                        wrapper.addEventListener('showDropdown', () => {
                            icon.className = iconClose; // Open icon
                        });

                        wrapper.addEventListener('hideDropdown', () => {
                            icon.className = iconOpen; // Closed icon
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
