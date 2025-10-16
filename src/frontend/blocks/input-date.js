import { Default, u } from 'gutenverse-core-frontend';
import flatpickr from 'flatpickr';

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
        setting.disableMobile = 'true';
        flatpickr(element, setting);
    }
}

const selected = u('.guten-form-input-date');

if (selected) {
    new GutenverseInputDate(selected);
}


export default GutenverseInputDate;