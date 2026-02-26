import { useRef, useState, useEffect } from '@wordpress/element';
import { Button, TextControl, SnackbarList } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import EmailEditor from 'react-email-editor';

const App = () => {
    const emailEditorRef = useRef(null);
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [initialDesign, setInitialDesign] = useState(null);
    const [currentPostId, setCurrentPostId] = useState(window.gutenverseEmailTemplate?.postId || null);
    const [notices, setNotices] = useState([]);

    // Config from PHP
    const { nonce } = window.gutenverseEmailTemplate || {};

    const addNotice = (notice) => {
        setNotices(prev => [...prev, {
            id: Date.now(),
            onRemove: () => removeNotice(Date.now()),
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
            if (post.title && post.title.rendered) {
                setTitle(post.title.rendered);
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
            // Error loading post
        });
    }, [currentPostId]);

    const onLoad = () => {
        setIsLoaded(true);
    };

    useEffect(() => {
        if (isLoaded && initialDesign && emailEditorRef.current) {
            emailEditorRef.current.editor.loadDesign(initialDesign);
        }
    }, [isLoaded, initialDesign]);

    const saveDesign = () => {
        if (!emailEditorRef.current) return;
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
                if (res.title && res.title.rendered) {
                    setTitle(res.title.rendered);
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

    return (
        <div className="gutenverse-email-builder">
            <div className="gutenverse-email-builder-header">
                <div className="header-left">
                    <a href={dashboardUrl} className="back-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        {__('Back', 'gutenverse-form')}
                    </a>
                </div>
                <div className="header-center">
                    <div className="title-wrapper">
                        <span className="title-prefix">{__('title:', 'gutenverse-form')}</span>
                        <TextControl
                            value={title}
                            onChange={(value) => setTitle(value)}
                            placeholder={__('Template Name', 'gutenverse-form')}
                            className="title-input"
                        />
                        <span className="edit-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </span>
                    </div>
                </div>
                <div className="header-right">
                    <Button isPrimary isBusy={isSaving} onClick={saveDesign}>
                        {isSaving ? __('Saving...', 'gutenverse-form') : __('Save', 'gutenverse-form')}
                    </Button>
                </div>
            </div>
            <div className="editor-container">
                <EmailEditor
                    ref={emailEditorRef}
                    onLoad={onLoad}
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
