import { isNotEmpty } from 'gutenverse-core/helper';

export const plainGeneratorFormFunction = (value, props) => {
    const {
        functionName,
        otherAttribute,
    } = props;
    switch (functionName) {
        case 'switcherWidthHeight':
            const { height, width } = otherAttribute;
            if(isNotEmpty(width) && isNotEmpty(height)){
                const result = parseInt(width) - parseInt(height) + 1;
                value = `translate3d(${result}px, -50%, 0)`;
            } else {
                value = '';
            }
            break;
        default:
            break;
    }
    return value;
};