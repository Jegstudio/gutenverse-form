import { isNotEmpty } from 'gutenverse-core/helper';
import { applyFilters } from '@wordpress/hooks';
import { backgroundStyle } from 'gutenverse-core/controls';

const getBlockStyle = (elementId, attributes) => {
    let data = [];
    data = backgroundStyle({ attributes, data, elementId });

    /* Panel Icon Style */
    isNotEmpty(attributes['iconSize']) && data.push({
        'type': 'plain',
        'id': 'iconSize',
        'responsive': true,
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-telp-icon .icon i`,
        'properties': [
            {
                'name': 'font-size',
                'valueType': 'pattern',
                'pattern': '{value}px',
                'patternValues': {
                    'value': {
                        'type': 'direct',
                    }
                }
            }
        ],
    });

    isNotEmpty(attributes['imageWidth']) && attributes['iconType'] === 'image' && data.push({
        'type': 'plain',
        'id': 'imageWidth',
        'responsive': true,
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-telp-icon .icon`,
        'properties': [
            {
                'name': 'width',
                'valueType': 'pattern',
                'pattern': '{value}px',
                'patternValues': {
                    'value': {
                        'type': 'direct',
                    }
                }
            }
        ],
    });

    isNotEmpty(attributes['imageHeight']) && attributes['iconType'] === 'image' && data.push({
        'type': 'plain',
        'id': 'imageHeight',
        'responsive': true,
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-telp-icon .icon`,
        'properties': [
            {
                'name': 'height',
                'valueType': 'pattern',
                'pattern': '{value}px',
                'patternValues': {
                    'value': {
                        'type': 'direct',
                    }
                }
            }
        ],
    });

    isNotEmpty(attributes['iconAlignment']) && data.push({
        'type': 'plain',
        'id': 'iconAlignment',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper`,
        'properties': [
            {
                'name': 'flex-direction',
                'valueType': 'pattern',
                'pattern': attributes['iconAlignment'] === 'right' ? 'row-reverse' : 'row',
            }
        ],
    });
    isNotEmpty(attributes['iconPadding']) && data.push({
        'type': 'dimension',
        'id': 'iconPadding',
        'properties': [
            {
                'name': 'padding',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-telp-icon .icon`,
        'responsive': true,
    });

    isNotEmpty(attributes['iconMargin']) && data.push({
        'type': 'dimension',
        'id': 'iconMargin',
        'properties': [
            {
                'name': 'margin',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-telp-icon .icon`,
        'responsive': true,
    });

    isNotEmpty(attributes['iconRotate']) && data.push({
        'type': 'plain',
        'id': 'iconRotate',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-telp-icon .icon`,
        'properties': [
            {
                'name': 'transform',
                'valueType': 'pattern',
                'pattern': 'rotate({value}deg)',
                'patternValues': {
                    'value': {
                        'type': 'direct',
                    },

                }
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['iconColor']) && data.push({
        'type': 'color',
        'id': 'iconColor',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-telp-icon .icon i`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
    });

    isNotEmpty(attributes['iconBgColor']) && data.push({
        'type': 'color',
        'id': 'iconBgColor',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-telp-icon .icon`,
        'properties': [
            {
                'name': 'background-color',
                'valueType': 'direct'
            }
        ],
    });

    isNotEmpty(attributes['iconColorGradient']) && data.push({
        'type': 'plain',
        'id': 'iconColorGradient',
        'properties': [
            {
                'name': 'background-image',
                'valueType': 'function',
                'functionName' : 'customHandleBackground'
            }
        ],
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-telp-icon .icon.style-gradient i`,
    });

    isNotEmpty(attributes['iconBackground']) && data.push({
        'type': 'background',
        'id': 'iconBackground',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-telp-icon .icon.style-gradient`,
    });

    isNotEmpty(attributes['iconBorder']) && data.push({
        'type': 'borderResponsive',
        'id': 'iconBorder',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-telp-icon .icon`,
        'responsive': true,
    });

    isNotEmpty(attributes['iconBoxShadow']) && data.push({
        'type': 'boxShadow',
        'id': 'iconBoxShadow',
        'properties': [
            {
                'name': 'box-shadow',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper .form-input-telp-icon .icon`,
    });

    isNotEmpty(attributes['iconHoverColor']) && data.push({
        'type': 'color',
        'id': 'iconHoverColor',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-telp-icon .icon i`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
    });

    isNotEmpty(attributes['iconHoverBgColor']) && data.push({
        'type': 'color',
        'id': 'iconHoverBgColor',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-telp-icon .icon`,
        'properties': [
            {
                'name': 'background-color',
                'valueType': 'direct'
            }
        ],
    });

    isNotEmpty(attributes['iconColorGradientHover']) && data.push({
        'type': 'plain',
        'id': 'iconColorGradientHover',
        'properties': [
            {
                'name': 'background-image',
                'valueType': 'function',
                'functionName' : 'customHandleBackground'
            }
        ],
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-telp-icon .icon.style-gradient i`,
    });

    isNotEmpty(attributes['iconBackgroundHover']) && data.push({
        'type': 'background',
        'id': 'iconBackgroundHover',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-telp-icon .icon.style-gradient`,
    });

    isNotEmpty(attributes['iconBorderHover']) && data.push({
        'type': 'borderResponsive',
        'id': 'iconBorderHover',
        'selector': `${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-telp-icon .icon`,
    });

    isNotEmpty(attributes['iconBoxShadowHover']) && data.push({
        'type': 'boxShadow',
        'id': 'iconBoxShadowHover',
        'properties': [
            {
                'name': 'box-shadow',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper:hover .form-input-telp-icon .icon`,
    });

    isNotEmpty(attributes['iconFocusColor']) && data.push({
        'type': 'color',
        'id': 'iconFocusColor',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-telp-icon .icon i`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['iconFocusBgColor']) && data.push({
        'type': 'color',
        'id': 'iconFocusBgColor',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-telp-icon .icon`,
        'properties': [
            {
                'name': 'background-color',
                'valueType': 'direct'
            }
        ],
    });

    isNotEmpty(attributes['iconColorGradientFocus']) && data.push({
        'type': 'plain',
        'id': 'iconColorGradientFocus',
        'properties': [
            {
                'name': 'background-image',
                'valueType': 'function',
                'functionName' : 'customHandleBackground'
            }
        ],
        'selector': `${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-telp-icon .icon.style-gradient i`,
    });

    isNotEmpty(attributes['iconBackgroundFocus']) && data.push({
        'type': 'background',
        'id': 'iconBackgroundFocus',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-telp-icon .icon.style-gradient`,
    });

    isNotEmpty(attributes['iconBorderFocus']) && data.push({
        'type': 'borderResponsive',
        'id': 'iconBorderFocus',
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-telp-icon .icon`,
    });

    isNotEmpty(attributes['iconBoxShadowFocus']) && data.push({
        'type': 'boxShadow',
        'id': 'iconBoxShadowFocus',
        'properties': [
            {
                'name': 'box-shadow',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-telp-icon .icon`,
    });

    /* Panel Input */
    isNotEmpty(attributes['inputPadding']) && data.push({
        'type': 'dimension',
        'id': 'inputPadding',
        'properties': [
            {
                'name': 'padding',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .gutenverse-input, .${elementId} .main-wrapper .input-icon-wrapper`,
        'responsive': true,
    });

    isNotEmpty(attributes['inputMargin']) && data.push({
        'type': 'dimension',
        'id': 'inputMargin',
        'properties': [
            {
                'name': 'margin',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .gutenverse-input, .${elementId} .main-wrapper .input-icon-wrapper`,
        'responsive': true,
    });

    isNotEmpty(attributes['placeholderColor']) && data.push({
        'type': 'color',
        'id': 'placeholderColor',
        'selector': `.${elementId} .gutenverse-input::placeholder, .${elementId} .main-wrapper .input-icon-wrapper::placeholder`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['inputTypography']) && data.push({
        'type': 'typography',
        'id': 'inputTypography',
        'selector': `.${elementId} .gutenverse-input`,
        'properties': [
            {
                'name': 'typography',
                'valueType': 'direct'
            }
        ],
    });

    isNotEmpty(attributes['inputColorNormal']) && data.push({
        'type': 'color',
        'id': 'inputColorNormal',
        'selector': `.${elementId} .gutenverse-input`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['inputBgColorNormal']) && data.push({
        'type': 'color',
        'id': 'inputBgColorNormal',
        'selector': `.${elementId} .gutenverse-input, .${elementId} .main-wrapper .input-icon-wrapper`,
        'properties': [
            {
                'name': 'background-color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['inputBorderNormal']) && data.push({
        'type': 'border',
        'id': 'inputBorderNormal',
        'selector': `.${elementId} .gutenverse-input, .${elementId} .main-wrapper .input-icon-wrapper`,
    });

    isNotEmpty(attributes['inputBorderNormalResponsive']) && data.push({
        'type': 'borderResponsive',
        'id': 'inputBorderNormalResponsive',
        'selector': `.${elementId} .gutenverse-input, .${elementId} .main-wrapper .input-icon-wrapper`,
        'responsive': true,
    });

    isNotEmpty(attributes['inputColorHover']) && data.push({
        'type': 'color',
        'id': 'inputColorHover',
        'selector': `.${elementId} .gutenverse-input:hover, .${elementId} .main-wrapper .input-icon-wrapper:hover .gutenverse-input`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['inputBgColorHover']) && data.push({
        'type': 'color',
        'id': 'inputBgColorHover',
        'selector': `.${elementId} .gutenverse-input:hover, .${elementId} .main-wrapper .input-icon-wrapper:hover .gutenverse-input`,
        'properties': [
            {
                'name': 'background-color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['inputBorderHover']) && data.push({
        'type': 'border',
        'id': 'inputBorderHover',
        'selector': `.${elementId} .gutenverse-input:hover, .${elementId} .main-wrapper .input-icon-wrapper:hover`,
    });

    isNotEmpty(attributes['inputBorderHoverResponsive']) && data.push({
        'type': 'borderResponsive',
        'id': 'inputBorderHoverResponsive',
        'selector': `.${elementId} .gutenverse-input:hover, .${elementId} .main-wrapper .input-icon-wrapper:hover`,
        'responsive': true,
    });

    isNotEmpty(attributes['inputColorFocus']) && data.push({
        'type': 'color',
        'id': 'inputColorFocus',
        'selector': `.${elementId} .gutenverse-input:focus, .${elementId} .gutenverse-input:focus-visible, .${elementId} .main-wrapper .input-icon-wrapper:focus-within .form-input-text-icon .icon`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['inputBgColorFocus']) && data.push({
        'type': 'color',
        'id': 'inputBgColorFocus',
        'selector': `.${elementId} .gutenverse-input:focus, .${elementId} .gutenverse-input:focus-visible, .${elementId} .main-wrapper .input-icon-wrapper:focus-within`,
        'properties': [
            {
                'name': 'background-color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['inputBorderFocus']) && data.push({
        'type': 'border',
        'id': 'inputBorderFocus',
        'selector': `.${elementId} .gutenverse-input:focus, .${elementId} .gutenverse-input:focus-visible, .${elementId} .main-wrapper .input-icon-wrapper:focus-within`,
    });

    isNotEmpty(attributes['inputBorderFocusResponsive']) && data.push({
        'type': 'borderResponsive',
        'id': 'inputBorderFocusResponsive',
        'selector': `.${elementId} .gutenverse-input:focus, .${elementId} .gutenverse-input:focus-visible, .${elementId} .main-wrapper .input-icon-wrapper:focus-within`,
        'responsive': true,
    });

    isNotEmpty(attributes['inputAreaBoxShadow']) && data.push({
        'type': 'boxShadow',
        'id': 'inputAreaBoxShadow',
        'properties': [
            {
                'name': 'box-shadow',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .gutenverse-input, .${elementId} .main-wrapper .input-icon-wrapper`,
    });

    isNotEmpty(attributes['inputAreaBoxShadowHover']) && data.push({
        'type': 'boxShadow',
        'id': 'inputAreaBoxShadowHover',
        'properties': [
            {
                'name': 'box-shadow',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .gutenverse-input:hover, .${elementId} .main-wrapper .input-icon-wrapper:hover .gutenverse-input`,
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
            'gutenverse.input-telp.blockStyle',
            [],
            {
                elementId,
                attributes
            }
        )
    ];
};

export default getBlockStyle;