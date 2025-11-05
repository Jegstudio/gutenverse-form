import { Default, u } from 'gutenverse-core-frontend';

class GutenverseMultiInputSelect extends Default {
    /* public */
    init() {
        this.choiceInstance = null;
        this._elements.map(element => {
            this._selectItems(element);
        });
        this.placeholder = '';
    }

    _choiceFunc(select) {
        return import(/* webpackChunkName: "chunk-choices" */ 'choices.js').then(({ default: Choices }) => {
            return new Choices(select, {
                removeItemButton: true,
                shouldSort: false,
                placeholder: false
            });
        });
    }

    _selectItems(element) {
        const selects = u(element).find('.gutenverse-input-multiselect');
        selects.map(select => {
            this.choiceInstance = this._choiceFunc(select);
            select.addEventListener(
                'change',
                function (event) {
                    if (event.target.length > 0) {
                        let placeholderInput = u(element).find('.choices__input.choices__input--cloned');
                        this.placeholder = placeholderInput.nodes[0].placeholder;
                        placeholderInput.nodes[0].placeholder = '';
                    }
                }
            );
        });
    }

    destroy() {
        this.choiceInstance.destroy();
    }
}

const selected = u('.guten-form-input-multiselect');

if (selected) {
    new GutenverseMultiInputSelect(selected);
}
