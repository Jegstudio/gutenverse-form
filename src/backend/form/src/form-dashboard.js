import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { IconTrashSVG } from 'gutenverse-core/icons';

const chartTop = 32;
const chartBase = 168;

const getConfig = () => window?.GutenverseConfig?.formDashboard || {};

const EmptyNote = ({ children }) => <p className="empty-note">{children}</p>;

const Panel = ({ title, className = '', children }) => (
    <div className={`dashboard-panel ${className}`}>
        <div className="dashboard-panel__title">
            <h3>{title}</h3>
        </div>
        {children}
    </div>
);

const Row = ({ title, meta, actions }) => (
    <div className="dashboard-row">
        <div>
            <strong>{title}</strong>
            <span>{meta}</span>
        </div>
        {actions && <div className="dashboard-row__actions">{actions}</div>}
    </div>
);

const SkeletonLine = ({ className = '' }) => (
    <span className={`dashboard-skeleton-line ${className}`} aria-hidden="true" />
);

const FormDashboardSkeleton = () => (
    <div className="gutenverse-form-admin-dashboard__skeleton" aria-hidden="true">
        <div className="gutenverse-form-admin-dashboard__hero dashboard-skeleton-hero">
            <div className="gutenverse-form-admin-dashboard__intro">
                <SkeletonLine className="dashboard-skeleton-title" />
                <SkeletonLine className="dashboard-skeleton-copy" />
                <SkeletonLine className="dashboard-skeleton-button" />
            </div>
            <div className="gutenverse-form-admin-dashboard__summary">
                {[1, 2, 3, 4].map(item => (
                    <div className="summary-card dashboard-skeleton-card" key={item}>
                        <SkeletonLine className="dashboard-skeleton-number" />
                        <SkeletonLine className="dashboard-skeleton-label" />
                    </div>
                ))}
            </div>
        </div>
        <div className="gutenverse-form-admin-dashboard__list dashboard-grid">
            <div className="dashboard-panel dashboard-panel--wide dashboard-panel--chart">
                <div className="dashboard-block__header">
                    <div>
                        <SkeletonLine className="dashboard-skeleton-heading" />
                        <SkeletonLine className="dashboard-skeleton-meta" />
                    </div>
                    <SkeletonLine className="dashboard-skeleton-toggle" />
                </div>
                <div className="trend-chart">
                    <div className="dashboard-skeleton-chart">
                        {[1, 2, 3, 4].map(item => (
                            <span key={item} />
                        ))}
                    </div>
                </div>
            </div>
            <div className="dashboard-masonry">
                {[1, 2, 3, 4].map(panel => (
                    <div className="dashboard-panel dashboard-skeleton-panel" key={panel}>
                        <div className="dashboard-panel__title">
                            <SkeletonLine className="dashboard-skeleton-heading" />
                        </div>
                        {[1, 2, 3].map(row => (
                            <div className="dashboard-row dashboard-skeleton-row" key={row}>
                                <div>
                                    <SkeletonLine className="dashboard-skeleton-row-title" />
                                    <SkeletonLine className="dashboard-skeleton-row-meta" />
                                </div>
                                <SkeletonLine className="dashboard-skeleton-action" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const MigrationNotice = () => {
    const config = getConfig();
    const [visible, setVisible] = useState(!config.migrationNoticeHidden);

    if (!visible) {
        return null;
    }

    const dismiss = () => {
        const data = new window.FormData();

        setVisible(false);
        data.append('action', 'gutenverse_form_action_migration_notice_close');
        data.append('nonce', config.migrationNoticeDismissNonce);

        window.fetch(window.ajaxurl, {
            method: 'POST',
            credentials: 'same-origin',
            body: data
        });
    };

    return (
        <div className="gutenverse-form-action-migration-notice">
            <div>
                <strong>{__('Form actions have moved to Form Builder', 'gutenverse-form')}</strong>
                <p>{__('Form actions are now bound to each Form Builder block and can be created, edited, or deleted directly from the Form Builder. They are no longer managed from this admin dashboard.', 'gutenverse-form')}</p>
            </div>
            <button type="button" aria-label={__('Dismiss notice', 'gutenverse-form')} onClick={dismiss}>
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    );
};

const TrendChart = ({ trend }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);

    if (!trend) {
        return null;
    }

    const tooltip = hoveredPoint ? (() => {
        const label = hoveredPoint.tooltip || sprintf(__('%1$s: %2$s entries', 'gutenverse-form'), hoveredPoint.label, hoveredPoint.count || 0);
        const width = Math.max(112, (label.length * 6.6) + 22);
        const x = Math.min(Math.max(hoveredPoint.x - (width / 2), 58), 680 - width);
        const y = hoveredPoint.y < 68 ? hoveredPoint.y + 16 : hoveredPoint.y - 42;

        return {
            label,
            width,
            x,
            y,
        };
    })() : null;

    const showTooltip = (point) => setHoveredPoint(point);
    const hideTooltip = () => setHoveredPoint(null);

    return (
        <div className="trend-chart__line" role="img" aria-label={__('Daily entries chart', 'gutenverse-form')}>
            <div className="trend-chart__legend">
                <span className="trend-chart__legend-item"><span className="trend-chart__legend-swatch" />{__('Entries', 'gutenverse-form')}</span>
            </div>
            <svg className="trend-chart__svg" viewBox="0 0 700 220" preserveAspectRatio="xMidYMid meet" focusable="false" aria-hidden="true">
                <path className="trend-chart__axis" d="M54 32V168H676" />
                {(trend.ticks || []).map((tick) => {
                    const tickY = chartBase - ((tick / trend.max) * (chartBase - chartTop));

                    return (
                        <g key={tick}>
                            <path className="trend-chart__grid-line" d={`M54 ${Number(tickY).toFixed(2)}H676`} />
                            <text className="trend-chart__y-label" x="42" y={Number(tickY + 4).toFixed(2)}>{tick}</text>
                        </g>
                    );
                })}
                <polyline className="trend-chart__stroke" points={trend.line_points} />
                {(trend.points || []).map((point) => (
                    <g key={`${point.x}-${point.y}-${point.label}`}>
                        <circle
                            className="trend-chart__point-hit-area"
                            cx={point.x}
                            cy={point.y}
                            r="12"
                            onMouseEnter={() => showTooltip(point)}
                            onMouseLeave={hideTooltip}
                        >
                            <title>{point.tooltip}</title>
                        </circle>
                        <circle className="trend-chart__point" cx={point.x} cy={point.y} r="4" />
                        {point.show_label && (
                            <g
                                className="trend-chart__x-label-group"
                                onMouseEnter={() => showTooltip(point)}
                                onMouseLeave={hideTooltip}
                            >
                                <rect className="trend-chart__x-label-hit-area" x={point.x - 34} y="184" width="68" height="24">
                                    <title>{point.tooltip}</title>
                                </rect>
                                <text className="trend-chart__x-label" x={point.x} y="202">{point.label}</text>
                            </g>
                        )}
                    </g>
                ))}
                {tooltip && (
                    <g className="trend-chart__tooltip" transform={`translate(${Number(tooltip.x).toFixed(2)} ${Number(tooltip.y).toFixed(2)})`} pointerEvents="none">
                        <rect className="trend-chart__tooltip-bg" width={Number(tooltip.width).toFixed(2)} height="28" rx="4" />
                        <text className="trend-chart__tooltip-text" x={Number(tooltip.width / 2).toFixed(2)} y="18">{tooltip.label}</text>
                    </g>
                )}
            </svg>
        </div>
    );
};

const DeleteModal = ({ form, deleting, error, onCancel, onConfirm }) => {
    if (!form) {
        return null;
    }

    return (
        <div className="dashboard-delete-modal is-open" aria-hidden="false">
            <div className="dashboard-delete-modal__backdrop" onClick={deleting ? undefined : onCancel} />
            <div className="dashboard-delete-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="unused-form-delete-title">
                <div className="dashboard-delete-modal__content">
                    <span className="dashboard-delete-modal__icon" aria-hidden="true">
                        <IconTrashSVG size={16} />
                    </span>
                    <div>
                        <h3 id="unused-form-delete-title">{__('Delete unused form action?', 'gutenverse-form')}</h3>
                        <p>{sprintf(__('This will permanently delete "%s". This action cannot be undone.', 'gutenverse-form'), form.title)}</p>
                        {error && <p className="dashboard-delete-modal__error is-visible">{error}</p>}
                    </div>
                </div>
                <div className="dashboard-delete-modal__footer">
                    <button type="button" className="dashboard-button" onClick={onCancel} disabled={deleting}>{__('Cancel', 'gutenverse-form')}</button>
                    <button type="button" className="dashboard-delete-modal__confirm" onClick={onConfirm} disabled={deleting}>
                        {deleting ? __('Deleting...', 'gutenverse-form') : __('Delete', 'gutenverse-form')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FormDashboard = () => {
    const config = getConfig();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [range, setRange] = useState('7');
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        apiFetch({ path: '/gutenverse-form-client/v1/form-action/dashboard' })
            .then((response) => {
                setData(response);
                setLoading(false);
            })
            .catch((error) => {
                setLoadError(error?.message || __('Could not load the form dashboard.', 'gutenverse-form'));
                setLoading(false);
            });
    }, []);

    const deleteUnusedForm = () => {
        if (!pendingDelete) {
            return;
        }

        setDeleting(true);
        setDeleteError('');
        apiFetch({
            path: `/gutenverse-form-client/v1/form-action/${pendingDelete.id}`,
            method: 'DELETE',
        }).then(() => {
            setData((current) => ({
                ...current,
                unusedForms: (current.unusedForms || []).filter((form) => form.id !== pendingDelete.id),
                forms: (current.forms || []).filter((form) => form.id !== pendingDelete.id),
            }));
            setPendingDelete(null);
            setDeleting(false);
        }).catch((error) => {
            setDeleteError(error?.message || __('Could not delete this form action. Please try again.', 'gutenverse-form'));
            setDeleting(false);
        });
    };

    if (loading) {
        return (
            <div className="gutenverse-form-admin-dashboard is-loading" aria-busy="true">
                <MigrationNotice />
                <span className="screen-reader-text">{__('Loading dashboard...', 'gutenverse-form')}</span>
                <FormDashboardSkeleton />
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="gutenverse-form-admin-dashboard">
                <MigrationNotice />
                <div className="gutenverse-form-admin-dashboard__empty">{loadError}</div>
            </div>
        );
    }

    const forms = data?.forms || [];
    const recentForms = data?.recentForms || [];
    const trend = data?.trendContexts?.[range];

    return (
        <div className="gutenverse-form-admin-dashboard">
            <MigrationNotice />
            <div className="gutenverse-form-admin-dashboard__hero">
                <div className="gutenverse-form-admin-dashboard__intro">
                    <h1>{__('Form Dashboard', 'gutenverse-form')}</h1>
                    <p>{__('Track submission performance and jump into the most relevant form locations when something needs quick attention.', 'gutenverse-form')}</p>
                    <div className="dashboard-actions">
                        <a className="dashboard-button dashboard-button--primary" href={config.entriesUrl}>{__('View Entries', 'gutenverse-form')}</a>
                    </div>
                </div>
                <div className="gutenverse-form-admin-dashboard__summary">
                    <div className="summary-card"><strong>{data.totalEntries || 0}</strong><span>{__('Total Entries', 'gutenverse-form')}</span></div>
                    <div className="summary-card"><strong>{data.entriesLastWeek || 0}</strong><span>{__('Entries In Last 7 Days', 'gutenverse-form')}</span></div>
                    <div className="summary-card"><strong>{data.totalLocations || 0}</strong><span>{__('Live Locations', 'gutenverse-form')}</span></div>
                    <div className="summary-card"><strong>{forms.length}</strong><span>{__('Tracked Forms', 'gutenverse-form')}</span></div>
                </div>
            </div>

            {!forms.length ? (
                <div className="gutenverse-form-admin-dashboard__empty dashboard-empty-state">
                    <span className="dashboard-empty-state__icon" aria-hidden="true" />
                    <div className="dashboard-empty-state__content">
                        <h2>{__('No forms found yet', 'gutenverse-form')}</h2>
                        <p>{__('Create a form with the Form Builder block, then submissions and form locations will appear in this dashboard.', 'gutenverse-form')}</p>
                        <div className="dashboard-actions">
                            <a className="dashboard-button dashboard-button--primary" href={config.entriesUrl}>{__('View Entries', 'gutenverse-form')}</a>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="gutenverse-form-admin-dashboard__list dashboard-grid">
                    <div className="dashboard-panel dashboard-panel--wide dashboard-panel--chart">
                        <div className="dashboard-block__header">
                            <div>
                                <h2>{sprintf(__('Last %s Days', 'gutenverse-form'), range)}</h2>
                                <div className="dashboard-form-card__meta">{sprintf(__('Daily entries for the last %s days.', 'gutenverse-form'), range)}</div>
                            </div>
                            <div className="dashboard-range-toggle" aria-label={__('Chart date range', 'gutenverse-form')}>
                                <button type="button" className={range === '7' ? 'active' : ''} onClick={() => setRange('7')}>{__('7 days', 'gutenverse-form')}</button>
                                <button type="button" className={range === '30' ? 'active' : ''} onClick={() => setRange('30')}>{__('30 days', 'gutenverse-form')}</button>
                            </div>
                        </div>
                        <div className="trend-chart trend-chart--compact">
                            <TrendChart trend={trend} />
                        </div>
                    </div>

                    <div className="dashboard-masonry">
                        <Panel title={__('Needs Attention', 'gutenverse-form')} className="dashboard-panel--attention">
                            {data.needsAttention?.length ? data.needsAttention.map((form) => {
                                const primaryLocation = form.locations?.[0];
                                return (
                                    <Row
                                        key={form.id}
                                        title={form.title}
                                        meta={form.attention_reason}
                                        actions={primaryLocation?.edit_url && <a href={primaryLocation.edit_url}>{__('Edit Post', 'gutenverse-form')}</a>}
                                    />
                                );
                            }) : <EmptyNote>{__('Nothing urgent detected right now.', 'gutenverse-form')}</EmptyNote>}
                        </Panel>

                        <Panel title={__('Top Entry Sources', 'gutenverse-form')}>
                            {data.topSources?.length ? data.topSources.map((source) => (
                                <Row
                                    key={source.id}
                                    title={source.title}
                                    meta={sprintf(__('%1$s entries • %2$s', 'gutenverse-form'), source.count, source.type)}
                                    actions={source.edit_url && <a href={source.edit_url}>{__('Edit', 'gutenverse-form')}</a>}
                                />
                            )) : <EmptyNote>{__('Entry source data will appear after submissions are linked to posts or pages.', 'gutenverse-form')}</EmptyNote>}
                        </Panel>

                        {!!data.unusedForms?.length && (
                            <Panel title={__('Unused Form Actions', 'gutenverse-form')}>
                                {data.unusedForms.map((form) => (
                                    <Row
                                        key={form.id}
                                        title={form.title}
                                        meta={sprintf(__('No live location • Updated %s', 'gutenverse-form'), form.modified)}
                                        actions={(
                                            <>
                                                <span className="status-badge">{__('No live post', 'gutenverse-form')}</span>
                                                <button
                                                    type="button"
                                                    className="dashboard-row-delete"
                                                    aria-label={__('Delete unused form action', 'gutenverse-form')}
                                                    title={__('Delete unused form action', 'gutenverse-form')}
                                                    onClick={() => {
                                                        setPendingDelete(form);
                                                        setDeleteError('');
                                                    }}
                                                >
                                                    <IconTrashSVG size={16} aria-hidden="true" focusable="false" />
                                                </button>
                                            </>
                                        )}
                                    />
                                ))}
                            </Panel>
                        )}

                        <Panel title={__('Top Forms', 'gutenverse-form')}>
                            {(data.formsByEntries || []).slice(0, 3).map((form) => {
                                const primaryLocation = form.locations?.[0];
                                return (
                                    <Row
                                        key={form.id}
                                        title={form.title}
                                        meta={sprintf(__('%1$s total • %2$s this week', 'gutenverse-form'), form.total_entries, form.entries_last_week)}
                                        actions={primaryLocation?.edit_url && <a href={primaryLocation.edit_url}>{__('Edit', 'gutenverse-form')}</a>}
                                    />
                                );
                            })}
                        </Panel>

                        <Panel title={__('Recent Activity', 'gutenverse-form')}>
                            {recentForms.length ? recentForms.map((form) => {
                                const primaryLocation = form.locations?.[0];
                                return (
                                    <Row
                                        key={form.id}
                                        title={form.title}
                                        meta={sprintf(__('Last entry: %s', 'gutenverse-form'), form.last_entry_date)}
                                        actions={primaryLocation?.edit_url && <a href={primaryLocation.edit_url}>{__('Edit', 'gutenverse-form')}</a>}
                                    />
                                );
                            }) : <EmptyNote>{__('No recent entry activity yet.', 'gutenverse-form')}</EmptyNote>}
                        </Panel>
                    </div>
                </div>
            )}

            <DeleteModal
                form={pendingDelete}
                deleting={deleting}
                error={deleteError}
                onCancel={() => !deleting && setPendingDelete(null)}
                onConfirm={deleteUnusedForm}
            />
        </div>
    );
};

export default FormDashboard;
