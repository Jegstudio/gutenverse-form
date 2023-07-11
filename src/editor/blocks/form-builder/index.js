
import edit from './edit';
import save from './save';
import saveV1 from './deprecated/v1/save';
import metadata from './block.json';
import { IconFormBuilderSVG } from '../../../assets/icon/index';

const { name, attributes } = metadata;

export { metadata, name };

export const settings = {
    icon: <IconFormBuilderSVG />,
    /* example: example, */
    edit,
    save,
    deprecated: [
        {
            attributes,
            save: saveV1
        }
    ]
};
