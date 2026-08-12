import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { LockedProSiteKeyControl } from 'gutenverse-core/controls';

export const panelSettings = (props) => {
    const siteKeyOption = [
        {
            component: LockedProSiteKeyControl,
        },
    ];

    return applyFilters(
        'gutenverse.form-input-recaptcha-site-key',
        siteKeyOption,
        props
    );
};
