
import edit from './edit';
import save from './save';
import metadata from './block.json';
import { IconFormTextareaSVG } from '../../../assets/icon/index';
import saveV1 from './deprecated/v1/save';

const { name, attributes } = metadata;

export { metadata, name };

export const settings = {
    icon: <IconFormTextareaSVG />,
    edit,
    save,
    deprecated: [
        {
            attributes,
            save: saveV1
        }
    ]
};
