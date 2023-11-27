import { Default } from 'gutenverse-core-frontend';
import { u } from 'gutenverse-core-frontend';
import { Choices } from 'gutenverse-core-frontend';

class GutenverseMultiInputSelect extends Default {
    /* public */
    init() {
        this.choiceInstance = null;
        this._elements.map(element => {
            this._selectItems(element);
        });
    }

    _selectItems(element) {
        const selects = u(element).find('.gutenverse-input-multiselect');
        selects.map(select => {
            this.choiceInstance = new Choices(select, {
                removeItemButton: true,
                shouldSort: false,
            });
        });
    }

    destroy() {
        this.choiceInstance.destroy();
    }
}

export default GutenverseMultiInputSelect;