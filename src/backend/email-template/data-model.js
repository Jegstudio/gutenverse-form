export const EMAIL_TEMPLATE_DESIGN_SCHEMA = Object.freeze({
    builder: 'gutenverse-email-builder',
    source: 'grapesjs-mjml',
    version: 1,
});

export const DESIGN_FORMATS = Object.freeze({
    EMPTY: 'empty',
    INVALID: 'invalid',
    GUTENVERSE_MJML: 'gutenverse-mjml',
    LEGACY_UNLAYER: 'unlayer',
    UNKNOWN: 'unknown',
});

const decodeDesign = (rawDesign) => {
    if (!rawDesign) {
        return { format: DESIGN_FORMATS.EMPTY, design: null };
    }

    if (typeof rawDesign === 'object') {
        return { format: DESIGN_FORMATS.UNKNOWN, design: rawDesign };
    }

    try {
        return { format: DESIGN_FORMATS.UNKNOWN, design: JSON.parse(rawDesign) };
    } catch (error) {
        return { format: DESIGN_FORMATS.INVALID, design: null };
    }
};

export const createGutenverseEmailDesign = (project = {}) => ({
    builder: EMAIL_TEMPLATE_DESIGN_SCHEMA.builder,
    source: EMAIL_TEMPLATE_DESIGN_SCHEMA.source,
    schemaVersion: EMAIL_TEMPLATE_DESIGN_SCHEMA.version,
    project,
});

export const isGutenverseEmailDesign = (design) => {
    return !!design
        && typeof design === 'object'
        && design.builder === EMAIL_TEMPLATE_DESIGN_SCHEMA.builder
        && design.source === EMAIL_TEMPLATE_DESIGN_SCHEMA.source
        && Number(design.schemaVersion) === EMAIL_TEMPLATE_DESIGN_SCHEMA.version;
};

export const isLegacyUnlayerDesign = (design) => {
    if (!design || typeof design !== 'object' || isGutenverseEmailDesign(design)) {
        return false;
    }

    const body = design.body;

    return !!body
        && typeof body === 'object'
        && (
            Array.isArray(body.rows)
            || Array.isArray(body.headers)
            || Array.isArray(body.footers)
        );
};

export const parseEmailTemplateDesign = (rawDesign) => {
    const parsed = decodeDesign(rawDesign);

    if (parsed.format === DESIGN_FORMATS.EMPTY || parsed.format === DESIGN_FORMATS.INVALID) {
        return parsed;
    }

    if (isGutenverseEmailDesign(parsed.design)) {
        return { format: DESIGN_FORMATS.GUTENVERSE_MJML, design: parsed.design };
    }

    if (isLegacyUnlayerDesign(parsed.design)) {
        return { format: DESIGN_FORMATS.LEGACY_UNLAYER, design: parsed.design };
    }

    return parsed;
};
