import { getBlockType, registerBlockType } from '@wordpress/blocks';
import { isBlockActive } from 'gutenverse-core/helper';
import { updateBlockList } from 'gutenverse-core/editor-helper';
import { addFilter } from '@wordpress/hooks';
import { IconFormCalculationSVG, IconFormImageRadioSVG, IconFormMobileSVG, IconFormPaymentSVG, IconFormStepperNavigationButtonSVG, IconFormStepperSVG, IconMultiGroupSelectSVG } from '../assets/icon';
import { plainGeneratorFormFunction } from './styling/generate-css';

addFilter(
    'gutenverse.blocklist.locked',
    'gutenverse/blocklist/locked',
    (list) => {

        return [
            {
                name: 'gutenverse/form-input-calculation',
                title: 'Calculation Input',
                category: 'gutenverse-form',
                icon: <IconFormCalculationSVG />,
                pro: true,
                locked: true,
            },
            {
                name: 'gutenverse/form-input-image-radio',
                title: 'Image Radio',
                category: 'gutenverse-form',
                icon: <IconFormImageRadioSVG />,
                pro: true,
                locked: true,
            },
            {
                name: 'gutenverse/form-input-payment',
                title: 'Payment',
                category: 'gutenverse-form',
                icon: <IconFormPaymentSVG />,
                pro: true,
                locked: true,
            },
            {
                name: 'gutenverse/form-stepper-navigation',
                title: 'Stepper Navigation Button',
                category: 'gutenverse-form',
                icon: <IconFormStepperNavigationButtonSVG />,
                pro: true,
                locked: true,
            },
            {
                name: 'gutenverse/form-stepper',
                title: 'Form Stepper',
                category: 'gutenverse-form',
                icon: <IconFormStepperSVG />,
                pro: true,
                locked: true,
            },
            {
                name: 'gutenverse/form-input-multi-group-select',
                title: 'Multi Group Select',
                category: 'gutenverse-form',
                icon: <IconMultiGroupSelectSVG />,
                pro: true,
                locked: true,
            },
            {
                name: 'gutenverse/form-input-mobile',
                title: 'Mobile Input',
                category: 'gutenverse-form',
                icon: <IconFormMobileSVG />,
                pro: true,
                locked: true,
            },
            ...list,
        ];
    }
);

addFilter(
    'gutenverse-css-generator-plain-function',
    'gutenverse/css/generator/plain/function',
    (value, props) => plainGeneratorFormFunction(value, props)
);

const registerBlocks = () => {
    const r = require.context('./blocks', true, /index\.js$/);

    r.keys().forEach(key => {
        const { settings, metadata, name } = r(key);

        name && updateBlockList({ name, settings, metadata });

        if (window?.GutenverseConfig && name && !getBlockType(name) && isBlockActive(name)) {
            registerBlockType(name, {
                ...settings,
                ...metadata
            });
        }
    });
};

(() => {
    registerBlocks();
})();
