
import edit from './edit';
import save from './save';
import metadata from './block.json';
import { IconFormRadioSVG } from '../../../assets/icon/index';

const { name } = metadata;

export { metadata, name };

export const settings = {
    icon: <IconFormRadioSVG />,
    edit,
    save,
};
