import IntegrationControl from '../integration/integration-control';
import { __ } from '@wordpress/i18n';
import { AlertControl } from 'gutenverse-core/controls';

export const integrationPanel = (props) => {
    const { integration } = props;
    return [
        {
            id: 'integration-notice',
            component: AlertControl,
            show: integration?.actions?.length === 0,
            children: <>
                <span>{__('Leave this option empty if you want to apply global integrations settings')}</span>
            </>
        },
        {
            id: 'integration',
            label: __('Integration', 'gutenverse-form'),
            component: IntegrationControl,
        }
    ]
};