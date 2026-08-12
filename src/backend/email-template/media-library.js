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

const getComponentName = (component) => {
    return component?.get?.('tagName')
        || component?.attributes?.tagName
        || component?.get?.('type')
        || component?.attributes?.type
        || '';
};

const componentMatchesName = (component, names) => {
    const type = component?.get?.('type') || component?.attributes?.type || '';
    const tagName = component?.get?.('tagName') || component?.attributes?.tagName || '';

    return names.includes(type) || names.includes(tagName) || names.includes(getComponentName(component));
};

const isUsableImageSource = (src) => {
    const value = String(src || '').trim();

    return /^(https?:)?\/\//i.test(value) || value.startsWith('data:image/');
};

const getComponentAttributes = (component) => {
    return component?.getAttributes?.() || component?.get?.('attributes') || component?.attributes?.attributes || {};
};

const getWordPressAttachment = (component) => {
    return component?.get?.('wpAttachment') || component?.attributes?.wpAttachment || {};
};

const getRenderedImageSource = (component) => {
    const image = component?.view?.el?.querySelector?.('img');

    return image?.getAttribute?.('src') || image?.currentSrc || '';
};

const getAssetData = (asset) => {
    return asset?.toJSON?.() || asset?.attributes || {};
};

const getAssetSource = (asset) => {
    const data = getAssetData(asset);

    return asset?.getSrc?.() || asset?.get?.('src') || data.src || '';
};

const normalizeImageKey = value => String(value || '').trim().toLowerCase();

const getAssetKeys = (asset) => {
    const data = getAssetData(asset);
    const wpAttachment = asset?.get?.('wpAttachment') || data.wpAttachment || {};

    return [
        asset?.get?.('id'),
        asset?.get?.('name'),
        asset?.get?.('alt'),
        data.id,
        data.name,
        data.alt,
        wpAttachment.id,
        wpAttachment.alt,
        wpAttachment.selectedUrl,
        wpAttachment.sourceUrl,
    ].map(normalizeImageKey).filter(Boolean);
};

const getComponentImageKeys = (component) => {
    const attributes = getComponentAttributes(component);
    const wpAttachment = getWordPressAttachment(component);

    return [
        attributes.id,
        attributes.alt,
        attributes.src,
        component?.get?.('id'),
        component?.get?.('alt'),
        component?.get?.('src'),
        wpAttachment.id,
        wpAttachment.alt,
        wpAttachment.selectedUrl,
        wpAttachment.sourceUrl,
    ].map(normalizeImageKey).filter(Boolean);
};

const getAssetManagerImageSource = (editor, component) => {
    const collection = editor?.AssetManager?.getAll?.();
    const assets = collection?.models || collection || [];
    const componentKeys = getComponentImageKeys(component);
    const usableAssets = Array.from(assets)
        .map(asset => ({
            src: getAssetSource(asset),
            keys: getAssetKeys(asset),
        }))
        .filter(asset => isUsableImageSource(asset.src));
    const matchedAsset = usableAssets.find(asset => asset.keys.some(key => componentKeys.includes(key)));

    if (matchedAsset) {
        return matchedAsset.src;
    }

    return usableAssets.length === 1 ? usableAssets[0].src : '';
};

const getPreferredImageSource = (component, preferredSrc = '', editor = null) => {
    const attributes = getComponentAttributes(component);
    const wpAttachment = getWordPressAttachment(component);
    const candidates = [
        preferredSrc,
        attributes.src,
        component?.get?.('src'),
        wpAttachment.selectedUrl,
        wpAttachment.sourceUrl,
        getRenderedImageSource(component),
        getAssetManagerImageSource(editor, component),
    ].filter(Boolean);

    return candidates.find(isUsableImageSource) || '';
};

const getPreferredImageAlt = (component, preferredAlt = '') => {
    const attributes = getComponentAttributes(component);
    const wpAttachment = getWordPressAttachment(component);

    return preferredAlt
        || attributes.alt
        || component?.get?.('alt')
        || wpAttachment.alt
        || wpAttachment.title
        || '';
};

const normalizeImageWidth = (width) => {
    const value = String(width || '').trim();

    if (!value || value === 'auto') {
        return '';
    }

    if (/^\d+(\.\d+)?$/.test(value)) {
        return `${value}px`;
    }

    return value;
};

const getRenderedImageNaturalWidth = (component) => {
    const image = component?.view?.el?.querySelector?.('img');
    const naturalWidth = Number(image?.naturalWidth || 0);

    return naturalWidth > 0 ? naturalWidth : '';
};

