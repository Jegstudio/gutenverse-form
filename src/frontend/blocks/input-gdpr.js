import { Default, u } from 'gutenverse-core-frontend';

class GutenverseInputGDPR extends Default {
    /* public */
    init() {
        this._elements.map(element => {
            this._onClickItems(element);
        });
    }

    _onClickItems(element) {
        const gdpr = u(element).find('.check');
        gdpr.on('click', () => {
            this._handleClick(element);
        });
    }

    _handleClick(element) {
        const gdpr = u(element).find('.gutenverse-input-gdpr');
        const elementStatus = gdpr.is(':checked');
        gdpr.attr('checked', !elementStatus);
    }
}

const selected = u('.guten-form-input-gdpr');

if (selected) {
    new GutenverseInputGDPR(selected);
}
