
import { render } from '@wordpress/element';
import CreateFormAction from './src/create-form-action';
import EditFormAction from './src/edit-form-action';
import { doAction } from '@wordpress/hooks';

// Render Form
if (document.getElementById('gutenverse-form-action')) {
    document.addEventListener('DOMContentLoaded', () => {
        doAction('gutenverse.before.register.form');
        render(
            <>
                <CreateFormAction />
                <EditFormAction />
            </>,
            document.getElementById('gutenverse-form-action')
        );
    });
}