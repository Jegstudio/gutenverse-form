import { Default, u } from 'gutenverse-core-frontend';
import Choices from 'choices.js';

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
            this.choiceInstance = new Choices(select, {
                removeItemButton: true,
            });
        });
    }

    destroy() {
        this.choiceInstance.destroy();
    }
}

export default GutenverseInputSelect;