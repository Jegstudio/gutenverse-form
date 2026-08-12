import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { applyFilters, hasFilter } from '@wordpress/hooks';
import { ButtonUpgradePro } from 'gutenverse-core/components';
import { IconCloseSVG, IconEyeSVG, IconSearchSVG, IconTrashSVG } from 'gutenverse-core/icons';
import { signal } from 'gutenverse-core/editor-helper';
import { ActivateLicenseButton, hasProLicenseData, strongDescription } from './helper';

const defaultCapabilities = {
    viewAll: false,
    export: false,
    filter: false,
    olderDetails: false,
};
const entryListFilterWaitDelay = 1000;
const proEntryListContentFilter = 'gutenverse-form.pro-entry-list-content';
const entriesPerPage = 10;

const OpenNewTabIcon = ({ size = 12, ...props }) => (
    <svg {...props} width={size} height={size} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M5 3H3v10h10v-2h1v2.5l-.5.5h-11l-.5-.5v-11l.5-.5H5v1zm3-1h6v6h-1V3.707L7.354 9.354l-.708-.708L12.293 3H8V2z" />
    </svg>
);

const getConfig = () => window?.GutenverseConfig?.entryList || {};
const hasEntryListFilter = () => hasFilter(proEntryListContentFilter);
const shouldWaitForEntryListFilters = () => !hasEntryListFilter();

const normalizeCapabilities = (capabilities = {}) => ({
    ...defaultCapabilities,
    ...capabilities,
});

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

const isValidDateParts = (year, month, day) => {
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
};

const normalizeExactDate = value => {
    const trimmedValue = String(value || '').trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
        return '';
    }

    const [year, month, day] = trimmedValue.split('-').map(Number);

    return isValidDateParts(year, month, day) ? trimmedValue : '';
};

const DATE_FILTER_OPTIONS = [
    { value: '', label: __('All Dates', 'gutenverse-form') },
    { value: 'current_month', label: __('Current Month', 'gutenverse-form') },
    { value: 'last_7_days', label: __('Last 7 Days', 'gutenverse-form') },
    { value: 'custom', label: __('Custom Range', 'gutenverse-form') },
];

const hiddenDateInputStyle = {
    position: 'absolute',
    inset: 0,
    opacity: 0,
    pointerEvents: 'none',
    width: '100%',
    height: '100%',
};

