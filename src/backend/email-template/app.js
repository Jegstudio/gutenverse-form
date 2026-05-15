import { useEffect, useRef, useState } from '@wordpress/element';
import { Button, TextControl, SnackbarList, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import grapesjs from 'grapesjs';
import grapesJSMJML from 'grapesjs-mjml';
import {
    createGutenverseEmailDesign,
    DESIGN_FORMATS,
    parseEmailTemplateDesign,
} from './data-model';
import {
    addWordPressAssetToEditor,
    createWordPressAssetSelection,
    sanitizeMjmlBackgroundImageAttributes,
} from './media-library';
import {
    EMAIL_BUILDER_CORE_BLOCKS,
    getEmailBuilderBlockOptions,
    normalizeEmailBuilderPlaceholders,
    registerEmailBuilderBlocks,
} from './core-blocks';

const DEFAULT_MJML = `
<mjml>
  <mj-body background-color="#eef2f7">
    <mj-section background-color="#ffffff" padding="28px 24px">
      <mj-column>
        <mj-text color="#0f172a" font-size="22px" font-weight="600" line-height="1.35" padding="0 0 12px">
          Email title
        </mj-text>
        <mj-text color="#334155" font-size="14px" line-height="1.6" padding="0">
          Thanks for getting in touch. We have received your message and will respond as soon as possible.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`.trim();

const LOCAL_IMAGE_PLACEHOLDER = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22350%22%20height%3D%22250%22%20viewBox%3D%220%200%20350%20250%22%3E%3Crect%20width%3D%22350%22%20height%3D%22250%22%20fill%3D%22%23f0f0f1%22%2F%3E%3Cpath%20d%3D%22M145%20105h60v40h-60z%22%20fill%3D%22none%22%20stroke%3D%22%238c8f94%22%20stroke-width%3D%224%22%2F%3E%3Ccircle%20cx%3D%22164%22%20cy%3D%22119%22%20r%3D%226%22%20fill%3D%22%238c8f94%22%2F%3E%3Cpath%20d%3D%22M150%20140l18-18%2014%2014%2010-10%2018%2014%22%20fill%3D%22none%22%20stroke%3D%22%238c8f94%22%20stroke-width%3D%224%22%2F%3E%3C%2Fsvg%3E';

const ChevronLeftIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9 6l6 6-6 6" />
    </svg>
);

const EDITOR_DIRTY_EVENTS = [
    'component:add',
    'component:remove',
    'component:update',
    'style:property:update',
    'asset:add',
    'undo',
    'redo',
];

const HIDDEN_EDITOR_PANEL_BUTTONS = [
    {
        panel: 'options',
        button: 'fullscreen',
    },
    {
        panel: 'options',
        button: 'preview',
    },
    {
        panel: 'options',
        button: 'export-template',
    },
    {
        panel: 'options',
        button: 'mjml-import',
    },
    {
        panel: 'views',
        button: 'open-blocks',
    },
    {
        panel: 'views',
        button: 'open-tm',
    },
    {
        panel: 'views',
        button: 'open-layers',
    },
];

const PLACEHOLDER_RTE_ACTION = 'gutenverse-placeholder-tag';

const decodeEntities = (html) => {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
};

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;',
}[character]));

const escapeAttribute = escapeHtml;

const normalizeTitle = (title) => {
    return decodeEntities(title)
        .replace(/&#8211;|&#8212;|[\u2013\u2014]/g, '-')
        .replace(/\s+-\s+/g, ' - ')
        .trim();
};

const hasProjectData = (project) => {
    return !!project && typeof project === 'object' && Object.keys(project).length > 0;
};

const getMjmlErrorMessage = (errors = []) => {
    const firstError = Array.isArray(errors) ? errors[0] : null;

    if (!firstError) {
        return '';
    }

    return firstError.formattedMessage || firstError.message || String(firstError);
};

const isMjImageComponent = (component) => {
    const type = component?.get?.('type') || component?.attributes?.type || '';
    const tagName = component?.get?.('tagName') || component?.attributes?.tagName || '';

    return type === 'mj-image' || tagName === 'mj-image';
};

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, '').trim();

