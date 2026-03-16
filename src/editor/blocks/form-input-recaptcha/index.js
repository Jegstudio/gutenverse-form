
import edit from './edit';
import save from './save';
import saveV2 from './deprecated/v2/save';
import metadata from './block.json';
import { IconFormRecaptchaSVG } from '../../../assets/icon/index';

const { name } = metadata;

export { metadata, name };

export const settings = {
    icon: <IconFormRecaptchaSVG />,
    edit,
    save,
    deprecated: [
        {
            attributes: metadata.attributes,
            save: saveV2,
        },
    ],
};
