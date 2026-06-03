import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { applyFilters, hasFilter } from '@wordpress/hooks';
import { ButtonUpgradePro } from 'gutenverse-core/components';
import { IconCloseSVG, IconEyeSVG, IconTrashSVG } from 'gutenverse-core/icons';
import { signal } from 'gutenverse-core/editor-helper';

const defaultCapabilities = {
    viewAll: false,
    export: false,
    filter: false,
    olderDetails: false,
};
const entryListFilterWaitDelay = 1000;
const entryListActionsFilter = 'gutenverse-form.entry-list-actions';
const entryListControlsFilter = 'gutenverse-form.entry-list-controls';
const entryListFooterFilter = 'gutenverse-form.entry-list-footer';
const proEntryListContentFilter = 'gutenverse-form.pro-entry-list-content';
const entriesPerPage = 10;

const getConfig = () => window?.GutenverseConfig?.entryList || {};
const hasEntryListFilter = () => (
    hasFilter(entryListActionsFilter) ||
    hasFilter(entryListControlsFilter) ||
    hasFilter(entryListFooterFilter) ||
    hasFilter(proEntryListContentFilter)
);
const shouldWaitForEntryListFilters = () => !hasEntryListFilter();

const normalizeCapabilities = (capabilities = {}) => ({
    ...defaultCapabilities,
    ...capabilities,
});

const hasExplicitRecentView = () => {
    const params = new URLSearchParams(window.location.search);

    return params.get('view') === 'recent';
};

const hasAllEntryListCapabilities = (capabilities = {}) => (
    capabilities.viewAll &&
    capabilities.export &&
    capabilities.filter &&
    capabilities.olderDetails
);

const normalizeMonth = value => {
    if (/^\d{6}$/.test(value)) {
        return `${value.slice(0, 4)}-${value.slice(4, 6)}`;
    }

    if (/^\d{4}-\d{2}$/.test(value)) {
        return value;
    }

    return '';
};

const getInitialQuery = (capabilities) => {
    const params = new URLSearchParams(window.location.search);
    const requestedView = params.get('view');
    const hasRequestedFilter = Boolean(params.get('form_id') || params.get('month') || params.get('m') || params.get('search'));
    const view = capabilities.viewAll && (requestedView !== 'recent' || hasRequestedFilter) ? 'all' : 'recent';

    return {
        view,
        page: Math.max(1, Number(params.get('paged') || params.get('page_num') || 1)),
        perPage: entriesPerPage,
        formId: params.get('form_id') || '',
        month: normalizeMonth(params.get('month') || params.get('m') || ''),
        search: params.get('search') || '',
    };
};

const getPageLabel = (data, query) => {
    const total = data?.total || 0;
    const perPage = data?.perPage || query.perPage;
    const page = data?.page || query.page;
    const start = total ? ((page - 1) * perPage) + 1 : 0;
    const end = total ? Math.min(total, page * perPage) : 0;

    return sprintf(__('%1$s-%2$s of %3$s', 'gutenverse-form'), start, end, total);
};

const buildPath = (config, query, capabilities) => {
    const params = new URLSearchParams();
    const view = capabilities.viewAll ? query.view : 'recent';

    params.set('view', view);
    params.set('page', String(query.page));
    params.set('per_page', String(Math.min(query.perPage || entriesPerPage, entriesPerPage)));

    if (capabilities.filter && view === 'all') {
        if (query.formId) {
            params.set('form_id', query.formId);
        }

        if (query.month) {
            params.set('month', query.month);
        }

        if (query.search) {
            params.set('search', query.search);
        }
    }

    return `${config.apiPath || '/gutenverse-form-client/v1/entries'}?${params.toString()}`;
};

const buildDeletePath = (config, entryId) => {
    const apiPath = config.apiPath || '/gutenverse-form-client/v1/entries';

    return `${apiPath.replace(/\/$/, '')}/${entryId}`;
};

const SkeletonLine = ({ className = '' }) => <span className={`entry-list-skeleton-line ${className}`} aria-hidden="true" />;

const EntryListSkeleton = () => (
    <div className="gutenverse-form-entry-list__skeleton" aria-hidden="true">
        <div className="entry-list-skeleton-header">
            <SkeletonLine className="entry-list-skeleton-title" />
            <SkeletonLine className="entry-list-skeleton-copy" />
        </div>
        {[1, 2, 3, 4].map(item => (
            <div className="entry-list-skeleton-row" key={item}>
                <SkeletonLine className="entry-list-skeleton-row-title" />
                <SkeletonLine className="entry-list-skeleton-row-meta" />
                <SkeletonLine className="entry-list-skeleton-row-action" />
            </div>
        ))}
    </div>
);

