import { __ } from '@wordpress/i18n';
import { LockedProStickyControl, LockedSwitchControl } from 'gutenverse-core/controls';
import { applyFilters } from '@wordpress/hooks';

export const stickyPanel = (props) => {
    const stickyOption = [
        {
            component: LockedProStickyControl,
        },
    ];

    return applyFilters(
        'gutenverse.form-builder.sticky',
        stickyOption,
        props
    );
};