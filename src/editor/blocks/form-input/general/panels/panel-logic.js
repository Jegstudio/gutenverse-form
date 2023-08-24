import { LockedProInputLogicControl } from 'gutenverse-core/controls';
import { applyFilters } from '@wordpress/hooks';

export const panelLogic = (props) => {
    const inputLogicOption = [
        {
            component: LockedProInputLogicControl,
        },
    ];

    return applyFilters(
        'gutenverse.input-logic',
        inputLogicOption,
        props
    );
};