const ProBadge = () => <span className="entry-list-pro-badge">{__('Pro', 'gutenverse-form')}</span>;

const EntryListCrownIcon = () => (
    <span className="entry-list-crown-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="20" rx="10" fill="#E62E68" />
            <path d="M6.11111 12.25L5 6.0625L8.05556 8.875L10 5.5L11.9444 8.875L15 6.0625L13.8889 12.25H6.11111ZM13.8889 13.9375C13.8889 14.275 13.6667 14.5 13.3333 14.5H6.66667C6.33333 14.5 6.11111 14.275 6.11111 13.9375V13.375H13.8889V13.9375Z" fill="white" />
        </svg>
    </span>
);

const EntryListUpgrade = ({ config }) => (
    <div className="entry-list-upgrade">
        <div className="entry-list-upgrade__content">
            <h2>{__('Unlock the Complete Entry Archive', 'gutenverse-form')}</h2>
            <ul>
                <li><EntryListCrownIcon />{__('View All Entries', 'gutenverse-form')}</li>
                <li><EntryListCrownIcon />{__('Export All Entries', 'gutenverse-form')}</li>
                <li><EntryListCrownIcon />{__('Filter All Entries', 'gutenverse-form')}</li>
                <li><EntryListCrownIcon />{__('Access Older Entry Details', 'gutenverse-form')}</li>
            </ul>
        </div>
        <ButtonUpgradePro
            text={__('Upgrade to PRO', 'gutenverse-form')}
            isBanner={true}
            location="entry-list"
            link={config.upgradeProUrl}
            customStyles={{ padding: '10px 14px' }}
        />
    </div>
);

const EntryPreview = ({ entry }) => {
    if (!entry.preview?.length) {
        return <span className="entry-list-muted">{__('No submitted fields', 'gutenverse-form')}</span>;
    }

    return (
        <div className="entry-list-field-preview">
            {entry.preview.map((field, index) => (
                <span key={`${entry.id}-${field.id || index}`}>
                    <strong>{field.id || __('Field', 'gutenverse-form')}:</strong>
                    {' '}
                    {field.value || __('Empty', 'gutenverse-form')}
                </span>
            ))}
        </div>
    );
};

const EntryRow = ({ entry, deletingEntryId, onDelete }) => (
    <tr>
        <td className="entry-list-entry-title">
            <strong>{entry.title}</strong>
            <span>{sprintf(__('%s submitted fields', 'gutenverse-form'), entry.fieldsCount || 0)}</span>
        </td>
        <td>
            <span>{entry.formTitle}</span>
            {entry.referralUrl ? (
                <a className="entry-list-referral" href={entry.referralUrl} target="_blank" rel="noreferrer">{entry.referralTitle}</a>
            ) : (
                <span className="entry-list-muted">{entry.referralTitle}</span>
            )}
        </td>
        <td>{entry.date}</td>
        <td><EntryPreview entry={entry} /></td>
        <td className="entry-list-actions-cell">
            <div className="entry-list-row-actions">
                {entry.canViewDetail ? (
                    <a className="entry-list-icon-button" href={entry.detailUrl} aria-label={__('View entry details', 'gutenverse-form')} title={__('View entry details', 'gutenverse-form')}>
                        <IconEyeSVG fill="currentColor" aria-hidden="true" focusable="false" />
                    </a>
                ) : (
                    <span className="entry-list-locked-detail">
                        {__('Locked', 'gutenverse-form')}
                        <ProBadge />
                    </span>
                )}
                <button
                    type="button"
                    className="entry-list-icon-button entry-list-icon-button--danger"
                    disabled={deletingEntryId === entry.id}
                    onClick={() => onDelete(entry)}
                    aria-label={__('Delete entry', 'gutenverse-form')}
                    title={__('Delete entry', 'gutenverse-form')}
                >
                    <IconTrashSVG size={16} aria-hidden="true" focusable="false" />
                </button>
            </div>
        </td>
    </tr>
);

