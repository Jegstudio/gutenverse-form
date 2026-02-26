import { render } from '@wordpress/element';
import IntegrationPage from './IntegrationPage';

const root = document.getElementById('gutenverse-form-integration');

if (root) {
    render(<IntegrationPage />, root);
}
