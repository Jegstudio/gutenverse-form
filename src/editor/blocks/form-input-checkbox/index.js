
import edit from './edit';
import save from './save';
import saveV1 from './deprecated/v1/save';
import saveV2 from './deprecated/v2/save';
import metadata from './block.json';
import { IconFormCheckboxSVG } from '../../../assets/icon/index';

const { name, attributes } = metadata;

export { metadata, name };

export const settings = {
    icon: <IconFormCheckboxSVG />,
    edit,
    save,
    deprecated: [
        {
            attributes,
            save: saveV2
        },
        {
            attributes,
            save: saveV1
        }
    ]
};
