import { useRef, useState, useEffect } from '@wordpress/element';
import { Button, TextControl, SnackbarList } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import EmailEditor from 'react-email-editor';

const decodeEntities = (html) => {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
};

const normalizeTitle = (title) => {
    return decodeEntities(title)
        .replace(/&#8211;|&#8212;|[\u2013\u2014]/g, '-')
        .replace(/\s+-\s+/g, ' - ')
        .trim();
};

const App = () => {
    const emailEditorRef = useRef(null);
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [initialDesign, setInitialDesign] = useState(null);
    const [currentPostId, setCurrentPostId] = useState(window.gutenverseEmailTemplate?.postId || null);
    const [notices, setNotices] = useState([]);
    const [isDirty, setIsDirty] = useState(false);
    const [loadError, setLoadError] = useState('');

    // Config from PHP
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

    useEffect(() => {
        if (!currentPostId) return;

        // Fetch Post Data including Meta
        apiFetch({
            path: `/wp/v2/gutenverse-email-tpl/${currentPostId}`,
            headers: { 'X-WP-Nonce': nonce }
        }).then((post) => {
            setLoadError('');
            if (post.title && post.title.rendered) {
                setTitle(normalizeTitle(post.title.rendered));
                // If it's Auto Draft, title might be "Auto Draft" or empty
                if (post.status === 'auto-draft' && post.title.rendered === 'Auto Draft') {
                    setTitle('');
                }
            }

            // Load Design if exists
            if (post.meta && post.meta.gutenverse_email_design) {
                try {
                    const design = JSON.parse(post.meta.gutenverse_email_design);
                    setInitialDesign(design);
                } catch (e) {
                    // Invalid JSON design
                }
            }
        }).catch(() => {
            setLoadError(__('Could not load this email template. Refresh the page and try again.', 'gutenverse-form'));
        });
    }, [currentPostId]);

    const onLoad = () => {
        setIsLoaded(true);
    };

    const onDesignUpdated = () => {
        setIsDirty(true);
    };

    useEffect(() => {
        if (isLoaded && initialDesign && emailEditorRef.current) {
            emailEditorRef.current.editor.loadDesign(initialDesign);
            setIsDirty(false);
        }
    }, [isLoaded, initialDesign]);

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

    const saveDesign = () => {
        if (!emailEditorRef.current || !isLoaded || isSaving) return;
        setIsSaving(true);

        emailEditorRef.current.editor.exportHtml((data) => {
            const { design, html } = data;

            apiFetch({
                path: `/wp/v2/gutenverse-email-tpl/${currentPostId}`,
                method: 'POST',
                headers: { 'X-WP-Nonce': nonce },
                data: {
                    title: title || 'Untitled Template',
                    status: 'publish',
                    meta: {
                        gutenverse_email_design: JSON.stringify(design),
                        gutenverse_email_html: html
                    }
                }
            }).then((res) => {
                setIsSaving(false);
                setIsDirty(false);
                if (res.title && res.title.rendered) {
                    setTitle(normalizeTitle(res.title.rendered));
                }

                // Update ID if changed (e.g. from draft to publish potentially)
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
                    content: __('Error saving template: ' + (err.message || 'Unknown error'), 'gutenverse-form'),
                    isDismissible: true,
                });
            });
        });
    };

    const dashboardUrl = window.location.href.split('post.php')[0] + 'edit.php?post_type=gutenverse-email-tpl';
    const goBack = (event) => {
        if (!isDirty) {
            return;
        }

        const confirmed = window.confirm(__('You have unsaved email template changes. Leave without saving?', 'gutenverse-form'));
        if (!confirmed) {
            event.preventDefault();
        }
    };

    return (
        <div className="gutenverse-email-builder">
            <div className="gutenverse-email-builder-header">
                <div className="header-left">
                    <a href={dashboardUrl} className="back-link" onClick={goBack}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        {__('Back', 'gutenverse-form')}
                    </a>
                </div>
                <div className="header-center">
                    <div className="title-wrapper">
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
                    <Button isPrimary isBusy={isSaving} disabled={!isLoaded || isSaving} onClick={saveDesign}>
                        {isSaving ? __('Saving...', 'gutenverse-form') : __('Save', 'gutenverse-form')}
                    </Button>
                </div>
            </div>
            {loadError && <div className="email-template-load-error">{loadError}</div>}
            <div className="editor-container">
                <EmailEditor
                    ref={emailEditorRef}
                    onLoad={onLoad}
                    onDesignUpdated={onDesignUpdated}
                    style={{ height: '100%', width: '100%' }}
                    minHeight="100%"
                    options={{
                        mergeTags: window.gutenverseEmailTemplate?.placeholders || {},
                        mergeTagsConfig: {
                            sort: false,
                            label: __('Field Tags', 'gutenverse-form'),
                        },
                        translations: {
                            en: {
                                'labels.merge_tags': __('Field Tags', 'gutenverse-form'),
                                'labels.mergeTags': __('Field Tags', 'gutenverse-form'),
                                'labels.merge-tags': __('Field Tags', 'gutenverse-form'),
                            },
                        },
                        tools: {
                            menu: {
                                enabled: false
                            }
                        }
                    }}
                />
            </div>
            <SnackbarList
                notices={notices}
                className="components-editor-notices__snackbar"
                onRemove={removeNotice}
            />
        </div>
    );
};

export default App;
