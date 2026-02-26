
import edit from './edit';
import save from './save';
import metadata from './block.json';
import { IconFormRadioSVG } from '../../../assets/icon/index';
import saveV1 from './deprecated/v1/save';
import saveV2 from './deprecated/v2/save';

const { name, attributes } = metadata;

export { metadata, name };

export const settings = {
    icon: <IconFormRadioSVG />,
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
