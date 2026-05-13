import { __ } from '@wordpress/i18n';

export const EMAIL_BUILDER_CORE_BLOCKS = [
    'mj-1-column',
    'mj-2-columns',
    'mj-3-columns',
    'mj-text',
    'mj-button',
    'mj-image',
    'mj-divider',
    'mj-spacer',
];

const CATEGORIES = {
    layout: __('Layout', 'gutenverse-form'),
    content: __('Content', 'gutenverse-form'),
    dynamic: __('Dynamic', 'gutenverse-form'),
    advanced: __('Advanced', 'gutenverse-form'),
};

const createBlockIcon = content => `
<svg class="gutenverse-email-block-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="fill: none;" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  ${content}
</svg>
`;

const BLOCK_ICONS = {
    section: createBlockIcon('<rect x="4" y="5" width="16" height="14" rx="1.5" />'),
    twoColumns: createBlockIcon('<rect x="4" y="5" width="7" height="14" rx="1" /><rect x="13" y="5" width="7" height="14" rx="1" />'),
    threeColumns: createBlockIcon('<rect x="3.5" y="5" width="4.5" height="14" rx="1" /><rect x="9.75" y="5" width="4.5" height="14" rx="1" /><rect x="16" y="5" width="4.5" height="14" rx="1" />'),
    text: createBlockIcon('<path d="M5 6h14" /><path d="M12 6v12" /><path d="M9 18h6" />'),
    button: createBlockIcon('<rect x="5" y="7" width="14" height="10" rx="2" /><path d="M9 12h6" />'),
    image: createBlockIcon('<rect x="4" y="5" width="16" height="14" rx="1.5" /><circle cx="9" cy="10" r="1.4" /><path d="M6.5 17l4-4 2.7 2.6 2.2-2.1 2.7 3.5" />'),
    divider: createBlockIcon('<path d="M5 9h14" /><path d="M5 15h14" />'),
    spacer: createBlockIcon('<path d="M12 4v16" /><path d="M8 8l4-4 4 4" /><path d="M8 16l4 4 4-4" />'),
    table: createBlockIcon('<rect x="4" y="5" width="16" height="14" rx="1.5" /><path d="M4 10h16" /><path d="M4 15h16" /><path d="M10 5v14" />'),
    submissionTable: createBlockIcon('<rect x="4" y="5" width="16" height="14" rx="1.5" /><path d="M8 9h8" /><path d="M8 13h8" /><path d="M8 17h5" />'),
    placeholderTags: createBlockIcon('<path d="M8 7H6a3 3 0 0 0 0 6h2" /><path d="M16 7h2a3 3 0 0 1 0 6h-2" /><path d="M9.5 17h5" /><path d="M12 14v6" />'),
    code: createBlockIcon('<path d="M9 8l-4 4 4 4" /><path d="M15 8l4 4-4 4" /><path d="M13 6l-2 12" />'),
};

const CORE_BLOCK_OPTIONS = {
    'mj-1-column': {
        category: CATEGORIES.layout,
        label: __('Section', 'gutenverse-form'),
        media: BLOCK_ICONS.section,
    },
    'mj-2-columns': {
        category: CATEGORIES.layout,
        label: __('2 Columns', 'gutenverse-form'),
        media: BLOCK_ICONS.twoColumns,
    },
    'mj-3-columns': {
        category: CATEGORIES.layout,
        label: __('3 Columns', 'gutenverse-form'),
        media: BLOCK_ICONS.threeColumns,
    },
    'mj-text': {
        category: CATEGORIES.content,
        label: __('Text', 'gutenverse-form'),
        media: BLOCK_ICONS.text,
    },
    'mj-button': {
        category: CATEGORIES.content,
        label: __('Button', 'gutenverse-form'),
        media: BLOCK_ICONS.button,
    },
    'mj-image': {
        category: CATEGORIES.content,
        label: __('Image', 'gutenverse-form'),
        media: BLOCK_ICONS.image,
    },
    'mj-divider': {
        category: CATEGORIES.content,
        label: __('Divider', 'gutenverse-form'),
        media: BLOCK_ICONS.divider,
    },
    'mj-spacer': {
        category: CATEGORIES.content,
        label: __('Spacer', 'gutenverse-form'),
        media: BLOCK_ICONS.spacer,
    },
};

const COMMON_PLACEHOLDERS = [
    {
        key: 'entry_title',
        name: __('Entry Title', 'gutenverse-form'),
        value: '{{entry_title}}',
    },
    {
        key: 'form_title',
        name: __('Form Title', 'gutenverse-form'),
        value: '{{form_title}}',
    },
    {
        key: 'site_title',
        name: __('Site Title', 'gutenverse-form'),
        value: '{{site_title}}',
    },
    {
        key: 'entry_id',
        name: __('Entry ID', 'gutenverse-form'),
        value: '{{entry_id}}',
    },
    {
        key: 'form_id',
        name: __('Form ID', 'gutenverse-form'),
        value: '{{form_id}}',
    },
];

const COMMON_PLACEHOLDER_KEYS = COMMON_PLACEHOLDERS.map(({ key }) => key);

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;',
}[character]));

