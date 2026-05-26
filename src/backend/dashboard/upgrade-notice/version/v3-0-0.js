import { __ } from '@wordpress/i18n';

const getAssetURL = (fileName) => {
    const { gutenverseFormAssetURL: assetURL } = window['GutenverseDashboard'];

    return `${assetURL}/img/${fileName}`;
};

const SectionTitle = ({ icon, title }) => (
    <div className="form-300-section-title">
        <img src={getAssetURL(icon)} alt="" aria-hidden="true" />
        <h2>{title}</h2>
    </div>
);

const NoticeImage = ({ fileName, alt, className = '' }) => (
    <img
        className={`form-300-media${className ? ` ${className}` : ''}`}
        src={getAssetURL(fileName)}
        alt={alt}
    />
);

export const HeaderV300 = () => (
    <div className="custom-notice-header form-300-header">
        <img
            className="form-300-header-background"
            src={getAssetURL('update-notice-3.0.0-background-hero-form.png')}
            alt=""
            aria-hidden="true"
        />
        <h3 className="upgrade-notice-title">
            {__('Gutenverse Form', 'gutenverse-form')}
            &nbsp;
            <span>{__('Version 3.0.0', 'gutenverse-form')}</span>
        </h3>
    </div>
);

export const ContentV300 = () => (
    <div className="form-300-content">
        <div className="form-300-callout">
            <strong>{__('Multi Site', 'gutenverse-form')}</strong>
            <p>
                {__('Gutenverse Form 3.0.0 improves support for multisite networks, keeping forms, entries, integrations, templates, and notices consistent across your sites.', 'gutenverse-form')}
            </p>
        </div>

        <section className="form-300-section">
            <SectionTitle
                icon="update-notice-3.0.0-iocn-new-form-dashboard.png"
                title={__('New Form Dashboard', 'gutenverse-form')}
            />
            <p>
                {__('Track submissions, monitor active forms, and jump into the most important form locations from a cleaner dashboard built for everyday form management.', 'gutenverse-form')}
            </p>
            <NoticeImage
                fileName="update-notice-3.0.0-mockup-new-form-dashboard.png"
                alt={__('New form dashboard overview', 'gutenverse-form')}
            />
            <p className="form-300-media-note">
                {__('Daily summary emails now help administrators review recent form activity and return to the dashboard with less manual checking.', 'gutenverse-form')}
            </p>
            <NoticeImage
                fileName="update-notice-3.0.0-mockup-daily-summary-email.png"
                alt={__('Daily form summary email preview', 'gutenverse-form')}
            />
        </section>

        <section className="form-300-section">
            <SectionTitle
                icon="update-notice-3.0.0-icon-new-integrations.png"
                title={__('New Integrations', 'gutenverse-form')}
            />
            <p>
                {__('Connect forms with more services, manage integrations globally, and choose the right action directly from the Form Builder settings panel.', 'gutenverse-form')}
            </p>
            <NoticeImage
                fileName="update-notice-3.0.0-mockup-new-integrations.png"
                alt={__('New form integrations dashboard and builder panel', 'gutenverse-form')}
            />
        </section>

        <section className="form-300-section">
            <SectionTitle
                icon="update-notice-3.0.0-icon-new-email-templates.png"
                title={__('New Email Templates', 'gutenverse-form')}
            />
            <p>
                {__('Confirmation and notification emails can now start from reusable templates, with clearer message settings and dynamic field tags.', 'gutenverse-form')}
            </p>
            <div className="form-300-media-grid">
                <figure>
                    <NoticeImage
                        fileName="update-notice-3.0.0-mockup-confirmation-email.png"
                        alt={__('Confirmation email template settings', 'gutenverse-form')}
                    />
                    <figcaption>{__('Confirmation Template', 'gutenverse-form')}</figcaption>
                </figure>
                <figure>
                    <NoticeImage
                        fileName="update-notice-3.0.0-mockup-notificaion-email.png"
                        alt={__('Notification email template settings', 'gutenverse-form')}
                    />
                    <figcaption>{__('Notification Template', 'gutenverse-form')}</figcaption>
                </figure>
            </div>
        </section>

        <section className="form-300-section">
            <SectionTitle
                icon="update-notice-3.0.0-icon-form-notice.png"
                title={__('Form Builder And Notice Improvements', 'gutenverse-form')}
            />
            <p>
                {__('The Form Builder now makes form actions and success notices easier to connect, so visitors get the right message after every submission.', 'gutenverse-form')}
            </p>
            <NoticeImage
                fileName="update-notice-3.0.0-mockup-new-form-notice.png"
                alt={__('New form notice block and builder settings', 'gutenverse-form')}
            />
        </section>

        <section className="form-300-section">
            <SectionTitle
                icon="update-notice-3.0.0-icon-form-entries.png"
                title={__('Better Entries, Inputs, And Form Actions', 'gutenverse-form')}
            />
            <p>
                {__('Entries and inputs are easier to maintain with CSV export, bulk input styling, and a smoother flow for creating and managing form actions.', 'gutenverse-form')}
            </p>
            <div className="form-300-media-grid">
                <figure>
                    <NoticeImage
                        fileName="update-notice-3.0.0-mockup-csv-export.png"
                        alt={__('CSV export for form entries', 'gutenverse-form')}
                    />
                    <figcaption>{__('CSV Export', 'gutenverse-form')}</figcaption>
                </figure>
                <figure>
                    <NoticeImage
                        fileName="update-notice-3.0.0-mockup-bulk-input-styling.png"
                        alt={__('Bulk input styling settings', 'gutenverse-form')}
                    />
                    <figcaption>{__('Bulk Input Styling', 'gutenverse-form')}</figcaption>
                </figure>
            </div>
            <p className="form-300-media-note">
                {__('Form actions are now handled in the builder with a clearer setup flow for confirmations, notifications, integrations, and advanced options.', 'gutenverse-form')}
            </p>
            <NoticeImage
                fileName="update-notice-3.0.0-mockup-new-form-action.png"
                alt={__('Create new form action modal in the builder', 'gutenverse-form')}
            />
        </section>

        <section className="form-300-section">
            <SectionTitle
                icon="update-notice-3.0.0-icon-update-ux-form.png"
                title={__('Design Polish And Fixes', 'gutenverse-form')}
            />
            <p>
                {__('The builder experience has been refined with smoother loading states, more consistent layouts, clearer controls, and improved admin UI details.', 'gutenverse-form')}
            </p>
            <NoticeImage
                fileName="update-notice-3.0.0-mockup-update-ux-form.png"
                alt={__('Polished form builder interface', 'gutenverse-form')}
            />
        </section>
    </div>
);