const isAutoManagedImageWidth = (component, width) => {
    const normalizedWidth = normalizeImageWidth(width);
    const wpAttachment = getWordPressAttachment(component);
    const managedWidths = [
        wpAttachment.selectedWidth,
        wpAttachment.width,
        getRenderedImageNaturalWidth(component),
    ].map(normalizeImageWidth).filter(Boolean);

    return normalizedWidth && managedWidths.includes(normalizedWidth);
};

const hasExplicitImageWidth = (component) => {
    const attributes = getComponentAttributes(component);
    const style = component?.getStyle?.() || {};
    const candidates = [
        attributes.width,
        component?.get?.('width'),
        style.width,
    ].map(value => String(value || '').trim()).filter(Boolean);

    return candidates.some(value => value !== 'auto' && !isAutoManagedImageWidth(component, value));
};

const getPreferredImageWidth = (component, assetData = {}) => {
    const wpAttachment = {
        ...getWordPressAttachment(component),
        ...(assetData.wpAttachment || {}),
    };
    const width = assetData.width
        || wpAttachment.selectedWidth
        || wpAttachment.width
        || getRenderedImageNaturalWidth(component);

    return normalizeImageWidth(width);
};

const isMjImageComponent = (component) => {
    return componentMatchesName(component, ['mj-image']);
};

const supportsMjBackgroundImage = (component) => {
    return componentMatchesName(component, ['mj-body', 'mj-wrapper', 'mj-section', 'mj-column']);
};

const removeImageOnlyAttributes = (component) => {
    if (component?.removeAttributes) {
        component.removeAttributes(['src', 'alt']);
    }

    if (component?.set) {
        component.set('src', '');
        component.set('alt', '');
    }
};

const syncMjImageAttributes = (component, assetData = {}, editor = null) => {
    if (!component) {
        return;
    }

    const src = getPreferredImageSource(component, assetData.src, editor);
    const alt = getPreferredImageAlt(component, assetData.alt);
    const width = !hasExplicitImageWidth(component) ? getPreferredImageWidth(component, assetData) : '';
    const attributes = {};

    if (src) {
        attributes.src = src;
    }

    if (alt) {
        attributes.alt = alt;
    }

    if (width) {
        attributes.width = width;
    }

    if (Object.keys(attributes).length && component.addAttributes) {
        component.addAttributes(attributes);
    }

    if (!src && component.removeAttributes) {
        component.removeAttributes(['src']);
    }

    if (component.set) {
        if (src) {
            component.set('src', src);
        } else {
            component.set('src', '');
        }

        if (alt) {
            component.set('alt', alt);
        }

        if (assetData.wpAttachment) {
            component.set('wpAttachment', assetData.wpAttachment);
        }
    }
};

const removePrivateAttributes = (component) => {
    const attributes = component?.getAttributes?.() || component?.get?.('attributes') || {};
    const privateAttributes = Object.keys(attributes).filter(key => key.startsWith('__'));

    if (privateAttributes.length && component?.removeAttributes) {
        component.removeAttributes(privateAttributes);
    }
};

export const sanitizeMjmlBackgroundImageAttributes = (editor) => {
    const wrapper = editor?.getWrapper?.();
    const selected = editor?.getSelected?.();
    const components = [
        wrapper,
        selected,
        ...(wrapper?.find?.('*') || []),
    ].filter(Boolean);
    const visited = new Set();

    components.forEach(component => {
        const cid = component.cid || component.getId?.() || component;

        if (visited.has(cid)) {
            return;
        }

        visited.add(cid);

        removePrivateAttributes(component);

        if (isMjImageComponent(component)) {
            syncMjImageAttributes(component, {}, editor);

            return;
        }

        if (supportsMjBackgroundImage(component) && !isMjImageComponent(component)) {
            removeImageOnlyAttributes(component);
        }
    });
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
            selectedWidth: size.width,
            selectedHeight: size.height,
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

    if (supportsMjBackgroundImage(selected) && !isMjImageComponent(selected)) {
        removeImageOnlyAttributes(selected);
        selected.addAttributes({
            'background-url': assetData.src,
        });
        selected.set('wpAttachment', assetData.wpAttachment);
        return;
    }

    if (isMjImageComponent(selected)) {
        syncMjImageAttributes(selected, assetData, editor);
    }
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

export const createWordPressAssetSelection = (assetData) => {
    const publicAsset = {
        type: assetData.type,
        src: assetData.src,
        name: assetData.name,
        alt: assetData.alt,
        width: assetData.width,
        height: assetData.height,
    };
    const safeAsset = {
        attributes: {
            src: assetData.src,
            alt: assetData.alt,
        },
        get: key => publicAsset[key],
        getSrc: () => assetData.src,
        toJSON: () => ({ ...publicAsset }),
    };

    return safeAsset;
};