const toDateString = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getCurrentMonthValue = () => {
    const now = new Date();

    return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}`;
};

const getLast7DaysRange = () => {
    const end = new Date();
    const start = new Date(end);

    start.setDate(end.getDate() - 6);

    return {
        dateFrom: toDateString(start),
        dateTo: toDateString(end),
    };
};

const getDateFilterValue = (query = {}) => {
    if (query.dateFilter) {
        return query.dateFilter;
    }

    if (query.datePreset) {
        return query.datePreset;
    }

    if (query.dateFrom || query.dateTo) {
        return 'custom';
    }

    if (query.month) {
        return 'current_month';
    }

    return '';
};

const getInitialQuery = (capabilities) => {
    const params = new URLSearchParams(window.location.search);
    const requestedView = params.get('view');
    const requestedPerPage = Number(params.get('per_page') || params.get('perPage') || 0);
    const hasRequestedFilter = Boolean(
        params.get('form_id') ||
        params.get('source_id') ||
        params.get('month') ||
        params.get('m') ||
        params.get('date_filter') ||
        params.get('date_from') ||
        params.get('date_to') ||
        params.get('date') ||
        params.get('search')
    );
    const view = capabilities.viewAll ? 'all' : 'recent';

    return {
        view,
        page: Math.max(1, Number(params.get('paged') || params.get('page_num') || 1)),
        perPage: requestedPerPage > 0 ? requestedPerPage : entriesPerPage,
        formId: params.get('form_id') || '',
        sourceId: params.get('source_id') || '',
        month: normalizeMonth(params.get('month') || params.get('m') || ''),
        dateFilter: params.get('date_filter') || '',
        dateFrom: normalizeExactDate(params.get('date_from') || params.get('date') || ''),
        dateTo: normalizeExactDate(params.get('date_to') || params.get('date') || ''),
        search: params.get('search') || '',
    };
};

const getPageLabel = (data, query) => {
    const total = data?.total || 0;
    const perPage = data?.perPage || query.perPage;
    const page = data?.page || query.page;
    if (perPage < 1) {
        return sprintf(__('%1$s-%2$s of %3$s', 'gutenverse-form'), total ? 1 : 0, total, total);
    }
    const start = total ? ((page - 1) * perPage) + 1 : 0;
    const end = total ? Math.min(total, page * perPage) : 0;

    return sprintf(__('%1$s-%2$s of %3$s', 'gutenverse-form'), start, end, total);
};

const buildPath = (config, query, capabilities) => {
    const params = new URLSearchParams();
    const view = capabilities.viewAll ? query.view : 'recent';

    params.set('view', view);
    params.set('page', String(query.page));
    if ((query.perPage || 0) > 0) {
        params.set('per_page', String(query.perPage));
    }

    if (capabilities.filter && view === 'all') {
        if (query.formId) {
            params.set('form_id', query.formId);
        }

        if (query.sourceId) {
            params.set('source_id', query.sourceId);
        }

        if (query.month) {
            params.set('month', query.month);
        }

        if (query.dateFilter) {
            params.set('date_filter', query.dateFilter);
        }

        if (query.dateFrom) {
            params.set('date_from', query.dateFrom);
        }

        if (query.dateTo) {
            params.set('date_to', query.dateTo);
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
            <h2>{__('Do Not Let Older Leads Stay Hidden', 'gutenverse-form')}</h2>
            <p>{strongDescription(__('Your free archive only shows the newest entries. <strong>Upgrade to PRO</strong> to reveal older submissions, export the full record, and filter missed opportunities before they go cold.', 'gutenverse-form'))}</p>
            <ul>
                <li><EntryListCrownIcon />{__('Reveal Hidden Entries', 'gutenverse-form')}</li>
                <li><EntryListCrownIcon />{__('Export the Full Record', 'gutenverse-form')}</li>
                <li><EntryListCrownIcon />{__('Find Missed Opportunities', 'gutenverse-form')}</li>
                <li><EntryListCrownIcon />{__('Open Older Details', 'gutenverse-form')}</li>
            </ul>
        </div>
        {hasProLicenseData() ? (
            <ActivateLicenseButton />
        ) : (
            <ButtonUpgradePro
                text={__('Upgrade to PRO', 'gutenverse-form')}
                isBanner={true}
                location="entry-list"
                link={config.upgradeProUrl}
                customStyles={{ padding: '10px 14px' }}
            />
        )}
    </div>
);

const FilterDropdown = ({ ariaLabel, icon, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const listboxIdRef = useRef(`entry-list-filter-${Math.random().toString(36).slice(2)}`);
    const selectedOption = options.find(option => option.value === `${value}`) || options[0];

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!wrapperRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div
            ref={wrapperRef}
            className={`entry-list-custom-select${isOpen ? ' entry-list-custom-select--open' : ''}`}
        >
            <button
                type="button"
                className="entry-list-custom-select__trigger"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listboxIdRef.current}
                onClick={() => setIsOpen(current => !current)}
            >
                <span className="entry-list-custom-select__label">{selectedOption.label}</span>
            </button>
            <select
                value={value}
                aria-label={ariaLabel}
                onChange={event => onChange(event.target.value)}
                tabIndex={-1}
                aria-hidden="true"
                className="entry-list-custom-select__native"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            {isOpen && (
                <div
                    className="entry-list-custom-select__menu"
                    id={listboxIdRef.current}
                    role="listbox"
                    aria-label={ariaLabel}
                >
                    {options.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={selectedOption.value === option.value}
                            className={`entry-list-custom-select__option${selectedOption.value === option.value ? ' is-active' : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
            {icon}
        </div>
    );
};

const CustomDateField = ({ ariaLabel, placeholder, value, onChange, icon }) => {
    const inputRef = useRef(null);

    const openPicker = () => {
        if (!inputRef.current) {
            return;
        }

        if (typeof inputRef.current.showPicker === 'function') {
            inputRef.current.showPicker();
            return;
        }

        inputRef.current.focus();
        inputRef.current.click();
    };

    return (
        <div
            className="entry-list-custom-select entry-list-custom-select--date"
            style={{ position: 'relative' }}
        >
            <button
                type="button"
                className="entry-list-custom-select__trigger"
                aria-label={ariaLabel}
                onClick={openPicker}
            >
                <span className="entry-list-custom-select__label">
                    {value || placeholder}
                </span>
            </button>
            <input
                ref={inputRef}
                type="date"
                value={value || ''}
                aria-label={ariaLabel}
                onChange={event => onChange(event.target.value)}
                className="entry-list-custom-select__native"
                tabIndex={-1}
                style={hiddenDateInputStyle}
            />
            {icon}
        </div>
    );
};

