import { __ } from '@wordpress/i18n';
import { CheckboxControl, RepeaterControl, TextControl } from 'gutenverse-core/controls';

export const radioContentPanel = (props) => {
    const { attributes, setAttributes, radioOptions } = props;

    return [
        {
            id: 'radioOptions',
            label: __('Radio Options', 'gutenverse-form'),
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
                    onChange: (value) => {
                        if (value?.selected) {
                            const newOptions = radioOptions.map((opt) => {
                                return {
                                    ...opt,
                                    selected: opt._key === value._key,
                                };
                            });
                            setAttributes({ radioOptions: newOptions });
                        }
                    },
                },
            ],
        },
    ];
};