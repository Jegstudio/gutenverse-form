import { u } from 'gutenverse-core-frontend';
import GutenverseFormValidation from './blocks/form-builder';
import GutenverseInputDate from './blocks/input-date';
import GutenverseInputSelect from './blocks/input-select';
import GutenverseMultiInputSelect from './blocks/input-multiselect';
import GutenverseInputGDPR from './blocks/input-gdpr';

const gutenClasses = {
    ['form-builder']: GutenverseFormValidation,
    ['form-input-date']: GutenverseInputDate,
    ['form-input-select']: GutenverseInputSelect,
    ['form-input-multiselect']: GutenverseMultiInputSelect,
    ['form-input-gdpr'] : GutenverseInputGDPR
};

Object.keys(gutenClasses).map((index) => {
    const selected = u(`.guten-${index}`);
    const ClassItem = gutenClasses[index];

    if (selected) {
        new ClassItem(selected);
    }
});