const EntryListControls = ({
    capabilities = {},
    data,
    query,
    searchDraft,
    setQuery,
    setSearchDraft,
}) => {
    if (!capabilities.filter || !query || !setQuery || !setSearchDraft) {
        return null;
    }

    const forms = Array.isArray(data?.forms) ? data.forms : [];
    const dateFilterValue = getDateFilterValue(query);
    const formOptions = [
        { value: '', label: __('All Forms', 'gutenverse-form') },
        ...forms.map(form => ({ value: `${form.id}`, label: form.title })),
    ];
    const formIcon = (
        <svg className="entry-list-custom-select__icon" width="25" height="16" viewBox="0 0 25 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0.5" y1="-2.18557e-08" x2="0.500001" y2="16" stroke="#BDBEBF" />
            <path d="M24.3164 4.93555L18.2148 11.5H17.7812L11.6826 4.93555L11.8701 4.7334L17.6328 10.9355L17.999 11.3301L18.3652 10.9355L24.1279 4.7334L24.3164 4.93555Z" fill="#BDBEBF" stroke="#BDBEBF" />
        </svg>
    );
    const dateIcon = (
        <svg className="entry-list-custom-select__icon" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.0833 3.25H2.41667C1.49619 3.25 0.75 3.99619 0.75 4.91667V14.0833C0.75 15.0038 1.49619 15.75 2.41667 15.75H14.0833C15.0038 15.75 15.75 15.0038 15.75 14.0833V4.91667C15.75 3.99619 15.0038 3.25 14.0833 3.25Z" stroke="#99A2A9" strokeWidth="1.5" />
            <path d="M0.75 6.58333C0.75 5.01167 0.75 4.22667 1.23833 3.73833C1.72667 3.25 2.51167 3.25 4.08333 3.25H12.4167C13.9883 3.25 14.7733 3.25 15.2617 3.73833C15.75 4.22667 15.75 5.01167 15.75 6.58333H0.75Z" fill="#99A2A9" />
            <path d="M4.08398 0.75V3.25M12.4173 0.75V3.25" stroke="#99A2A9" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );

    const handleDateFilterChange = (value) => {
        setQuery(current => {
            const nextQuery = {
                ...current,
                dateFilter: value,
                datePreset: value,
                month: '',
                dateFrom: '',
                dateTo: '',
                page: 1,
                view: 'all',
            };

            if (value === 'current_month') {
                nextQuery.month = getCurrentMonthValue();
            }

            if (value === 'last_7_days') {
                const range = getLast7DaysRange();
                nextQuery.dateFrom = range.dateFrom;
                nextQuery.dateTo = range.dateTo;
            }

            return nextQuery;
        });
    };

    return (
        <div className="entry-list-controls">
            <form
                className="entry-list-search"
                onSubmit={event => {
                    event.preventDefault();
                    setQuery(current => ({ ...current, search: searchDraft.trim(), page: 1, view: 'all' }));
                }}
            >
                <IconSearchSVG aria-hidden="true" focusable="false" />
                <input
                    type="search"
                    value={searchDraft}
                    placeholder={__('Search entries', 'gutenverse-form')}
                    onChange={event => setSearchDraft(event.target.value)}
                />
                <button type="submit">{__('Search', 'gutenverse-form')}</button>
            </form>

            <div className="entry-list-filter-controls">
                <div>
                    <FilterDropdown
                        ariaLabel={__('Filter by form', 'gutenverse-form')}
                        icon={formIcon}
                        options={formOptions}
                        value={query.formId}
                        onChange={formId => setQuery(current => ({ ...current, formId, page: 1, view: 'all' }))}
                    />
                </div>

                <div>
                    <FilterDropdown
                        ariaLabel={__('Filter by date', 'gutenverse-form')}
                        icon={dateIcon}
                        options={DATE_FILTER_OPTIONS}
                        value={dateFilterValue}
                        onChange={handleDateFilterChange}
                    />
                </div>

                {dateFilterValue === 'custom' && (
                    <>
                        <CustomDateField
                            value={query.dateFrom || ''}
                            ariaLabel={__('Filter from date', 'gutenverse-form')}
                            placeholder={__('From date', 'gutenverse-form')}
                            onChange={dateFrom => setQuery(current => ({
                                ...current,
                                dateFilter: 'custom',
                                datePreset: 'custom',
                                month: '',
                                dateFrom,
                                page: 1,
                                view: 'all',
                            }))}
                            icon={dateIcon}
                        />

                        <CustomDateField
                            value={query.dateTo || ''}
                            ariaLabel={__('Filter to date', 'gutenverse-form')}
                            placeholder={__('To date', 'gutenverse-form')}
                            onChange={dateTo => setQuery(current => ({
                                ...current,
                                dateFilter: 'custom',
                                datePreset: 'custom',
                                month: '',
                                dateTo,
                                page: 1,
                                view: 'all',
                            }))}
                            icon={dateIcon}
                        />
                    </>
                )}

                <button
                    type="button"
                    className="entry-list-button"
                    onClick={() => {
                        setSearchDraft('');
                        setQuery(current => ({
                            ...current,
                            formId: '',
                            dateFilter: '',
                            datePreset: '',
                            month: '',
                            dateFrom: '',
                            dateTo: '',
                            search: '',
                            page: 1,
                            view: 'all',
                        }));
                    }}
                >
                    {__('Reset', 'gutenverse-form')}
                </button>
            </div>
        </div>
    );
};

