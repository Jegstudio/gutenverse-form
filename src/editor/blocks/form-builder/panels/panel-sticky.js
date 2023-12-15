import { __ } from '@wordpress/i18n';
import { LockedSwitchControl } from 'gutenverse-core/controls';
import { applyFilters } from '@wordpress/hooks';

export const stickyPanel = (props) => {
    const stickyOption = [
        {
            id: 'sticky',
            label: __('Enable Sticky', 'gutenverse-form'),
            component: LockedSwitchControl,
        },
    ];

    return applyFilters(
        'gutenverse.form-builder.sticky',
        stickyOption,
        props
    );
};