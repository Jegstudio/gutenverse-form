import { __ } from '@wordpress/i18n';

export default {
    apiVersion: 2,
    category: 'gutenverse-form',
    attributes: {
        elementId: {
            type: 'string'
        },
        // Global
        showLabel: {
            type: 'boolean',
            default: true
        },
        inputLabel: {
            type: 'string',
            default: __('Text', 'gutenverse-form'),
        },
        inputPlaceholder: {
            type: 'string',
            default: __('Text Placeholder', 'gutenverse-form'),
        },
        inputName: {
            type: 'string',
            default: __('input-text-name', 'gutenverse-form'),
        },
        showHelper: {
            type: 'boolean',
            default: true
        },
        inputHelper: {
            type: 'string',
            default: __('Input Helper', 'gutenverse-form'),
        },
        position: {
            type: 'string',
            default: 'top',
        },

        // Label
        labelWidth: {
            type: 'object',
        },
        labelColor: {
            type: 'object',
        },
        labelTypography: {
            type: 'object',
        },
        labelPadding: {
            type: 'object',
        },
        labelMargin: {
            type: 'object',
        },
        labelRequireColor: {
            type: 'object',
        },


        // helper
        helperColor: {
            type: 'object',
        },
        helperTypography: {
            type: 'object',
        },
        helperPadding: {
            type: 'object',
        },
        warningColor: {
            type: 'object',
        },
        warningTypography: {
            type: 'object',
        },

        background: {
            type: 'object',
            default: {}
        },
        backgroundHover: {
            type: 'object',
            default: {}
        },
        border: {
            type: 'object',
            default: {}
        },
        boxShadow: {
            type: 'object',
            default: {
                position: 'outline'
            },
        },
        borderHover: {
            type: 'object',
            default: {}
        },
        boxShadowHover: {
            type: 'object',
            default: {
                position: 'outline'
            },
        },
        margin: {
            type: 'object',
        },
        padding: {
            type: 'object',
        },
        zIndex: {
            type: 'object',
        },
        animation: {
            type: 'object',
            default: {}
        },
        hideDesktop: {
            type: 'boolean'
        },
        hideTablet: {
            type: 'boolean'
        },
        hideMobile: {
            type: 'boolean'
        },
    },
    supports: {
        className: false,
    },
    keywords: [
        __('input', 'gutenverse-form'),
        __('form', 'gutenverse-form'),
    ],
    example: {
    }
};