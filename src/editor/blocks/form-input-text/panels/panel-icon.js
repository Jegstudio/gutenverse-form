import { __ } from '@wordpress/i18n';
import { getDeviceType } from 'gutenverse-core/editor-helper';
import { CheckboxControl, ImageControl, RangeControl, SelectControl, TextControl } from 'gutenverse-core/controls';

export const panelIcon = (props) => {
    const {
        elementId,
        iconType,
        removeStyle,
        iconSize,
        imageWidth,
        imageHeight,
        useIcon,
        iconAlignment
    } = props;
    const deviceType = getDeviceType();

    return [
        {
            id: 'useIcon',
            label: __('Show Icon', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'iconAlignment',
            label: __('Icon Alignment', 'gutenverse-form'),
            component: SelectControl,
            show: useIcon,
            options: [
                {
                    value: 'left',
                    label: 'Left'
                },
                {
                    value: 'center',
                    label: 'Center'
                },
                {
                    value: 'right',
                    label: 'Right'
                },
            ],
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-text-icon`,
                    render: (value) => `justify-content: ${value};`
                },
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper > .gutenverse-input-text`,
                    allowRender: value => value === 'right' || value === 'center',
                    render: () => 'padding: 8px !important'
                }
            ]
        },
        {
            id: 'iconType',
            label: __('Icon Type', 'gutenverse-form'),
            component: SelectControl,
            show: useIcon,
            options: [
                {
                    value: 'none',
                    label: 'None'
                },
                {
                    value: 'icon',
                    label: 'Icon'
                },
                {
                    value: 'image',
                    label: 'Image'
                },
            ],
            onChange: ({ iconShape }) => {
                if ('icon' !== iconShape) {
                    removeStyle('iconSize-style-0');
                }

                if ('image' !== iconShape) {
                    removeStyle('imageWidth-style-0');
                    removeStyle('imageHeight-style-0');
                }
            },
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon i`,
                    allowRender: value => value === 'icon',
                    render: () => `font-size: ${iconSize[deviceType]}px;`
                },
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon`,
                    allowRender: value => value === 'image',
                    render: () => {
                        return `width: ${imageWidth[deviceType]}px;`;
                    }
                },
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon`,
                    allowRender: value => value === 'image',
                    render: () => `height: ${imageHeight[deviceType]}px;`
                }
            ]
        },
        {
            id: 'iconSize',
            show: iconType && iconType === 'icon' && useIcon,
            label: __('Icon Size', 'gutenverse-form'),
            component: RangeControl,
            allowDeviceControl: true,
            min: 1,
            max: 200,
            step: 1,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon i`,
                    allowRender: () => iconType && iconType === 'icon',
                    render: value => `font-size: ${value}px;`
                },
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .gutenverse-input-text`,
                    allowRender: () => iconAlignment === 'left',
                    render: (value) => `padding-left: ${value + 15}px !important;`
                }
            ]
        },
        {
            id: 'image',
            show: iconType && iconType === 'image' && useIcon,
            label: __('Icon Type', 'gutenverse-form'),
            component: ImageControl,
        },
        {
            id: 'lazyLoad',
            show: iconType && iconType === 'image' && useIcon,
            label: __('Set Lazy Load', 'gutenverse-form'),
            component: CheckboxControl,
        },
        {
            id: 'imageAlt',
            show: iconType && iconType === 'image' && useIcon,
            label: __('Image Alt', 'gutenverse-form'),
            component: TextControl,
        },
        {
            id: 'imageWidth',
            show: iconType && iconType === 'image' && useIcon,
            label: __('Image Width', 'gutenverse-form'),
            component: RangeControl,
            allowDeviceControl: true,
            min: 1,
            max: 400,
            step: 1,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon`,
                    allowRender: () => iconType && iconType === 'image',
                    render: value => `width: ${value}px;`
                },
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .gutenverse-input-text`,
                    allowRender: () => iconType && iconType === 'image' && iconAlignment === 'left',
                    render: value => `padding-left: ${20 + value}px !important;`
                }
            ]
        },
        {
            id: 'imageHeight',
            show: iconType && iconType === 'image' && useIcon,
            label: __('Image Height', 'gutenverse-form'),
            component: RangeControl,
            allowDeviceControl: true,
            min: 1,
            max: 400,
            step: 1,
            style: [
                {
                    selector: `.${elementId} .main-wrapper .input-icon-wrapper .form-input-text-icon .icon`,
                    allowRender: () => iconType && iconType === 'image',
                    render: value => `height: ${value}px;`
                }
            ]
        },
    ];
};

