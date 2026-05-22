import IntegrationControl from '../integration/integration-control';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { CheckboxControl } from 'gutenverse-core/controls';

const useDashboardSettingsEnabled = (integration = {}) => {
    if (typeof integration?.useDashboardSettings === 'boolean') {
        return integration.useDashboardSettings;
    }

    return false;
};

const IntegrationPanelControl = (props) => {
    const {
        value = {},
        onValueChange,
        onLocalChange,
        customOptions = [],
        elementId,
    } = props;

    const useDashboardSettings = useDashboardSettingsEnabled(value);
    const emptyLicense = applyFilters('gutenverse.panel.tab.pro.content', true);

    const updateValue = (nextValue) => {
        onValueChange(nextValue);

        if (onLocalChange) {
            onLocalChange(nextValue);
        }
    };

    return (
        <>
            {!emptyLicense && (
                <CheckboxControl
                    label={__('Use Dashboard Settings', 'gutenverse-form')}
                    description={__('Enable this to use the global integrations configured in Dashboard settings for this form.', 'gutenverse-form')}
                    value={useDashboardSettings}
                    onValueChange={(nextValue) => updateValue({
                        ...value,
                        useDashboardSettings: nextValue,
                    })}
                />
            )}
            {!useDashboardSettings && (
                <IntegrationControl
                    value={value}
                    onValueChange={updateValue}
                    onLocalChange={updateValue}
                    customOptions={customOptions}
                    elementId={elementId}
                />
            )}
        </>
    );
};

export const integrationPanel = (props) => {
    return [
        {
            id: 'integration',
            label: __('Integration', 'gutenverse-form'),
            component: IntegrationPanelControl,
        }
    ];
};
