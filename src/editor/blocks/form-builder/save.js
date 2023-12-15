
import classnames from 'classnames';
import { useBlockProps } from '@wordpress/block-editor';
import { InnerBlocks } from '@wordpress/block-editor';
import { isSticky } from 'gutenverse-core/helper';
import { useAnimationFrontend } from 'gutenverse-core/hooks';
import { useDisplayFrontend } from 'gutenverse-core/hooks';
import { withMouseMoveEffectScript } from 'gutenverse-core/hoc';
import { compose } from '@wordpress/compose';

const save = compose(
    withMouseMoveEffectScript
)(({ attributes }) => {
    const {
        elementId,
        formId,
        hideAfterSubmit,
        redirectTo,
        sticky = {},
        stickyShowOn,
        stickyEase,
        stickyPosition,
        stickyDuration,
        topSticky,
        bottomSticky
    } = attributes;

    const stickyClass = {
        ['guten-sticky']: isSticky(sticky),
        [`sticky-${stickyPosition}`]: isSticky(sticky),
    };

    const animationClass = useAnimationFrontend(attributes);
    const displayClass = useDisplayFrontend(attributes);

    const className = classnames(
        'guten-element',
        'guten-form-builder',
        elementId,
        animationClass,
        displayClass,
        stickyClass
    );

    const attr = {
        ['data-form-id']: formId && formId.value,
        ['data-hide-after']: hideAfterSubmit,
        ['data-redirect']: redirectTo,
        ...(
            isSticky(sticky)
                ? {['data-id']: elementId?.split('-')[1]}
                : {}
        )
    };

    return (
        <form
            style={{ display: 'none' }}
            {...useBlockProps.save({ className })}
            {...attr}>
            {isSticky(sticky) &&
            <div className="guten-data">
                <div data-var={`stickyData${elementId?.split('-')[1]}`} data-value={JSON.stringify({
                    sticky,
                    stickyShowOn,
                    stickyPosition,
                    stickyEase,
                    stickyDuration,
                    topSticky,
                    bottomSticky
                })} />
            </div>}
            <InnerBlocks.Content />
        </form>
    );
});

export default save;