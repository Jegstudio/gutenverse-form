import { isNotEmpty } from 'gutenverse-core/helper';
import { applyFilters } from '@wordpress/hooks';
import { backgroundStyle } from 'gutenverse-core/controls';

const getBlockStyle = (elementId, attributes) => {
    let data = [];
    data = backgroundStyle({ attributes, data, elementId });

    isNotEmpty(attributes['labelSpace']) && data.push({
        'type': 'dimension',
        'id': 'labelSpace',
        'properties': [
            {
                'name': 'margin',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .gutenverse-inner-input label`,
    });

    isNotEmpty(attributes['radioSize']) && data.push({
        'type': 'plain',
        'id': 'radioSize',
        'properties': [
            {
                'name': 'font-size',
                'valueType': 'pattern',
                'pattern': '{value}px',
                'patternValues': {
                    'value': {
                        'type': 'direct'
                    }
                }
            }
        ],
        'selector': `.${elementId} .gutenverse-inner-input label .radio:before`,
    });

    isNotEmpty(attributes['radioSpace']) && data.push({
        'type': 'plain',
        'id': 'radioSpace',
        'properties': [
            {
                'name': 'margin-right',
                'valueType': 'pattern',
                'pattern': '{value}px',
                'patternValues': {
                    'value': {
                        'type': 'direct'
                    }
                }
            }
        ],
        'selector': `.${elementId} .gutenverse-inner-input label .radio:before`,
    });

    isNotEmpty(attributes['radioLabelColor']) && data.push({
        'type': 'color',
        'id': 'radioLabelColor',
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct',
            }
        ],
        'selector': `.${elementId} .gutenverse-inner-input label`,
    });

    isNotEmpty(attributes['radioTypography']) && data.push({
        'type': 'typography',
        'id': 'radioTypography',
        'selector': `.${elementId} .main-wrapper label .radio`,
    });

    isNotEmpty(attributes['radioColor']) && data.push({
        'type': 'color',
        'id': 'radioColor',
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct',
            }
        ],
        'selector': `.${elementId} .gutenverse-inner-input label .radio:before`,
    });

    isNotEmpty(attributes['radioActiveColor']) && data.push({
        'type': 'color',
        'id': 'radioActiveColor',
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct',
            }
        ],
        'selector': `.${elementId} .gutenverse-inner-input label input:checked + .radio:before`,
    });

    /* Label Panel */
    isNotEmpty(attributes['labelWidth']) && data.push({
        'type': 'plain',
        'id': 'labelWidth',
        'selector': `.${elementId} .label-wrapper`,
        'properties': [
            {
                'name': 'width',
                'valueType': 'pattern',
                'pattern': '{value}%',
                'patternValues': {
                    'value': {
                        'type': 'direct',
                    },

                }
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['labelColor']) && data.push({
        'type': 'color',
        'id': 'labelColor',
        'selector': `.${elementId} .label-wrapper .input-label`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['labelTypography']) && data.push({
        'type': 'typography',
        'id': 'labelTypography',
        'selector': `.${elementId} .label-wrapper .input-label`,
        'properties': [
            {
                'name': 'typography',
                'valueType': 'direct'
            }
        ],
    });

    isNotEmpty(attributes['labelPadding']) && data.push({
        'type': 'dimension',
        'id': 'labelPadding',
        'properties': [
            {
                'name': 'padding',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .label-wrapper`,
        'responsive': true,
    });

    isNotEmpty(attributes['labelMargin']) && data.push({
        'type': 'dimension',
        'id': 'labelMargin',
        'properties': [
            {
                'name': 'margin',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .label-wrapper`,
        'responsive': true,
    });

    isNotEmpty(attributes['labelRequireColor']) && data.push({
        'type': 'color',
        'id': 'labelRequireColor',
        'selector': `.${elementId} .label-wrapper .required-badge`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });
    /* Main Wrapper */
    isNotEmpty(attributes['helperColor']) && data.push({
        'type': 'color',
        'id': 'helperColor',
        'selector': `.${elementId} .input-helper`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['helperTypography']) && data.push({
        'type': 'typography',
        'id': 'helperTypography',
        'selector': `.${elementId} .input-helper`,
        'properties': [
            {
                'name': 'typography',
                'valueType': 'direct'
            }
        ],
    });

    isNotEmpty(attributes['helperPadding']) && data.push({
        'type': 'dimension',
        'id': 'helperPadding',
        'properties': [
            {
                'name': 'padding',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .input-helper`,
        'responsive': true,
    });

    isNotEmpty(attributes['warningColor']) && data.push({
        'type': 'color',
        'id': 'warningColor',
        'selector': `.${elementId} .validation-error`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['warningTypography']) && data.push({
        'type': 'typography',
        'id': 'warningTypography',
        'selector': `.${elementId} .validation-error`,
        'properties': [
            {
                'name': 'typography',
                'valueType': 'direct'
            }
        ],
    });
    /* Panel List */
    isNotEmpty(attributes['border']) && data.push({
        'type': 'border',
        'id': 'border',
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}.guten-element`,
    });

    isNotEmpty(attributes['borderHover']) && data.push({
        'type': 'border',
        'id': 'borderHover',
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}:hover`,
    });

    isNotEmpty(attributes['borderResponsive']) && data.push({
        'type': 'borderResponsive',
        'id': 'borderResponsive',
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}.guten-element`,
    });

    isNotEmpty(attributes['borderResponsiveHover']) && data.push({
        'type': 'borderResponsive',
        'id': 'borderResponsiveHover',
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}:hover`,
    });

    isNotEmpty(attributes['boxShadow']) && data.push({
        'type': 'boxShadow',
        'id': 'boxShadow',
        'properties': [
            {
                'name': 'box-shadow',
                'valueType': 'direct'
            }
        ],
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}.guten-element`,
    });

    isNotEmpty(attributes['boxShadowHover']) && data.push({
        'type': 'boxShadow',
        'id': 'boxShadowHover',
        'properties': [
            {
                'name': 'box-shadow',
                'valueType': 'direct'
            }
        ],
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}:hover`,
    });

    isNotEmpty(attributes['mask']) && data.push({
        'type': 'mask',
        'id': 'mask',
        'responsive': true,
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}.guten-element`,
    });

    isNotEmpty(attributes['padding']) && data.push({
        'type': 'dimension',
        'id': 'padding',
        'responsive': true,
        'properties': [
            {
                'name': 'padding',
                'valueType': 'direct'
            }
        ],
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}.guten-element`,
    });

    isNotEmpty(attributes['margin']) && data.push({
        'type': 'dimension',
        'id': 'margin',
        'responsive': true,
        'properties': [
            {
                'name': 'margin',
                'valueType': 'direct'
            }
        ],
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}.guten-element`,
    });

    isNotEmpty(attributes['zIndex']) && data.push({
        'type': 'plain',
        'id': 'zIndex',
        'responsive': true,
        'properties': [
            {
                'name': 'z-index',
                'valueType': 'direct'
            }
        ],
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}.guten-element`,
    });

    isNotEmpty(attributes['animation']) && isNotEmpty(attributes['animation']['delay']) && data.push({
        'type': 'plain',
        'id': 'animation',
        'properties': [
            {
                'name': 'animation-delay',
                'valueType': 'pattern',
                'pattern': '{value}ms',
                'patternValues': {
                    'value': {
                        'type': 'attribute',
                        'key': 'delay',
                    },

                }
            }
        ],
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}.guten-element`,
    });

    //Positioning Panel
    isNotEmpty(attributes['positioningType']) && data.push(
        {
            'type': 'positioning',
            'id': 'positioningType',
            'selector': `.${elementId}.guten-element`,
            'skipDeviceType': 'first',
            'attributeType': 'type',
            'multiAttr': {
                'positioningType': attributes['positioningType'],
                'inBlock': attributes['inBlock']
            }
        },
    );

    isNotEmpty(attributes['positioningType']) && isNotEmpty(attributes['positioningWidth']) && data.push(
        {
            'type': 'positioning',
            'id': 'positioningType',
            'selector': `.${elementId}.guten-element`,
            'skipDeviceType': 'second',
            'attributeType': 'type',
            'multiAttr': {
                'positioningWidth': attributes['positioningWidth'],
                'positioningType': attributes['positioningType'],
                'inBlock': attributes['inBlock']
            }
        }
    );

    isNotEmpty(attributes['positioningWidth']) && isNotEmpty(attributes['positioningType']) && data.push({
        'type': 'positioning',
        'id': 'positioningWidth',
        'selector': `.${elementId}.guten-element`,
        'skipDeviceType': 'first',
        'attributeType': 'width',
        'multiAttr': {
            'positioningWidth': attributes['positioningWidth'],
            'positioningType': attributes['positioningType'],
            'inBlock': attributes['inBlock']
        }
    });

    isNotEmpty(attributes['positioningAlign']) && data.push(
        {
            'type': 'plain',
            'id': 'positioningAlign',
            'responsive': true,
            'properties': [
                {
                    'name': 'align-self',
                    'valueType': 'direct'
                }
            ],
            'selector': `.${elementId}.guten-element`,
        },
        {
            'type': 'positioning',
            'id': 'positioningAlign',
            'properties': [
                {
                    'name': 'vertical-align',
                    'valueType': 'direct'
                }
            ],
            'attributeType': 'align',
            'selector': `.${elementId}.guten-element`,
        }
    );

    isNotEmpty(attributes['positioningLocation']) && attributes['positioningLocation'] !== 'default' && data.push({
        'type': 'plain',
        'id': 'positioningLocation',
        'properties': [
            {
                'name': 'position',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId}.guten-element`,
    });

    isNotEmpty(attributes['positioningLeft']) && isNotEmpty(attributes['positioningLocation']) && attributes['positioningLocation'] !== 'default' && data.push({
        'type': 'positioning',
        'id': 'positioningLeft',
        'properties': [
            {
                'name': 'left',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
        'selector': `.${elementId}.guten-element`,
        'attributeType': 'custom',
    });

    isNotEmpty(attributes['positioningRight']) && isNotEmpty(attributes['positioningLocation']) && attributes['positioningLocation'] !== 'default' && data.push({
        'type': 'positioning',
        'id': 'positioningRight',
        'properties': [
            {
                'name': 'right',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
        'selector': `.${elementId}.guten-element`,
        'attributeType': 'custom',
    });

    isNotEmpty(attributes['positioningTop']) && isNotEmpty(attributes['positioningLocation']) && attributes['positioningLocation'] !== 'default' && data.push({
        'type': 'positioning',
        'id': 'positioningTop',
        'properties': [
            {
                'name': 'top',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
        'selector': `.${elementId}.guten-element`,
        'attributeType': 'custom',
    });

    isNotEmpty(attributes['positioningBottom']) && isNotEmpty(attributes['positioningLocation']) && attributes['positioningLocation'] !== 'default' && data.push({
        'type': 'positioning',
        'id': 'positioningBottom',
        'properties': [
            {
                'name': 'bottom',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
        'selector': `.${elementId}.guten-element`,
        'attributeType': 'custom',
    });

    return [
        ...data,
        ...applyFilters(
            'gutenverse.input-radio.blockStyle',
            [],
            {
                elementId,
                attributes
            }
        )
    ];
};

export default getBlockStyle;