const normalizePlaceholderName = (name = '') => String(name)
    .replace(/^Field:\s*/i, '')
    .replace(/^Tag:\s*/i, '')
    .trim();

export const normalizeEmailBuilderPlaceholders = (placeholders = {}) => {
    const placeholderMap = new Map();

    COMMON_PLACEHOLDERS.forEach((placeholder) => {
        placeholderMap.set(placeholder.value, placeholder);
    });

    Object.entries(placeholders || {}).forEach(([key, placeholder]) => {
        const name = normalizePlaceholderName(placeholder?.name || key);
        const value = placeholder?.value || `{{${key}}}`;

        if (!value) {
            return;
        }

        placeholderMap.set(value, {
            key,
            name: name || key,
            value,
        });
    });

    return Array.from(placeholderMap.values());
};

const getSubmissionPlaceholders = (placeholders = {}) => {
    const normalized = normalizeEmailBuilderPlaceholders(placeholders);
    const dynamicPlaceholders = normalized.filter(({ key }) => !COMMON_PLACEHOLDER_KEYS.includes(key));

    return (dynamicPlaceholders.length ? dynamicPlaceholders : normalized).slice(0, 12);
};

const tableCellStyle = [
    'border:1px solid #dcdcde',
    'padding:10px 12px',
    'vertical-align:top',
].join(';');

const tableLabelStyle = [
    tableCellStyle,
    'background-color:#f6f7f7',
    'font-weight:600',
    'color:#1d2327',
].join(';');

const tableValueStyle = [
    tableCellStyle,
    'background-color:#ffffff',
    'color:#1d2327',
].join(';');

const createTable = (rows, options = {}) => {
    const headerCells = options.headers ? `
      <tr>
        ${options.headers.map(header => `<th align="left" style="${tableLabelStyle}">${escapeHtml(header)}</th>`).join('')}
      </tr>
    ` : '';

    const bodyRows = rows.map(row => `
      <tr>
        <td width="38%" style="${tableLabelStyle}">${escapeHtml(row.label)}</td>
        <td style="${tableValueStyle}">${escapeHtml(row.value)}</td>
      </tr>
    `).join('');

    return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-family:Arial, sans-serif;font-size:14px;line-height:20px;">
        ${headerCells}
        ${bodyRows}
      </table>
    `;
};

const createBasicTableBlock = () => `
<mj-text padding="0 0 16px">
  ${createTable([
        {
            label: __('Label', 'gutenverse-form'),
            value: __('Value', 'gutenverse-form'),
        },
        {
            label: __('Label', 'gutenverse-form'),
            value: __('Value', 'gutenverse-form'),
        },
    ], {
        headers: [
            __('Field', 'gutenverse-form'),
            __('Content', 'gutenverse-form'),
        ],
    })}
</mj-text>
`;

const createSubmissionTableBlock = (placeholders = {}) => `
<mj-text padding="0 0 16px">
  ${createTable(getSubmissionPlaceholders(placeholders).map(placeholder => ({
        label: placeholder.name,
        value: placeholder.value,
    })), {
        headers: [
            __('Submission Field', 'gutenverse-form'),
            __('Submitted Value', 'gutenverse-form'),
        ],
    })}
</mj-text>
`;

const createPlaceholderBlock = (placeholders = {}) => {
    const placeholderLines = normalizeEmailBuilderPlaceholders(placeholders)
        .slice(0, 16)
        .map(placeholder => `<div><strong>${escapeHtml(placeholder.name)}:</strong> ${escapeHtml(placeholder.value)}</div>`)
        .join('');

    return `
<mj-text color="#1d2327" font-size="14px" line-height="1.6" padding="0 0 16px">
  ${placeholderLines}
</mj-text>
`;
};

const createRawHtmlBlock = () => `
<mj-text padding="0 0 16px">
  <div style="font-family:Arial, sans-serif;font-size:14px;line-height:20px;color:#1d2327;">
    Custom HTML
  </div>
</mj-text>
`;

export const getEmailBuilderBlockOptions = blockId => CORE_BLOCK_OPTIONS[blockId] || {};

export const registerEmailBuilderBlocks = (editor, placeholders = {}) => {
    const blockManager = editor.Blocks;

    blockManager.add('gutenverse-table', {
        label: __('Table', 'gutenverse-form'),
        media: BLOCK_ICONS.table,
        category: CATEGORIES.content,
        content: createBasicTableBlock(),
    });

    blockManager.add('gutenverse-submission-table', {
        label: __('Submission Table', 'gutenverse-form'),
        media: BLOCK_ICONS.submissionTable,
        category: CATEGORIES.dynamic,
        content: createSubmissionTableBlock(placeholders),
    });

    blockManager.add('gutenverse-placeholder-tags', {
        label: __('Placeholder Tags', 'gutenverse-form'),
        media: BLOCK_ICONS.placeholderTags,
        category: CATEGORIES.dynamic,
        content: createPlaceholderBlock(placeholders),
    });

    blockManager.add('gutenverse-raw-html', {
        label: __('Raw HTML', 'gutenverse-form'),
        media: BLOCK_ICONS.code,
        category: CATEGORIES.advanced,
        content: createRawHtmlBlock(),
    });
};
