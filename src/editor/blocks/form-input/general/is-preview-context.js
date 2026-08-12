export const isBlockPreviewContext = element => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return false;
    }

    const ownerDocument = element?.ownerDocument || document;
    const ownerWindow = ownerDocument.defaultView || window;
    const hasPreviewClass = element => element?.classList?.contains('block-editor-block-preview__content-iframe')
        || element?.classList?.contains('block-editor-block-preview__content');

    if (element?.closest?.('.block-editor-block-preview__content')) {
        return true;
    }

    if (hasPreviewClass(ownerDocument.documentElement) || hasPreviewClass(ownerDocument.body)) {
        return true;
    }

    try {
        return hasPreviewClass(ownerWindow.frameElement);
    } catch (error) {
        return false;
    }
};
