import IntegrationControl from '../integration/integration-control';
import { __ } from '@wordpress/i18n';

export const integrationPanel = (props) => {
    return [
        {
            id: 'integration',
            label: __('Integration', 'gutenverse-form'),
            component: IntegrationControl,
        }
    ]
};