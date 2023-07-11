import { getBlockType, registerBlockType } from '@wordpress/blocks';
import { isBlockActive, updateBlockList } from 'gutenverse-core/helper';

const registerBlocks = () => {
    const r = require.context('./blocks', true, /index\.js$/);

    r.keys().forEach(key => {
        const { settings, metadata, name } = r(key);

        name && updateBlockList({ name, settings, metadata });

        if (window?.GutenverseConfig && name && !getBlockType(name) && isBlockActive(name)) {
            registerBlockType(name, {
                ...settings,
                ...metadata
            });
        }
    });
};

(() => {
    registerBlocks();
})();
