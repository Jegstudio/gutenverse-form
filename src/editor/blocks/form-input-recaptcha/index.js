
import edit from './edit';
import save from './save';
import saveV1 from './deprecated/v1/save';
import metadata from './block.json';
import { IconFormRecaptchaSVG } from '../../../assets/icon/index';

const { name, attributes, supports } = metadata;

export { metadata, name };

export const settings = {
    icon: <IconFormRecaptchaSVG />,
    edit,
    save,
    deprecated: [
        {
            attributes,
            supports,
            save: saveV1,
        },
    ],
};
