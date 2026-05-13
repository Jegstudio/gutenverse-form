const getAttachmentSize = (attachment) => {
    const sizes = attachment.sizes || attachment.media_details?.sizes || {};
    const requestedSize = attachment.size;
    const selected = requestedSize && sizes[requestedSize] ? sizes[requestedSize] : null;
    const fallbackEntry = [
        [requestedSize, selected],
        ['medium_large', sizes.medium_large],
        ['large', sizes.large],
        ['full', sizes.full],
        ['medium', sizes.medium],
        ['thumbnail', sizes.thumbnail],
    ].find(([, value]) => !!value);
    const fallbackKey = fallbackEntry?.[0] || 'full';
    const fallback = fallbackEntry?.[1] || {};
    const mediaDetails = attachment.media_details || {};

    return {
        key: fallbackKey,
        url: fallback.url || fallback.source_url || attachment.url || attachment.source_url || '',
        width: fallback.width || attachment.width || mediaDetails.width || '',
        height: fallback.height || attachment.height || mediaDetails.height || '',
    };
};

const getRenderedValue = (value) => {
    if (typeof value === 'string') {
        return value;
    }

    return value?.rendered || value?.raw || '';
};

const stripTags = (value = '') => {
    return value.replace(/<[^>]*>/g, '').trim();
};

const getAttachmentTitle = (attachment) => {
    const sourceUrl = attachment.source_url || attachment.url || '';
    const fallbackName = sourceUrl ? sourceUrl.split('/').pop() : '';

    return stripTags(getRenderedValue(attachment.title))
        || attachment.filename
        || attachment.name
        || fallbackName
        || '';
};

export const createWordPressAsset = (attachment) => {
    const size = getAttachmentSize(attachment);
    const caption = stripTags(getRenderedValue(attachment.caption));
    const alt = attachment.alt || attachment.alt_text || caption || getAttachmentTitle(attachment);
    const id = attachment.id ? String(attachment.id) : '';
    const sourceUrl = attachment.url || attachment.source_url || '';
    const mediaDetails = attachment.media_details || {};

    return {
        type: 'image',
        src: size.url,
        name: getAttachmentTitle(attachment),
        alt,
        width: size.width,
        height: size.height,
        wpAttachment: {
            id,
            alt,
            width: attachment.width || mediaDetails.width || '',
            height: attachment.height || mediaDetails.height || '',
            selectedSize: size.key,
            selectedUrl: size.url,
            sourceUrl,
        },
    };
};

export const applyWordPressAssetToSelection = (editor, assetData, target = null) => {
    const selected = target || editor?.getSelected?.();

    if (!selected) {
        return;
    }

    const attributes = {
        src: assetData.src,
    };

    if (assetData.alt) {
        attributes.alt = assetData.alt;
    }

    selected.addAttributes(attributes);
    selected.set('wpAttachment', assetData.wpAttachment);
};

export const addWordPressAssetToEditor = (editor, attachment, target = null) => {
    const assetData = createWordPressAsset(attachment);
    const addedAsset = editor.AssetManager.add(assetData);
    const asset = Array.isArray(addedAsset) ? addedAsset[0] : addedAsset;

    applyWordPressAssetToSelection(editor, assetData, target);

    return {
        asset,
        assetData,
    };
};
