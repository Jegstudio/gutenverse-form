import edit from "./edit";
import save from "./save";
import metadata from "./block.json";
import { IconFormInputSVG } from "../../../assets/icon";

const { name } = metadata;

export { metadata, name };

export const settings = {
	icon: <IconFormInputSVG />,
	edit,
	save,
};
