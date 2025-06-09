import { Default, u } from 'gutenverse-core-frontend';
import { Choices } from 'gutenverse-core-frontend';

class GutenverseInputSelect extends Default {
    /* public */
    init() {
        this.choiceInstance = null;
        this._elements.map(element => {
            this._selectItems(element);
        });
    }

    _selectItems(element) {
        const selects = u(element).find('.gutenverse-input-select');
        selects.map(select => {
            const { iconClose, iconOpen, useCustomDropdown } = JSON.parse(select.getAttribute('data-dropdown'));
            this.choiceInstance = new Choices(select, {
                removeItemButton: true,
                shouldSort: false,
            });
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

                // Hide Choices default arrow (only once is fine)
                if (!document.getElementById('choices-hide-arrow-style')) {
                    const style = document.createElement('style');
                    style.id = 'choices-hide-arrow-style';
                    style.textContent = `
                    .choices[data-type*="select-one"]::after {
                        display: none;
                    }
                `;
                    document.head.appendChild(style);
                }
            }, 100);
            // if (this.choiceInstance) {
            //     const $inner = u('.choices__inner');

            //     $inner.each(el => {
            //         el.style.position = 'relative';

            //         // Create smiley icon
            //         const icon = document.createElement('i');
            //         icon.className = 'fa-solid fa-face-smile'; // Any FA icon
            //         icon.style.position = 'absolute';
            //         icon.style.right = '1rem';
            //         icon.style.top = '50%';
            //         icon.style.transform = 'translateY(-50%)';
            //         icon.style.pointerEvents = 'none';
            //         icon.style.color = '#555';

            //         el.appendChild(icon);
            //     });

            //     // Optionally hide default arrow
            //     const $choice = u('.choices[data-type*="select-one"]');
            //     $choice.attr('style', 'overflow: visible;'); // optional

            //     const style = document.createElement('style');
            //     style.textContent = `
            //         .choices[data-type*="select-one"]::after {
            //             display: none;
            //         }
            //     `;
            //     document.head.appendChild(style);
            // }
        });
    }

    destroy() {
        this.choiceInstance.destroy();
    }
}

export default GutenverseInputSelect;