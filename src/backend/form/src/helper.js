import { createInterpolateElement } from '@wordpress/element';

export const strongDescription = (text) => createInterpolateElement(text, {
    strong: <strong />,
});
