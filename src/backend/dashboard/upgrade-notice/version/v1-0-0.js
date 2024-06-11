
import { __ } from '@wordpress/i18n';

export const HeaderV100 = () => {
    const { gutenverseFormAssetURL: assetURL } = window['GutenverseDashboard'];

    return (
        <div className="custom-notice-header">
            <img src={`${assetURL}/img/update-notice-form-v1.0.0-header.png`} />
            <h3 className="upgrade-notice-title">
                {__('Gutenverse Form', 'gutenverse-form')}
                &nbsp;
                <span>{__('Version 1.0.0', 'gutenverse-form')}</span>
            </h3>
        </div>
    );
};

export const ContentV100 = () => {
    // const { gutenverseFormAssetURL: assetURL } = window['GutenverseDashboard'];

    return (
        <>
            <h2 className="update-title">{__('What\'s New', 'gutenverse')}</h2>
            <p className="update-desc">{__('Gutenverse Form now is a separate plugin from Gutenverse.', 'gutenverse')}</p>
            <ol>
                <li>{__('Robust Framework', 'gutenverse')}</li>
                <p>{__('Gutenverse Form uses Gutenverse Core framework which is more robust and make Gutenverse Form can stand alone and access all Gutenverse features, such as Library Templates without Gutenverse plugin.', 'gutenverse')}</p>
                <li>{__('Compatibility with Gutenverse PRO', 'gutenverse')}</li>
                <p>{__('Add compatibility for Gutenverse PRO, which gives you much more advanced options for designing an amazing form.', 'gutenverse')}</p>
                <li>{__('Future Possibility', 'gutenverse')}</li>
                <p>{__('More possibility in the future to add more features for form only without burdening the website.', 'gutenverse')}</p>
            </ol>
        </>
    );
};