const getRenderedValue = (value) => {
    if (typeof value === 'string') {
        return value;
    }

    return value?.rendered || value?.raw || '';
};

const hideUnsupportedToolbarButtons = (editor) => {
    HIDDEN_EDITOR_PANEL_BUTTONS.forEach(({ panel, button }) => {
        editor.Panels?.removeButton?.(panel, button);
    });
};

const configureEmailBuilderStyleManager = (editor) => {
    editor.onReady?.(() => {
        const heightProperty = editor.StyleManager?.getProperty?.('dimension', 'height');

        heightProperty?.set?.({
            fixedValues: ['auto'],
        });
    });
};

const createPlaceholderSelectOptions = placeholders => normalizeEmailBuilderPlaceholders(placeholders)
    .map(({ name, value }) => `<option value="${escapeAttribute(value)}">${escapeHtml(name)} - ${escapeHtml(value)}</option>`)
    .join('');

const registerPlaceholderRichTextAction = (editor, placeholders = {}) => {
    const placeholderOptions = createPlaceholderSelectOptions(placeholders);

    if (!placeholderOptions) {
        return;
    }

    const addPlaceholderAction = () => {
        const richTextEditor = editor.RichTextEditor;

        if (!richTextEditor || richTextEditor.get?.(PLACEHOLDER_RTE_ACTION)) {
            return;
        }

        richTextEditor.add(PLACEHOLDER_RTE_ACTION, {
            icon: `
                <select class="gutenverse-rte-placeholder-select" aria-label="${escapeAttribute(__('Insert placeholder tag', 'gutenverse-form'))}">
                    <option value="">${escapeHtml(__('Insert tag', 'gutenverse-form'))}</option>
                    ${placeholderOptions}
                </select>
            `,
            event: 'change',
            attributes: {
                class: 'gjs-rte-action gutenverse-rte-placeholder-action',
                title: __('Insert placeholder tag', 'gutenverse-form'),
            },
            result: (rte, action) => {
                const select = action.btn?.querySelector?.('.gutenverse-rte-placeholder-select');
                const value = select?.value || '';

                if (!value) {
                    return;
                }

                rte.el?.focus?.();
                try {
                    rte.exec('insertText', value);
                } catch (error) {
                    void error;
                    rte.insertHTML(escapeHtml(value));
                }
                select.value = '';
            },
        });
    };

    editor.on('rte:enable', addPlaceholderAction);
    editor.on('destroy', () => editor.off('rte:enable', addPlaceholderAction));
};

const isEditorFormControl = (target, container) => {
    if (!container || !(target instanceof window.HTMLElement)) {
        return false;
    }

    return container.contains(target) && target.matches('input, select');
};

const dispatchControlChange = (target) => {
    target.dispatchEvent(new window.Event('change', {
        bubbles: true,
        cancelable: true,
    }));
};

const getMediaTitle = (item) => {
    const sourceUrl = item.source_url || item.url || '';
    const fallbackName = sourceUrl ? sourceUrl.split('/').pop() : '';

    return stripHtml(getRenderedValue(item.title)) || item.filename || item.name || fallbackName || '';
};

const getMediaPreviewUrl = (item) => {
    const sizes = item.media_details?.sizes || item.sizes || {};

    return sizes.medium?.source_url
        || sizes.medium?.url
        || sizes.thumbnail?.source_url
        || sizes.thumbnail?.url
        || item.source_url
        || item.url
        || '';
};