const EntryListTable = ({ entries, deletingEntryId, onDelete }) => {
    if (!entries.length) {
        return (
            <div className="entry-list-empty">
                <h2>{__('No entries found', 'gutenverse-form')}</h2>
                <p>{__('New submissions will appear here after a visitor submits a form.', 'gutenverse-form')}</p>
            </div>
        );
    }

    return (
        <div className="entry-list-table-wrap">
            <table className="entry-list-table">
                <thead>
                    <tr>
                        <th>{__('Entry', 'gutenverse-form')}</th>
                        <th>{__('Form', 'gutenverse-form')}</th>
                        <th>{__('Submitted', 'gutenverse-form')}</th>
                        <th>{__('Preview', 'gutenverse-form')}</th>
                        <th>{__('Actions', 'gutenverse-form')}</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map(entry => (
                        <EntryRow
                            deletingEntryId={deletingEntryId}
                            entry={entry}
                            key={entry.id}
                            onDelete={onDelete}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const EntryDeleteModal = ({ deleting, error, entry, onCancel, onConfirm }) => {
    if (!entry) {
        return null;
    }

    return (
        <div className="entry-delete-modal" aria-hidden="false">
            <div className="entry-delete-modal__backdrop" onClick={deleting ? undefined : onCancel} />
            <div className="entry-delete-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="entry-delete-title">
                <button
                    type="button"
                    className="entry-delete-modal__close"
                    aria-label={__('Close dialog', 'gutenverse-form')}
                    disabled={deleting}
                    onClick={onCancel}
                >
                    <IconCloseSVG size={24} aria-hidden="true" focusable="false" />
                </button>
                <div className="entry-delete-modal__body">
                    <div className="entry-delete-modal__icon" aria-hidden="true">
                        <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24.4019 8.25C25.5566 6.25 28.4434 6.25 29.5981 8.25L49.0836 42C50.2383 44 48.7949 46.5 46.4856 46.5H7.51443C5.20503 46.5 3.76165 44 4.91635 42L24.4019 8.25Z" fill="currentColor" />
                            <path d="M24.5 20.25H29.5V33H24.5V20.25Z" fill="#fff" />
                            <path d="M24.5 37H29.5V42H24.5V37Z" fill="#fff" />
                        </svg>
                    </div>
                    <h2 id="entry-delete-title">{__('Delete Entries Data', 'gutenverse-form')}</h2>
                    <p>{__('Are you sure you want to delete this entries? This cannot be undone and will permanently remove the action data.', 'gutenverse-form')}</p>
                    {error && <p className="entry-delete-modal__error">{error}</p>}
                </div>
                <div className="entry-delete-modal__actions">
                    <button type="button" className="entry-delete-modal__cancel" onClick={onCancel} disabled={deleting}>
                        {__('Cancel', 'gutenverse-form')}
                    </button>
                    <button type="button" className="entry-delete-modal__confirm" onClick={onConfirm} disabled={deleting}>
                        {deleting ? __('Deleting...', 'gutenverse-form') : __('Delete Permanently', 'gutenverse-form')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const EntryList = () => {
    const config = useMemo(() => getConfig(), []);
    const [capabilities, setCapabilities] = useState(() => normalizeCapabilities(config.capabilities));
    const [query, setQuery] = useState(() => getInitialQuery(normalizeCapabilities(config.capabilities)));
    const [searchDraft, setSearchDraft] = useState(query.search);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [deletingEntryId, setDeletingEntryId] = useState(0);
    const [deleteEntryTarget, setDeleteEntryTarget] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [filtersSettled, setFiltersSettled] = useState(() => !shouldWaitForEntryListFilters());
    const [entryListFilterVersion, setEntryListFilterVersion] = useState(0);
    const shouldDefaultToAllEntries = useMemo(() => !hasExplicitRecentView(), []);
    const lockedDetailNotice = useMemo(() => {
        const params = new URLSearchParams(window.location.search);

        return params.get('entry_access') === 'locked';
    }, []);

    useEffect(() => {
        setLoading(true);
        setLoadError('');

        apiFetch({ path: buildPath(config, query, capabilities) })
            .then(response => {
                setData(response);
                setCapabilities(normalizeCapabilities(response.capabilities));
                setLoading(false);
            })
            .catch(error => {
                setLoadError(error?.message || __('Could not load entries.', 'gutenverse-form'));
                setLoading(false);
            });
    }, [config, query, capabilities.viewAll, capabilities.filter]);

    useEffect(() => {
        if (!capabilities.viewAll || !shouldDefaultToAllEntries) {
            return;
        }

        setQuery(current => current.view === 'all' ? current : {
            ...current,
            page: 1,
            view: 'all',
        });
    }, [capabilities.viewAll, shouldDefaultToAllEntries]);

    useEffect(() => {
        let fallbackTimer = null;

        const clearFallbackTimer = () => {
            if (fallbackTimer) {
                clearTimeout(fallbackTimer);
                fallbackTimer = null;
            }
        };

        const refreshEntryListFilters = () => {
            setFiltersSettled(true);
            setEntryListFilterVersion(current => current + 1);
            clearFallbackTimer();

            return true;
        };

        const settleWhenReady = () => {
            if (shouldWaitForEntryListFilters()) {
                return false;
            }

            return refreshEntryListFilters();
        };

        const filtersReady = settleWhenReady();

        if (!filtersReady) {
            fallbackTimer = setTimeout(() => {
                refreshEntryListFilters();
            }, entryListFilterWaitDelay);
        }

        const bindEntryList = signal.afterFilterSignal.add(settleWhenReady);

        return () => {
            clearFallbackTimer();
            bindEntryList.detach();
        };
    }, []);

    const entries = data?.entries || [];
    const limit = data?.limit || config.limit || 10;
    const selectedForm = (data?.forms || []).find(form => String(form.id) === String(query.formId));
    const title = query.formId && selectedForm?.title
        ? sprintf(__('Entries from %s', 'gutenverse-form'), selectedForm.title)
        : __('Entries from All Forms', 'gutenverse-form');
    const countLabel = data ? getPageLabel(data, query) : '';
    const filterProps = {
        data,
        query,
        setQuery,
        capabilities,
        config,
        limit,
        searchDraft,
        setSearchDraft,
        entriesPerPage,
        filterVersion: entryListFilterVersion,
    };
    const actions = applyFilters(entryListActionsFilter, null, filterProps);
    const controls = applyFilters(entryListControlsFilter, null, filterProps);
    const footer = applyFilters(entryListFooterFilter, null, filterProps);
    const defaultEntryListContent = hasAllEntryListCapabilities(capabilities) ? null : <EntryListUpgrade config={config} />;
    const proEntryListContent = applyFilters(proEntryListContentFilter, defaultEntryListContent, filterProps);

    const openDeleteEntryModal = (entry) => {
        if (!entry?.id || deletingEntryId) {
            return;
        }

        setDeleteError('');
        setDeleteEntryTarget(entry);
    };

    const closeDeleteEntryModal = () => {
        if (deletingEntryId) {
            return;
        }

        setDeleteError('');
        setDeleteEntryTarget(null);
    };

    const confirmDeleteEntry = () => {
        if (!deleteEntryTarget?.id || deletingEntryId) {
            return;
        }

        setDeletingEntryId(deleteEntryTarget.id);
        setDeleteError('');
        setLoadError('');

        apiFetch({
            path: buildDeletePath(config, deleteEntryTarget.id),
            method: 'DELETE',
        })
            .then(() => {
                setDeleteEntryTarget(null);
                setQuery(current => ({
                    ...current,
                    page: entries.length === 1 && current.page > 1 ? current.page - 1 : current.page,
                }));
            })
            .catch(error => {
                setDeleteError(error?.message || __('Could not delete entry. Please try again.', 'gutenverse-form'));
            })
            .finally(() => {
                setDeletingEntryId(0);
            });
    };

    if ((loading && !data) || !filtersSettled) {
        return (
            <div className="gutenverse-form-entry-list is-loading" aria-busy="true">
                <EntryListSkeleton />
            </div>
        );
    }

    return (
        <div className="gutenverse-form-entry-list">
            <div className="gutenverse-form-entry-list__header">
                <div>
                    <div className="entry-list-title-row">
                        <h1>{title}</h1>
                        {countLabel && <span className="entry-list-count">{countLabel}</span>}
                    </div>
                </div>
                {actions}
            </div>

            {lockedDetailNotice && (
                <div className="entry-list-notice">
                    <strong>{__('Older entry details are locked.', 'gutenverse-form')}</strong>
                    <span>{__('Upgrade to PRO to open details beyond the latest entries.', 'gutenverse-form')}</span>
                </div>
            )}

            {loadError && <div className="entry-list-error">{loadError}</div>}

            {controls}

            {proEntryListContent}

            <EntryListTable
                deletingEntryId={deletingEntryId}
                entries={entries}
                onDelete={openDeleteEntryModal}
            />
            {footer}

            <EntryDeleteModal
                deleting={Boolean(deletingEntryId)}
                entry={deleteEntryTarget}
                error={deleteError}
                onCancel={closeDeleteEntryModal}
                onConfirm={confirmDeleteEntry}
            />

            {loading && data && <div className="entry-list-loading-overlay">{__('Refreshing entries...', 'gutenverse-form')}</div>}
        </div>
    );
};

export default EntryList;
