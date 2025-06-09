import { isNotEmpty } from 'gutenverse-core/helper';
import { applyFilters } from '@wordpress/hooks';
import { backgroundStyle } from 'gutenverse-core/controls';

const getBlockStyle = (elementId, attributes) => {
    let data = [];
    data = backgroundStyle({ attributes, data, elementId });

    /** Panel Dropdown */
    isNotEmpty(attributes['dropDownIconOpenColor']) && data.push({
        'type': 'color',
        'id': 'dropDownIconOpenColor',
        'selector': `.${elementId} .choices.custom-dropdown .choices__inner i`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
    });

    isNotEmpty(attributes['dropDownIconOpenSize']) && data.push({
        'type': 'plain',
        'id': 'dropDownIconOpenSize',
        'selector': `.${elementId} .choices.custom-dropdown .choices__inner i`,
        'properties': [
            {
                'name': 'font-size',
                'valueType': 'pattern',
                'pattern': '{value}px',
                'patternValues': {
                    'value': {
                        'type': 'direct',
                    },

                }
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['dropDownIconCloseColor']) && data.push({
        'type': 'color',
        'id': 'dropDownIconCloseColor',
        'selector': `.${elementId} .choices.custom-dropdown.is-open .choices__inner i`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
    });

    isNotEmpty(attributes['dropDownIconCloseSize']) && data.push({
        'type': 'plain',
        'id': 'dropDownIconCloseSize',
        'selector': `.${elementId} .choices.custom-dropdown.is-open .choices__inner i`,
        'properties': [
            {
                'name': 'font-size',
                'valueType': 'pattern',
                'pattern': '{value}px',
                'patternValues': {
                    'value': {
                        'type': 'direct',
                    },

                }
            }
        ],
        'responsive': true,
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
        'selector': `.${elementId} .main-wrapper .choices__inner`,
        'responsive': true,
    });

    data.push({
        'type': 'plain',
        'id': 'excludePlaceholder',
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.choices__placeholder`,
        'properties': [
            {
                'name': 'display',
                'valueType': 'function',
                'functionName': 'handleSimpleCondition',
                'functionProps' : {
                    'valueTrue' : 'none',
                    'valueFalse' : 'block'
                }
            }
        ],
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
        'selector': `.${elementId} .main-wrapper .choices__inner`,
        'responsive': true,
    });

    isNotEmpty(attributes['placeholderColor']) && data.push({
        'type': 'color',
        'id': 'placeholderColor',
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.choices__placeholder, .${elementId} .main-wrapper .choices__inner .choices__placeholder:not(.choices__item--choice)`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['placeholderBgColor']) && data.push({
        'type': 'color',
        'id': 'placeholderBgColor',
        'selector': `.${elementId} .choices__inner`,
        'properties': [
            {
                'name': 'background-color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['inputTypography']) && data.push({
        'type': 'typography',
        'id': 'inputTypography',
        'selector': `.${elementId} .choices__placeholder, .${elementId} .choices__item, .${elementId} .choices__input`,
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
        'selector': `.${elementId} .choices .choices__inner .choices__list .choices__item.choices__item--selectable:not(.choices__placeholder)`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['choicesBgColorNormal']) && data.push({
        'type': 'color',
        'id': 'choicesBgColorNormal',
        'selector': `.${elementId} .choices .choices__list.choices__list--dropdown .choices__item`,
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
        'selector': `.${elementId} .choices .choices__inner`,
    });

    isNotEmpty(attributes['inputBorderNormalResponsive']) && data.push({
        'type': 'borderResponsive',
        'id': 'inputBorderNormal',
        'selector': `.${elementId} .choices .choices__inner`,
        'responsive': true,
    });


    isNotEmpty(attributes['inputColorHover']) && data.push({
        'type': 'color',
        'id': 'inputColorHover',
        'selector': `.${elementId}:hover .choices .choices__inner .choices__list .choices__item.choices__item--selectable:not(.choices__placeholder)`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['choicesBgColorHover']) && data.push({
        'type': 'color',
        'id': 'choicesBgColorHover',
        'selector': `.${elementId} .choices .choices__list.choices__list--dropdown .choices__item.is-highlighted`,
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
        'selector': `.${elementId} .choices .choices__inner:hover`,
    });

    isNotEmpty(attributes['inputBorderNormalResponsive']) && data.push({
        'type': 'borderResponsive',
        'id': 'inputBorderNormal',
        'selector': `.${elementId} .choices .choices__inner:hover`,
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
        'selector': `.${elementId} .choices .choices__inner`,
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
        'selector': `.${elementId} .choices .choices__inner:hover`,
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

    /* Panel Opition Style */
    isNotEmpty(attributes['choicesPadding']) && data.push({
        'type': 'dimension',
        'id': 'choicesPadding',
        'properties': [
            {
                'name': 'padding',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable`,
        'responsive': true,
    });

    isNotEmpty(attributes['choicesMargin']) && data.push({
        'type': 'dimension',
        'id': 'choicesMargin',
        'properties': [
            {
                'name': 'margin',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable`,
        'responsive': true,
    });

    isNotEmpty(attributes['choicesTypography']) && data.push({
        'type': 'typography',
        'id': 'choicesTypography',
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable`,
        'properties': [
            {
                'name': 'typography',
                'valueType': 'direct'
            }
        ],
    });

    isNotEmpty(attributes['choicesColorNormal']) && data.push({
        'type': 'color',
        'id': 'choicesColorNormal',
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['choicesBackgroundNormal']) && data.push({
        'id': 'choicesBackgroundNormal',
        'type': 'background',
        'responsive': true,
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable`,
    });

    isNotEmpty(attributes['choicesBorderNormal']) && data.push({
        'type': 'borderResponsive',
        'id': 'choicesBorderNormal',
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable`,
        'responsive': true,
    });

    isNotEmpty(attributes['choicesColorHover']) && data.push({
        'type': 'color',
        'id': 'choicesColorHover',
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-highlighted`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['choicesBackgroundHover']) && data.push({
        'id': 'choicesBackgroundHover',
        'type': 'background',
        'responsive': true,
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-highlighted`,
    });

    isNotEmpty(attributes['choicesBorderHover']) && data.push({
        'type': 'borderResponsive',
        'id': 'choicesBorderHover',
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-highlighted`,
        'responsive': true,
    });

    isNotEmpty(attributes['choicesColorSelected']) && data.push({
        'type': 'color',
        'id': 'choicesColorSelected',
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-selected`,
        'properties': [
            {
                'name': 'color',
                'valueType': 'direct'
            }
        ],
        'responsive': true,
    });

    isNotEmpty(attributes['choicesBackgroundSelected']) && data.push({
        'id': 'choicesBackgroundSelected',
        'type': 'background',
        'responsive': true,
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-selected`,
    });

    isNotEmpty(attributes['choicesBorderSelected']) && data.push({
        'type': 'borderResponsive',
        'id': 'choicesBorderSelected',
        'selector': `.${elementId} .main-wrapper .choices__list.choices__list--dropdown .choices__item.choices__item--selectable.is-selected`,
        'responsive': true,
    });

    /* Panel Opition Wrapper Style */
    isNotEmpty(attributes['choicesWrapperPadding']) && data.push({
        'type': 'dimension',
        'id': 'choicesWrapperPadding',
        'properties': [
            {
                'name': 'padding',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .choices .choices__list.choices__list--dropdown`,
        'responsive': true,
    });

    isNotEmpty(attributes['choicesWrapperMargin']) && data.push({
        'type': 'dimension',
        'id': 'choicesWrapperMargin',
        'properties': [
            {
                'name': 'margin',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .choices .choices__list.choices__list--dropdown`,
        'responsive': true,
    });

    isNotEmpty(attributes['choicesWrapperBackgroundNormal']) && data.push({
        'id': 'choicesWrapperBackgroundNormal',
        'type': 'background',
        'responsive': true,
        'selector': `.${elementId} .choices .choices__list.choices__list--dropdown`,
    });

    isNotEmpty(attributes['choicesWrapperBorderNormal']) && data.push({
        'type': 'borderResponsive',
        'id': 'choicesWrapperBorderNormal',
        'selector': `.${elementId} .choices .choices__list.choices__list--dropdown`,
        'responsive': true,
    });

    isNotEmpty(attributes['choicesWrapperShadowNormal']) && data.push({
        'type': 'boxShadow',
        'id': 'choicesWrapperShadowNormal',
        'properties': [
            {
                'name': 'box-shadow',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .choices .choices__list.choices__list--dropdown`,
    });

    isNotEmpty(attributes['choicesWrapperBackgroundHover']) && data.push({
        'id': 'choicesWrapperBackgroundHover',
        'type': 'background',
        'responsive': true,
        'selector': `.${elementId} .choices .choices__list.choices__list--dropdown:hover`,
    });

    isNotEmpty(attributes['choicesWrapperBorderHover']) && data.push({
        'type': 'borderResponsive',
        'id': 'choicesWrapperBorderHover',
        'selector': `.${elementId} .choices .choices__list.choices__list--dropdown:hover`,
        'responsive': true,
    });

    isNotEmpty(attributes['choicesWrapperShadowHover']) && data.push({
        'type': 'boxShadow',
        'id': 'choicesWrapperShadowHover',
        'properties': [
            {
                'name': 'box-shadow',
                'valueType': 'direct'
            }
        ],
        'selector': `.${elementId} .choices .choices__list.choices__list--dropdown:hover`,
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
            'gutenverse.input-select.blockStyle',
            [],
            {
                elementId,
                attributes
            }
        )
    ];
};

export default getBlockStyle;