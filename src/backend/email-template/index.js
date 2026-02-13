import { render } from '@wordpress/element';
import App from './app';
const root = document.getElementById('gutenverse-email-builder-root');

if (root) {
    render(<App />, root);
}
