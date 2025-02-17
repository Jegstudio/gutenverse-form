
import { createRoot } from '@wordpress/element';
import CreateFormAction from './src/create-form-action';
import EditFormAction from './src/edit-form-action';
import { doAction } from '@wordpress/hooks';
import domReady from '@wordpress/dom-ready';

// Render Form
domReady(() => {
    const formElement = document.getElementById('gutenverse-form-action');
    if (formElement) {
        doAction('gutenverse.before.register.form');
        const formRoot = createRoot(formElement);
        formRoot.render(
            <>
                <CreateFormAction />
                <EditFormAction />
            </>
        );
    }
});