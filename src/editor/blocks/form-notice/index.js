import edit from './edit';
import save from './save';
import saveV1 from './deprecated/v1/save';
import metadata from './block.json';
import { IconFormNoticeSVG } from '../../../assets/icon';

const { name, attributes } = metadata;

export { metadata, name };

export const settings = {
    icon: <IconFormNoticeSVG />,
    edit,
    save,
    deprecated: [
        {
            attributes,
            save: saveV1,
        },
    ],
};
