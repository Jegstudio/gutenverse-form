const FORM_BUILDER_BLOCK_NAME = 'gutenverse/form-builder';

export const collectStandaloneFormBuilders = (blocks = [], result = []) => {
    blocks.forEach(block => {
        // Shared content is owned by the pattern, not by each placement in this post.
        if (block.name === 'core/block') {
            return;
        }

        if (block.name === FORM_BUILDER_BLOCK_NAME) {
            result.push(block);
        }

        collectStandaloneFormBuilders(block.innerBlocks || [], result);
    });

    return result;
};

export const isSyncedPatternChild = (blockEditor, clientId) => (
    blockEditor.getBlockParents(clientId).some(parentId => (
        blockEditor.getBlockName(parentId) === 'core/block'
    ))
);
