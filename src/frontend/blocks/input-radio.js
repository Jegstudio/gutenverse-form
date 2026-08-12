import { Default, u } from 'gutenverse-core-frontend';

class GutenverseInputRadio extends Default {
    init() {
        this._elements.map(element => {
            this._init(element);
        });
    }

    _init(element) {
        const wrapper = u(element);
        const radioInputs = wrapper.find('.gutenverse-input-radio');
        
        radioInputs.on('click', (e) => {
            const radio = e.currentTarget;
            
            if (radio.getAttribute('data-was-checked') === 'true') {
                radio.checked = false;
                radio.setAttribute('data-was-checked', 'false');
                radio.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                const name = radio.name;
                // Find all radios with the same name in the same form/wrapper
                const group = wrapper.find(`input[name="${name}"].gutenverse-input-radio`);
                group.each(input => {
                    input.setAttribute('data-was-checked', 'false');
                });
                radio.setAttribute('data-was-checked', 'true');
            }
        });
        
        // Initialize state
        radioInputs.each(radio => {
            if (radio.checked) {
                radio.setAttribute('data-was-checked', 'true');
            }
        });
    }
}

const selected = u('.guten-form-input-radio');

if (selected.length > 0) {
    new GutenverseInputRadio(selected);
}
