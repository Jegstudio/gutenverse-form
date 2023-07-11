import { Default } from 'gutenverse-core-frontend';
import u from 'umbrellajs';
import Choices from 'choices.js';

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
            });
        });
    }

    destroy() {
        this.choiceInstance.destroy();
    }
}

export default GutenverseMultiInputSelect;