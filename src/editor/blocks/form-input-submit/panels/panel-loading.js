import { __ } from '@wordpress/i18n';
import { ColorControl, RangeControl } from 'gutenverse-core/controls';
import { handleColor } from 'gutenverse-core/styling';

export const loadingPanel = (props) => {
    const {
        elementId,
    } = props;

    return [
        {
            id: 'loadingSize',
            label: __('Loading Icon Size', 'gutenverse-form'),
            component: RangeControl,
            allowDeviceControl: true,
            unit: 'px',
            min: 1,
            max: 200,
            step: 1,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input-submit-loader`,
                    render: value => `font-size: ${value}px;`
                }
            ]
        },
        {
            id: 'loadingColor',
            label: __('Loading Color', 'gutenverse-form'),
            component: ColorControl,
            style: [
                {
                    selector: `.${elementId} .gutenverse-input-submit-loader`,
                    render: value => handleColor(value, 'color')
                }
            ]
        },
    ];
};