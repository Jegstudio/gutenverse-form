import { __ } from '@wordpress/i18n';
import { CheckboxControl, RepeaterControl, TextControl } from 'gutenverse-core/controls';

export const selectContentPanel = (props) => {
    const {
        setAttributes
    } = props;
    return [
        {
            id: 'selectOptions',
            label: __('Select Options', 'gutenverse-form'),
            component: RepeaterControl,
            titleFormat: '<strong><%= value.label%></strong>',
            options: [
                {
                    id: 'label',
                    label: __('Label', 'gutenverse-form'),
                    component: TextControl,
                },
                {
                    id: 'value',
                    label: __('Value', 'gutenverse-form'),
                    component: TextControl,
                },
                {
                    id: 'selected',
                    label: __('Selected', 'gutenverse-form'),
                    component: CheckboxControl,
                    onChange: values => {
                        if (values.selected === true) {
                            setAttributes({ selectedOption: [...props.selectedOption, values] });
                        } else {
                            let arrSelectedOption = props.selectedOption;
                            const newArr = arrSelectedOption.filter(el => {
                                return el._key !== values._key;
                            });
                            setAttributes({ selectedOption: newArr });
                        }
                    }
                },
                {
                    id: 'disabled',
                    label: __('Disabled', 'gutenverse-form'),
                    component: CheckboxControl,
                },
            ],
        },
    ];
};