const EntryListFooter = ({ data, query, setQuery }) => {
    const totalPages = data?.totalPages || 1;

    if (!query || !setQuery || query.view !== 'all' || totalPages <= 1) {
        return null;
    }

    return (
        <div className="entry-list-pagination">
            <button
                type="button"
                disabled={query.page <= 1}
                onClick={() => setQuery(current => ({ ...current, page: Math.max(1, current.page - 1) }))}
            >
                {__('Previous', 'gutenverse-form')}
            </button>
            <span>{sprintf(__('Page %1$s of %2$s', 'gutenverse-form'), data.page || query.page, totalPages)}</span>
            <button
                type="button"
                disabled={query.page >= totalPages}
                onClick={() => setQuery(current => ({ ...current, page: current.page + 1 }))}
            >
                {__('Next', 'gutenverse-form')}
            </button>
        </div>
    );
};

const EntryListActions = ({ capabilities = {}, config = {}, limit = 10, query, setQuery }) => {
    if (!capabilities.viewAll || !query || !setQuery) {
        return null;
    }

    const buildExportUrl = () => {
        const params = new URLSearchParams();

        params.set('view', 'all');

        if (capabilities.filter) {
            if (query.formId) {
                params.set('form_id', query.formId);
            }

            if (query.sourceId) {
                params.set('source_id', query.sourceId);
            }

            if (query.month) {
                params.set('month', query.month);
            }

            if (query.dateFrom) {
                params.set('date_from', query.dateFrom);
            }

            if (query.dateTo) {
                params.set('date_to', query.dateTo);
            }

            if (query.search) {
                params.set('search', query.search);
            }
        }

        const exportUrl = config.exportUrl || '#';
        const separator = exportUrl.includes('?') ? '&' : '?';

        return `${exportUrl}${separator}${params.toString()}`;
    };

    return (
        <div className="entry-list-actions">
            {capabilities.export && (
                <a className="entry-list-button entry-list-button--primary" href={buildExportUrl()}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.80732 5.13928L7.33398 3.60595V9.99928C7.33398 10.1761 7.40422 10.3457 7.52925 10.4707C7.65427 10.5957 7.82384 10.6659 8.00065 10.6659C8.17746 10.6659 8.34703 10.5957 8.47205 10.4707C8.59708 10.3457 8.66732 10.1761 8.66732 9.99928V3.60595L10.194 5.13928C10.256 5.20177 10.3297 5.25136 10.4109 5.28521C10.4922 5.31905 10.5793 5.33648 10.6673 5.33648C10.7553 5.33648 10.8425 5.31905 10.9237 5.28521C11.0049 5.25136 11.0787 5.20177 11.1406 5.13928C11.2031 5.0773 11.2527 5.00357 11.2866 4.92233C11.3204 4.84109 11.3378 4.75395 11.3378 4.66595C11.3378 4.57794 11.3204 4.4908 11.2866 4.40956C11.2527 4.32832 11.2031 4.25459 11.1406 4.19261L8.47398 1.52595C8.41058 1.46525 8.33582 1.41768 8.25398 1.38595C8.09168 1.31927 7.90962 1.31927 7.74732 1.38595C7.66548 1.41768 7.59072 1.46525 7.52732 1.52595L4.86065 4.19261C4.79849 4.25477 4.74918 4.32857 4.71554 4.40978C4.6819 4.491 4.66459 4.57804 4.66459 4.66595C4.66459 4.75385 4.6819 4.8409 4.71554 4.92211C4.74918 5.00333 4.79849 5.07712 4.86065 5.13928C4.92281 5.20144 4.9966 5.25075 5.07782 5.28439C5.15903 5.31803 5.24608 5.33534 5.33398 5.33534C5.42189 5.33534 5.50894 5.31803 5.59015 5.28439C5.67137 5.25075 5.74516 5.20144 5.80732 5.13928ZM14.0007 9.33261C13.8238 9.33261 13.6543 9.40285 13.5292 9.52788C13.4042 9.6529 13.334 9.82247 13.334 9.99928V12.6659C13.334 12.8428 13.2637 13.0123 13.1387 13.1374C13.0137 13.2624 12.8441 13.3326 12.6673 13.3326H3.33398C3.15717 13.3326 2.9876 13.2624 2.86258 13.1374C2.73756 13.0123 2.66732 12.8428 2.66732 12.6659V9.99928C2.66732 9.82247 2.59708 9.6529 2.47206 9.52788C2.34703 9.40285 2.17746 9.33261 2.00065 9.33261C1.82384 9.33261 1.65427 9.40285 1.52925 9.52788C1.40422 9.6529 1.33398 9.82247 1.33398 9.99928V12.6659C1.33398 13.1964 1.5447 13.7051 1.91977 14.0802C2.29484 14.4552 2.80355 14.6659 3.33398 14.6659H12.6673C13.1978 14.6659 13.7065 14.4552 14.0815 14.0802C14.4566 13.7051 14.6673 13.1964 14.6673 12.6659V9.99928C14.6673 9.82247 14.5971 9.6529 14.4721 9.52788C14.347 9.40285 14.1775 9.33261 14.0007 9.33261Z" fill="white" />
                    </svg>
                    {__('Export All Entries', 'gutenverse-form')}
                </a>
            )}
        </div>
    );
};