const MediaLibraryPicker = ({
    isOpen,
    items,
    isLoading,
    isUploading,
    search,
    onSearchChange,
    onRefresh,
    onUpload,
    onSelect,
    onClose,
}) => {
    const uploadInputRef = useRef(null);

    if (!isOpen) {
        return null;
    }

    const handleUploadChange = (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="gutenverse-media-picker-backdrop" role="presentation">
            <div className="gutenverse-media-picker" role="dialog" aria-modal="true" aria-label={__('Select Email Image', 'gutenverse-form')}>
                <div className="gutenverse-media-picker__header">
                    <h2>{__('Select Email Image', 'gutenverse-form')}</h2>
                    <button type="button" className="gutenverse-media-picker__close" onClick={onClose} aria-label={__('Close', 'gutenverse-form')}>
                        &times;
                    </button>
                </div>
                <div className="gutenverse-media-picker__toolbar">
                    <TextControl
                        value={search}
                        onChange={onSearchChange}
                        placeholder={__('Search media', 'gutenverse-form')}
                        className="gutenverse-media-picker__search"
                    />
                    <Button isSecondary disabled={isLoading} onClick={() => onRefresh(search)}>
                        {__('Refresh', 'gutenverse-form')}
                    </Button>
                    <Button isPrimary disabled={isUploading} onClick={() => uploadInputRef.current?.click()}>
                        {isUploading ? __('Uploading...', 'gutenverse-form') : __('Upload Image', 'gutenverse-form')}
                    </Button>
                    <input
                        ref={uploadInputRef}
                        type="file"
                        accept="image/*"
                        className="gutenverse-media-picker__upload"
                        onChange={handleUploadChange}
                    />
                </div>
                <div className="gutenverse-media-picker__content">
                    {isLoading && (
                        <div className="gutenverse-media-picker__loading">
                            <Spinner />
                        </div>
                    )}
                    {!isLoading && items.length === 0 && (
                        <div className="gutenverse-media-picker__empty">
                            {__('No images found in the WordPress Media Library.', 'gutenverse-form')}
                        </div>
                    )}
                    {!isLoading && items.length > 0 && (
                        <div className="gutenverse-media-picker__grid">
                            {items.map(item => {
                                const previewUrl = getMediaPreviewUrl(item);
                                const title = getMediaTitle(item);

                                return (
                                    <button
                                        key={item.id || previewUrl}
                                        type="button"
                                        className="gutenverse-media-picker__item"
                                        onClick={() => onSelect(item)}
                                    >
                                        <span className="gutenverse-media-picker__thumb">
                                            {previewUrl && <img src={previewUrl} alt={title} />}
                                        </span>
                                        <span className="gutenverse-media-picker__name">{title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const getTemplateState = (meta = {}) => {
    const rawDesign = meta.gutenverse_email_design || '';
    const parsedDesign = parseEmailTemplateDesign(rawDesign);
    const mjml = meta.gutenverse_email_mjml || DEFAULT_MJML;

    if (parsedDesign.format === DESIGN_FORMATS.GUTENVERSE_MJML) {
        return {
            format: parsedDesign.format,
            mjml,
            project: parsedDesign.design?.project || null,
            isReadOnly: false,
        };
    }

    return {
        format: parsedDesign.format,
        mjml,
        project: null,
        isReadOnly: false,
    };
};

const App = () => {
    const editorContainerRef = useRef(null);
    const blocksSidebarRef = useRef(null);
    const editorRef = useRef(null);
    const editorReadyRef = useRef(false);
    const mediaSearchTimerRef = useRef(null);
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isPostLoaded, setIsPostLoaded] = useState(false);
    const [templateState, setTemplateState] = useState(() => getTemplateState());
    const [currentPostId, setCurrentPostId] = useState(window.gutenverseEmailTemplate?.postId || null);
    const [notices, setNotices] = useState([]);
    const [isDirty, setIsDirty] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [mediaPickerRequest, setMediaPickerRequest] = useState(null);
    const [mediaItems, setMediaItems] = useState([]);
    const [mediaSearch, setMediaSearch] = useState('');
    const [isMediaLoading, setIsMediaLoading] = useState(false);
    const [isMediaUploading, setIsMediaUploading] = useState(false);
    const [isBlocksSidebarCollapsed, setIsBlocksSidebarCollapsed] = useState(false);
    const [isSettingsSidebarCollapsed, setIsSettingsSidebarCollapsed] = useState(false);

    const { nonce } = window.gutenverseEmailTemplate || {};

    const addNotice = (notice) => {
        const id = Date.now();
        setNotices(prev => [...prev, {
            id,
            onRemove: () => removeNotice(id),
            ...notice
        }]);
    };

    const removeNotice = (id) => {
        setNotices(prev => prev.filter(notice => notice.id !== id));
    };

    const loadMediaItems = (searchTerm = '') => {
        const query = new URLSearchParams({
            media_type: 'image',
            per_page: '60',
            orderby: 'date',
            order: 'desc',
            _fields: 'id,source_url,media_details,alt_text,caption,title,mime_type',
        });

        if (searchTerm) {
            query.set('search', searchTerm);
        }

        setIsMediaLoading(true);

        return apiFetch({
            path: `/wp/v2/media?${query.toString()}`,
            headers: { 'X-WP-Nonce': nonce }
        }).then((items) => {
            setMediaItems(Array.isArray(items) ? items : []);
        }).catch((error) => {
            addNotice({
                status: 'error',
                content: error.message || __('Could not load WordPress media library images.', 'gutenverse-form'),
                isDismissible: true,
            });
        }).finally(() => {
            setIsMediaLoading(false);
        });
    };

    const openMediaPicker = (request = {}) => {
        setMediaSearch('');
        setMediaPickerRequest(request);
        loadMediaItems('');
    };

    const closeMediaPicker = (stopCommand = true) => {
        setMediaPickerRequest(null);

        const editor = editorRef.current;

        if (stopCommand && editor?.Commands?.isActive?.('open-assets')) {
            editor.stopCommand('open-assets');
        }
    };

    const handleMediaSearchChange = (value) => {
        setMediaSearch(value);

        if (mediaSearchTimerRef.current) {
            window.clearTimeout(mediaSearchTimerRef.current);
        }

        mediaSearchTimerRef.current = window.setTimeout(() => {
            loadMediaItems(value);
        }, 350);
    };

    const handleMediaSelect = (item) => {
        const editor = editorRef.current;

        if (!editor || !mediaPickerRequest) {
            return;
        }

        const shouldApplyDirectly = !mediaPickerRequest.select && !mediaPickerRequest.onSelect;
        sanitizeMjmlBackgroundImageAttributes(editor);

        const { assetData } = addWordPressAssetToEditor(
            editor,
            item,
            shouldApplyDirectly ? mediaPickerRequest.target : null
        );
        const callbackAsset = createWordPressAssetSelection(assetData);

        if (typeof mediaPickerRequest.select === 'function') {
            mediaPickerRequest.select(callbackAsset, true);
        }

        if (typeof mediaPickerRequest.onSelect === 'function') {
            mediaPickerRequest.onSelect(callbackAsset, true);
        }

        sanitizeMjmlBackgroundImageAttributes(editor);
        closeMediaPicker();
    };

    const uploadMediaFile = (file) => {
        const formData = new window.FormData();
        formData.append('file', file, file.name);

        setIsMediaUploading(true);

        apiFetch({
            path: '/wp/v2/media',
            method: 'POST',
            headers: { 'X-WP-Nonce': nonce },
            body: formData,
        }).then((item) => {
            setMediaItems(prev => [item, ...prev]);
            handleMediaSelect(item);
        }).catch((error) => {
            addNotice({
                status: 'error',
                content: error.message || __('Could not upload the selected image.', 'gutenverse-form'),
                isDismissible: true,
            });
        }).finally(() => {
            setIsMediaUploading(false);
        });
    };

    useEffect(() => {
        if (!currentPostId) return;

        let isCurrent = true;

        setIsPostLoaded(false);
        setIsLoaded(false);

        apiFetch({
            path: `/wp/v2/gutenverse-email-tpl/${currentPostId}`,
            headers: { 'X-WP-Nonce': nonce }
        }).then((post) => {
            if (!isCurrent) {
                return;
            }

            setLoadError('');

            if (post.title && post.title.rendered) {
                setTitle(normalizeTitle(post.title.rendered));

                if (post.status === 'auto-draft' && post.title.rendered === 'Auto Draft') {
                    setTitle('');
                }
            }

            const nextTemplateState = getTemplateState(post.meta || {});

            if (nextTemplateState.format === DESIGN_FORMATS.INVALID) {
                setLoadError(__('This email template design data is not valid JSON. A fresh MJML canvas has been loaded instead.', 'gutenverse-form'));
            }

            setTemplateState(nextTemplateState);
            setIsDirty(false);
            setIsPostLoaded(true);
        }).catch(() => {
            if (!isCurrent) {
                return;
            }

            setLoadError(__('Could not load this email template. Refresh the page and try again.', 'gutenverse-form'));
        });

        return () => {
            isCurrent = false;
        };
    }, [currentPostId]);

    useEffect(() => {
        if (!isPostLoaded || !editorContainerRef.current || !blocksSidebarRef.current) {
            return undefined;
        }

        let hasMarkedReady = false;
        const container = editorContainerRef.current;
        const blocksContainer = blocksSidebarRef.current;

        container.innerHTML = '';
        blocksContainer.innerHTML = '';
        editorReadyRef.current = false;
        setIsLoaded(false);

        const editor = grapesjs.init({
            container,
            height: '100%',
            width: 'auto',
            fromElement: false,
            storageManager: false,
            noticeOnUnload: false,
            assetManager: {
                upload: false,
            },
            blockManager: {
                appendTo: blocksContainer,
            },
            plugins: [grapesJSMJML],
            pluginsOpts: {
                [grapesJSMJML]: {
                    blocks: EMAIL_BUILDER_CORE_BLOCKS,
                    block: getEmailBuilderBlockOptions,
                    importPlaceholder: DEFAULT_MJML,
                    imagePlaceholderSrc: LOCAL_IMAGE_PLACEHOLDER,
                    resetBlocks: true,
                    resetDevices: true,
                    resetStyleManager: true,
                },
            },
        });

        editorRef.current = editor;
        hideUnsupportedToolbarButtons(editor);
        configureEmailBuilderStyleManager(editor);
        editor.runCommand?.('open-sm');
        editor.Panels?.getButton?.('views', 'open-sm')?.set?.('active', true);
        registerPlaceholderRichTextAction(editor, window.gutenverseEmailTemplate?.placeholders || {});
        registerEmailBuilderBlocks(editor, window.gutenverseEmailTemplate?.placeholders || {});
        editor.Commands.add('open-assets', {
            run: (editorInstance, sender, options = {}) => {
                editorInstance.Modal?.close?.();
                openMediaPicker({
                    target: options.target,
                    select: options.select,
                    onSelect: options.onSelect,
                });
            },
            stop: () => closeMediaPicker(false),
        });

        if (hasProjectData(templateState.project)) {
            editor.loadProjectData(templateState.project);
        } else {
            editor.setComponents(templateState.mjml || DEFAULT_MJML);
        }

        const markDirty = () => {
            if (editorReadyRef.current && !templateState.isReadOnly) {
                setIsDirty(true);
            }
        };

        const openMediaForImage = (component) => {
            if (!editorReadyRef.current || templateState.isReadOnly || !isMjImageComponent(component)) {
                return;
            }

            editor.select(component);
            window.setTimeout(() => {
                if (editorReadyRef.current && editor.getSelected() === component) {
                    editor.runCommand('open-assets', { target: component });
                }
            }, 0);
        };

        const markReady = () => {
            if (hasMarkedReady) {
                return;
            }

            hasMarkedReady = true;
            editorReadyRef.current = true;
            editor.UndoManager?.clear();
            setIsLoaded(true);
            setIsDirty(false);
        };

        const preventControlSubmit = (event) => {
            if (event.key !== 'Enter' || !isEditorFormControl(event.target, container)) {
                return;
            }

            dispatchControlChange(event.target);
            event.preventDefault();
            event.stopPropagation();
            event.target.blur?.();
        };

        EDITOR_DIRTY_EVENTS.forEach(eventName => editor.on(eventName, markDirty));
        editor.on('component:add', openMediaForImage);
        editor.on('load', markReady);
        container.addEventListener('keydown', preventControlSubmit);
        window.setTimeout(markReady, 0);

        return () => {
            EDITOR_DIRTY_EVENTS.forEach(eventName => editor.off(eventName, markDirty));
            editor.off('component:add', openMediaForImage);
            editor.off('load', markReady);
            container.removeEventListener('keydown', preventControlSubmit);
            editorReadyRef.current = false;
            editorRef.current = null;
            editor.destroy();
        };
    }, [isPostLoaded, templateState]);

    useEffect(() => {
        const onBeforeUnload = (event) => {
            if (!isDirty) {
                return undefined;
            }

            event.preventDefault();
            event.returnValue = '';
            return '';
        };

        window.addEventListener('beforeunload', onBeforeUnload);

        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        const root = document.getElementById('gutenverse-email-builder-root');
        const postForm = root?.closest('form');

        if (!root || !postForm) {
            return undefined;
        }

        const preventBuilderSubmit = (event) => {
            const activeElement = document.activeElement;

            if (activeElement && root.contains(activeElement)) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        postForm.addEventListener('submit', preventBuilderSubmit);

        return () => postForm.removeEventListener('submit', preventBuilderSubmit);
    }, []);

    useEffect(() => {
        return () => {
            if (mediaSearchTimerRef.current) {
                window.clearTimeout(mediaSearchTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!editorRef.current || !isLoaded) {
            return undefined;
        }

        const refreshTimer = window.setTimeout(() => {
            editorRef.current?.refresh?.();

            if (!isSettingsSidebarCollapsed) {
                editorRef.current?.runCommand?.('open-sm');
                editorRef.current?.Panels?.getButton?.('views', 'open-sm')?.set?.('active', true);
            }
        }, 0);

        return () => window.clearTimeout(refreshTimer);
    }, [isBlocksSidebarCollapsed, isSettingsSidebarCollapsed, isLoaded]);

    const compileTemplate = () => {
        const editor = editorRef.current;

        sanitizeMjmlBackgroundImageAttributes(editor);

        const mjml = editor.runCommand('mjml-code').trim();
        const result = editor.runCommand('mjml-code-to-html', { mjml });
        const errorMessage = getMjmlErrorMessage(result?.errors);

        if (errorMessage) {
            throw new Error(errorMessage);
        }

        if (!result?.html) {
            throw new Error(__('The MJML compiler did not return email HTML.', 'gutenverse-form'));
        }

        return {
            mjml,
            html: result.html,
            project: editor.getProjectData(),
        };
    };

    const saveDesign = () => {
        if (!editorRef.current || !isLoaded || isSaving || templateState.isReadOnly) return;
        setIsSaving(true);

        let compiled;

        try {
            compiled = compileTemplate();
        } catch (error) {
            setIsSaving(false);
            addNotice({
                status: 'error',
                content: error.message || __('Could not compile this MJML template.', 'gutenverse-form'),
                isDismissible: true,
            });
            return;
        }

        apiFetch({
            path: `/wp/v2/gutenverse-email-tpl/${currentPostId}`,
            method: 'POST',
            headers: { 'X-WP-Nonce': nonce },
            data: {
                title: title || 'Untitled Template',
                status: 'publish',
                meta: {
                    gutenverse_email_design: JSON.stringify(createGutenverseEmailDesign(compiled.project)),
                    gutenverse_email_html: compiled.html,
                    gutenverse_email_mjml: compiled.mjml
                }
            }
        }).then((res) => {
            setIsSaving(false);
            setIsDirty(false);

            if (res.title && res.title.rendered) {
                setTitle(normalizeTitle(res.title.rendered));
            }

            if (res.id && res.id !== currentPostId) {
                setCurrentPostId(res.id);
            }

            addNotice({
                status: 'success',
                content: __('Saved successfully!', 'gutenverse-form'),
                isDismissible: true,
            });
        }).catch((err) => {
            setIsSaving(false);
            addNotice({
                status: 'error',
                content: __('Error saving template: ', 'gutenverse-form') + (err.message || __('Unknown error', 'gutenverse-form')),
                isDismissible: true,
            });
        });
    };

    const titleWidthCh = Math.min(Math.max((title || '').length + 2, 18), 68);

    return (
        <div className="gutenverse-email-builder">
            <div className="gutenverse-email-builder-header">
                <div className="header-left">
                    <span className="builder-brand">{__('Gutenverse Form - Email Template', 'gutenverse-form')}</span>
                </div>
                <div className="header-center">
                    <div className="title-wrapper" style={{ '--gutenverse-email-title-width': `${titleWidthCh}ch` }}>
                        <span className="title-prefix">{__('title:', 'gutenverse-form')}</span>
                        <TextControl
                            value={title}
                            onChange={(value) => {
                                setTitle(value);
                                setIsDirty(true);
                            }}
                            placeholder={__('Template Name', 'gutenverse-form')}
                            className="title-input"
                        />
                        <span className="edit-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </span>
                    </div>
                </div>
                <div className="header-right">
                    <span className={`save-state ${isDirty ? 'dirty' : 'saved'}`}>
                        {isDirty ? __('Unsaved changes', 'gutenverse-form') : __('Saved', 'gutenverse-form')}
                    </span>
                    <Button isPrimary isBusy={isSaving} disabled={!isLoaded || isSaving || templateState.isReadOnly} onClick={saveDesign}>
                        {isSaving ? __('Saving...', 'gutenverse-form') : __('Save', 'gutenverse-form')}
                    </Button>
                </div>
            </div>
            {loadError && <div className="email-template-load-error">{loadError}</div>}
            <div className="editor-container">
                <div
                    className={[
                        'gutenverse-email-builder-workspace',
                        isBlocksSidebarCollapsed ? 'is-blocks-collapsed' : '',
                        isSettingsSidebarCollapsed ? 'is-settings-collapsed' : '',
                    ].filter(Boolean).join(' ')}
                >
                    <aside className="gutenverse-email-builder-sidebar gutenverse-email-builder-sidebar--blocks" aria-label={__('Email blocks', 'gutenverse-form')}>
                        <div className="gutenverse-email-builder-sidebar__header">
                            <span>{__('Blocks', 'gutenverse-form')}</span>
                            <button
                                type="button"
                                className="gutenverse-email-sidebar-toggle"
                                onClick={() => setIsBlocksSidebarCollapsed(value => !value)}
                                aria-expanded={!isBlocksSidebarCollapsed}
                                aria-label={isBlocksSidebarCollapsed ? __('Expand blocks sidebar', 'gutenverse-form') : __('Collapse blocks sidebar', 'gutenverse-form')}
                            >
                                {isBlocksSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                            </button>
                        </div>
                        <div ref={blocksSidebarRef} className="gutenverse-email-blocks-panel" />
                    </aside>
                    <div ref={editorContainerRef} className="gutenverse-grapesjs-editor" />
                    <button
                        type="button"
                        className="gutenverse-email-settings-toggle"
                        onClick={() => setIsSettingsSidebarCollapsed(value => !value)}
                        aria-expanded={!isSettingsSidebarCollapsed}
                        aria-label={isSettingsSidebarCollapsed ? __('Expand style sidebar', 'gutenverse-form') : __('Collapse style sidebar', 'gutenverse-form')}
                    >
                        {isSettingsSidebarCollapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </button>
                </div>
            </div>
            <MediaLibraryPicker
                isOpen={!!mediaPickerRequest}
                items={mediaItems}
                isLoading={isMediaLoading}
                isUploading={isMediaUploading}
                search={mediaSearch}
                onSearchChange={handleMediaSearchChange}
                onRefresh={loadMediaItems}
                onUpload={uploadMediaFile}
                onSelect={handleMediaSelect}
                onClose={closeMediaPicker}
            />
            <SnackbarList
                notices={notices}
                className="components-editor-notices__snackbar"
                onRemove={removeNotice}
            />
        </div>
    );
};

export default App;
