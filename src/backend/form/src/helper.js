import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';

const getAdminUrl = () => window?.GutenverseConfig?.adminUrl || window?.GutenverseDashboard?.adminUrl || '';

const ActivateLicenseKeyIcon = () => (
    <svg className="gutenverse-form-activate-license-button__icon" width="18" height="8" viewBox="0 0 18 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path d="M4.06387 7.875C3.33649 7.87485 2.62248 7.68564 1.99632 7.32708C1.37016 6.96853 0.854796 6.45378 0.503987 5.83653C0.153177 5.21929 -0.0202224 4.52216 0.00187687 3.81787C0.0239762 3.11358 0.240765 2.42794 0.629627 1.83248C1.01849 1.23701 1.56518 0.753531 2.21266 0.432481C2.86015 0.111431 3.5847 -0.0354294 4.31074 0.00722103C5.03679 0.0498715 5.73771 0.280469 6.3404 0.67496C6.94309 1.06945 7.42547 1.61338 7.7372 2.25H16.258L18 3.9375L16.258 5.625L15.0966 4.5L13.9353 5.625L12.7739 4.5L11.6126 5.625L10.4513 4.5L9.28992 5.625H7.7372C7.40749 6.29834 6.88728 6.86722 6.23703 7.26551C5.58678 7.6638 4.8332 7.87515 4.06387 7.875ZM2.90252 5.0625C3.21053 5.0625 3.50592 4.94397 3.72372 4.733C3.94151 4.52202 4.06387 4.23587 4.06387 3.9375C4.06387 3.63913 3.94151 3.35298 3.72372 3.14201C3.50592 2.93103 3.21053 2.8125 2.90252 2.8125C2.59451 2.8125 2.29912 2.93103 2.08133 3.14201C1.86353 3.35298 1.74118 3.63913 1.74118 3.9375C1.74118 4.23587 1.86353 4.52202 2.08133 4.733C2.29912 4.94397 2.59451 5.0625 2.90252 5.0625Z" fill="currentColor" />
    </svg>
);

export const hasProLicenseData = () => Boolean(window?.gprodata && Object.keys(window.gprodata).length);

export const ActivateLicenseButton = () => (
    <a className="gutenverse-form-activate-license-button" href={`${getAdminUrl()}admin.php?page=gutenverse&path=license`} target="_blank" rel="noreferrer">
        <ActivateLicenseKeyIcon />
        <span>{__('Activate License', 'gutenverse-form')}</span>
    </a>
);

export const strongDescription = (text) => createInterpolateElement(text, {
    strong: <strong />,
});
