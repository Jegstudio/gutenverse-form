import { Default } from 'gutenverse-core-frontend';
import flatpickr from 'flatpickr';
import u from 'umbrellajs';

class GutenverseInputDate extends Default {
    /* public */
    init() {
        this._elements.map(element => {
            this._dateItems(element);
        });
    }

    _dateItems(element) {
        u(element).find('.gutenverse-input').map(element => {
            this.__createDate(element);
        });
    }

    __createDate(element) {
        const setting = JSON.parse(u(element).data('date'));
        flatpickr(element, setting);
    }
}

export default GutenverseInputDate;