const EntryRow = ({ entry, deletingEntryId, onDelete }) => (
    <tr>
        <td className="entry-list-entry-title" data-label={__('Entry', 'gutenverse-form')}>
            <strong>{entry.title}</strong>
        </td>
        <td className="entry-list-form-cell" data-label={__('Form', 'gutenverse-form')}>
            <span>{entry.formTitle}</span>
        </td>
        <td className="entry-list-source-cell" data-label={__('Source', 'gutenverse-form')}>
            {entry.referralUrl ? (
                <a
                    className="entry-list-referral"
                    href={entry.referralUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={sprintf(__('%s opens in a new tab', 'gutenverse-form'), entry.referralTitle)}
                >
                    <span>{entry.referralTitle}</span>
                    <OpenNewTabIcon aria-hidden="true" focusable="false" />
                </a>
            ) : (
                <span className="entry-list-muted">{entry.referralTitle}</span>
            )}
        </td>
        <td data-label={__('Submitted', 'gutenverse-form')}>{entry.date}</td>
        <td className="entry-list-actions-cell" data-label={__('Actions', 'gutenverse-form')}>
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
                        <th>{__('Source', 'gutenverse-form')}</th>
                        <th>{__('Submitted', 'gutenverse-form')}</th>
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
    const lockedDetailNotice = useMemo(() => {
        const params = new URLSearchParams(window.location.search);

        return params.get('entry_access') === 'locked';
    }, []);

    useEffect(() => {
        setLoading(true);
        setLoadError('');

        apiFetch({ path: buildPath(config, query, capabilities) })
            .then(response => {
                const nextData = response && typeof response === 'object' ? response : {};

                setData(nextData);
                setCapabilities(normalizeCapabilities(nextData.capabilities));
                setLoading(false);
            })
            .catch(error => {
                setLoadError(error?.message || __('Could not load entries.', 'gutenverse-form'));
                setLoading(false);
            });
    }, [config, query, capabilities.viewAll, capabilities.filter]);

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

    const entries = Array.isArray(data?.entries) ? data.entries : [];
    const limit = data?.limit || config.limit || 10;
    const forms = Array.isArray(data?.forms) ? data.forms : [];
    const selectedForm = forms.find(form => String(form.id) === String(query.formId));
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
    const actions = <EntryListActions {...filterProps} />;
    const controls = <EntryListControls {...filterProps} />;
    const footer = <EntryListFooter {...filterProps} />;
    const defaultEntryListContent = data?.limited && !hasAllEntryListCapabilities(capabilities) ? <EntryListUpgrade config={config} /> : null;
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
                    <strong>{__('Older entry details are hidden.', 'gutenverse-form')}</strong>
                    <span>{__('Upgrade to PRO to inspect older submissions before valuable follow-ups go cold.', 'gutenverse-form')}</span>
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
