import { __ } from '@wordpress/i18n';

const getAssetURL = (fileName) => {
    const assetURL = window?.GutenverseDashboard?.gutenverseFormAssetURL || window?.GutenverseConfig?.gutenverseFormAssetURL || '';

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
            <svg width="30" height="32" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.8868 21.7738C13.1677 15.0164 15.0163 13.1676 21.7738 10.8869C15.0163 8.6063 13.1677 6.75738 10.8868 0C8.6063 6.75738 6.75726 8.6063 0 10.8869C6.75726 13.1676 8.6063 15.0164 10.8868 21.7738Z" fill="url(#paint0_linear_2398_9104)"/>
                <path d="M23.371 20.1211C22.1267 23.8075 21.1182 24.8162 17.4316 26.0604C21.1182 27.3045 22.1267 28.3132 23.371 31.9996C24.6151 28.3132 25.6238 27.3045 29.3102 26.0604C25.6238 24.8162 24.6151 23.8075 23.371 20.1211Z" fill="url(#paint1_linear_2398_9104)"/>
                <defs>
                    <linearGradient id="paint0_linear_2398_9104" x1="6.5" y1="14.5" x2="28.6108" y2="1.0004" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#5AF0C2"/>
                        <stop offset="1" stopColor="#5AF0C2" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear_2398_9104" x1="20.9777" y1="28.0315" x2="33.0401" y2="20.6669" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#5AF0C2"/>
                        <stop offset="1" stopColor="#5AF0C2" stopOpacity="0"/>
                    </linearGradient>
                </defs>
            </svg>
        </h3>
    </div>
);

export const ContentV300 = () => (
    <div className="form-300-content">
        <div className="form-300-callout">
            <strong><span className="badge">{__('Update', 'gutenverse-form')}</span>{__('Whats New?', 'gutenverse-form')}</strong>
            <p>
                {__('We’ve made a major update to Gutenverse Form, adding new dashboard tools, integrations, email management, reporting, and form-building improvements to make the whole experience more powerful and easier to manage.', 'gutenverse-form')}
            </p>
        </div>

        <section className="form-300-section">
            <SectionTitle
                icon="update-notice-3.0.0-iocn-new-form-dashboard.png"
                title={__('New Form Dashboard', 'gutenverse-form')}
            />
            <p>
                {__('Gutenverse Form now includes a dedicated form dashboard. Users can manage forms from one place, review form statistics, check entry activity in charts, and see clearer empty states when no data is available yet.\nThe dashboard also includes chart hover details, so users can quickly see entry totals and understand how each form is performing.', 'gutenverse-form')}
            </p>
            <NoticeImage
                fileName="update-notice-3.0.0-mockup-new-form-dashboard.png"
                alt={__('New form dashboard overview', 'gutenverse-form')}
            />
            <p className="form-300-media-note">
                {__('We also added ', 'gutenverse-form')}
                <span>{__('Daily Summary Email', 'gutenverse-form')}</span>
                {__(', allowing users to receive form activity reports in a cleaner, more readable email format from the Gutenverse dashboard.', 'gutenverse-form')}
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
                {__('We added a new integrations area inside the Gutenverse dashboard, making it easier to connect and manage third-party services.\nThis update includes integration support and improvements for Google Sheets, ActiveCampaign, MailerLite, and ConvertKit.', 'gutenverse-form')}
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
                {__('Email template management is now available in Gutenverse Form. Users can manage admin notification templates and confirmation email templates with improved field tag handling and a cleaner template list experience.', 'gutenverse-form')}
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
                {__('The form builder has been improved with a cleaner interface, better loading states using skeleton loading, updated starter templates for contact, subscribe, booking, and appointment forms, and a new Form Notice block.', 'gutenverse-form')}
            </p>
            <p>
                {__('The new Form Notice block includes controls for container, content, and icon styling. Notice designs across form actions, form inputs, and the builder interface were also improved for better clarity and consistency.', 'gutenverse-form')}
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
                {__('Entries are now easier to review and manage, with CSV export moved directly into the entries page, a refreshed entry view design, and an option to modify entry titles.', 'gutenverse-form')}
            </p>
            <p>
                {__('Form inputs also received better controls, including input value settings, improved placeholder and dynamic value handling, and bulk input style options.', 'gutenverse-form')}
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
                {__('Form actions are no longer managed separately from the WordPress admin area. They are now part of the form builder creation flow, so users can set up what happens after submission while building the form itself.\nForm action management was also improved with clearer notices, example data notices, confirmation email autofill support, and an option to remove unused form actions.', 'gutenverse-form')}
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
                {__('Across the update, we polished badges, notices, panels, loading states, spacing, font sizing, and several admin/backend screens to make the overall form experience smoother and more consistent.', 'gutenverse-form')}
            </p>
            <NoticeImage
                fileName="update-notice-3.0.0-mockup-update-ux-form.png"
                alt={__('Polished form builder interface', 'gutenverse-form')}
            />
        </section>

        <section className="form-300-section">
            <SectionTitle
                icon="update-notice-3.0.0-icon-spam-protection.png"
                title={__('Improved Spam Protection', 'gutenverse-form')}
            />
            <p>
                {__('Built-in Akismet and CAPTCHA integration in the Form Settings automatically filters bot submissions to keep your entries and inbox clean.', 'gutenverse-form')}
            </p>
            <NoticeImage
                fileName="update-notice-3.0.0-graphic-improve-spam-protection.png"
                alt={__('Polished form builder interface', 'gutenverse-form')}
            />
        </section>
    </div>
);
