import { isNotEmpty } from 'gutenverse-core/helper';

const getBlockStyle = (elementId, attributes) => {
    let data = [];

    /** Panel Error Notice */
    isNotEmpty(attributes['errorAlign']) && data.push({
        'type': 'plain',
        'id': 'errorAlign',
        'responsive' : true,
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
        'properties' : [
            {
                'name' : 'text-align',
                'valueType' : 'direct'
            }
        ]
    });

    isNotEmpty(attributes['errorBgColor']) && data.push({
        'type': 'color',
        'id': 'errorBgColor',
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
        'properties' : [
            {
                'name' : 'background-color',
                'valueType' : 'direct'
            }
        ]
    });

    isNotEmpty(attributes['errorTextColor']) && data.push({
        'type': 'color',
        'id': 'errorTextColor',
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
        'properties' : [
            {
                'name' : 'color',
                'valueType' : 'direct'
            }
        ]
    });

    isNotEmpty(attributes['errorTypography']) && data.push({
        'type': 'typography',
        'id': 'errorTypography',
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
    });

    isNotEmpty(attributes['errorPadding']) && data.push({
        'type': 'dimension',
        'id': 'errorPadding',
        'responsive': true,
        'properties': [
            {
                'name': 'padding',
                'valueType': 'direct'
            }
        ],
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
    });

    isNotEmpty(attributes['errorMargin']) && data.push({
        'type': 'dimension',
        'id': 'errorMargin',
        'responsive': true,
        'properties': [
            {
                'name': 'margin',
                'valueType': 'direct'
            }
        ],
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
    });

    isNotEmpty(attributes['errorBorder']) && data.push({
        'type': 'border',
        'id': 'errorBorder',
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
    });

    isNotEmpty(attributes['errorBorderResponsive']) && data.push({
        'type': 'borderResponsive',
        'id': 'errorBorderResponsive',
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
    });

    isNotEmpty(attributes['errorBoxShadow']) && data.push({
        'type': 'boxShadow',
        'id': 'errorBoxShadow',
        'properties': [
            {
                'name': 'box-shadow',
                'valueType': 'direct'
            }
        ],
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-error`,
    });

    /**Panel Success Notice */

    isNotEmpty(attributes['successAlign']) && data.push({
        'type': 'plain',
        'id': 'successAlign',
        'responsive' : true,
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
        'properties' : [
            {
                'name' : 'text-align',
                'valueType' : 'direct'
            }
        ]
    });

    isNotEmpty(attributes['successBgColor']) && data.push({
        'type': 'color',
        'id': 'successBgColor',
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
        'properties' : [
            {
                'name' : 'background-color',
                'valueType' : 'direct'
            }
        ]
    });

    isNotEmpty(attributes['successTextColor']) && data.push({
        'type': 'color',
        'id': 'successTextColor',
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
        'properties' : [
            {
                'name' : 'color',
                'valueType' : 'direct'
            }
        ]
    });

    isNotEmpty(attributes['successTypography']) && data.push({
        'type': 'typography',
        'id': 'successTypography',
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
    });

    isNotEmpty(attributes['successPadding']) && data.push({
        'type': 'dimension',
        'id': 'successPadding',
        'responsive': true,
        'properties': [
            {
                'name': 'padding',
                'valueType': 'direct'
            }
        ],
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
    });

    isNotEmpty(attributes['successMargin']) && data.push({
        'type': 'dimension',
        'id': 'successMargin',
        'responsive': true,
        'properties': [
            {
                'name': 'margin',
                'valueType': 'direct'
            }
        ],
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
    });

    isNotEmpty(attributes['successBorder']) && data.push({
        'type': 'border',
        'id': 'successBorder',
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
    });

    isNotEmpty(attributes['successBorderResponsive']) && data.push({
        'type': 'borderResponsive',
        'id': 'successBorderResponsive',
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
    });

    isNotEmpty(attributes['successBoxShadow']) && data.push({
        'type': 'boxShadow',
        'id': 'successBoxShadow',
        'properties': [
            {
                'name': 'box-shadow',
                'valueType': 'direct'
            }
        ],
        'selector': `.editor-styles-wrapper .${elementId} .form-notification .notification-body.guten-success`,
    });

    /* Panel List */
    isNotEmpty(attributes['background']) && data.push({
        'type': 'background',
        'id': 'background',
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}`,
    });

    isNotEmpty(attributes['backgroundHover']) && data.push({
        'type': 'background',
        'id': 'backgroundHover',
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}:hover`,
    });

    isNotEmpty(attributes['border']) && data.push({
        'type': 'border',
        'id': 'border',
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}`,
    });

    isNotEmpty(attributes['borderHover']) && data.push({
        'type': 'border',
        'id': 'borderHover',
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}:hover`,
    });

    isNotEmpty(attributes['borderResponsive']) && data.push({
        'type': 'borderResponsive',
        'id': 'borderResponsive',
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}`,
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
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}`,
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
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}`,
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
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}`,
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
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}`,
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
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}`,
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
        'selector': `.editor-styles-wrapper .is-root-container .${elementId}`,
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
            'property': ['vertical-align'],
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
        'property': ['left'],
        'responsive': true,
        'selector': `.${elementId}.guten-element`,
        'attributeType': 'custom',
    });
    isNotEmpty(attributes['positioningRight']) && isNotEmpty(attributes['positioningLocation']) && attributes['positioningLocation'] !== 'default' && data.push({
        'type': 'positioning',
        'id': 'positioningRight',
        'property': ['right'],
        'responsive': true,
        'selector': `.${elementId}.guten-element`,
        'attributeType': 'custom',
    });
    isNotEmpty(attributes['positioningTop']) && isNotEmpty(attributes['positioningLocation']) && attributes['positioningLocation'] !== 'default' && data.push({
        'type': 'positioning',
        'id': 'positioningTop',
        'property': ['top'],
        'responsive': true,
        'selector': `.${elementId}.guten-element`,
        'attributeType': 'custom',
    });
    isNotEmpty(attributes['positioningBottom']) && isNotEmpty(attributes['positioningLocation']) && attributes['positioningLocation'] !== 'default' && data.push({
        'type': 'positioning',
        'id': 'positioningBottom',
        'property': ['bottom'],
        'responsive': true,
        'selector': `.${elementId}.guten-element`,
        'attributeType': 'custom',
    });

    return data;
};

export default getBlockStyle;