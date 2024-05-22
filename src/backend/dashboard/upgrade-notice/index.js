
import { addFilter } from '@wordpress/hooks';
import { HeaderV100, ContentV100 } from './version/v1-0-0';

export const loadUpgradeNotice = () => {
    addFilter(
        'gutenverse.dashboard.notice.header',
        'gutenverse/dashboard/notice/header',
        (header, plugin, version) => {
            if (plugin === 'gutenverse-form') {
                switch (version) {
                    case '1.0.0':
                        header = <HeaderV100 />;
                        break;
                }
            }

            return header;
        }
    );

    addFilter(
        'gutenverse.dashboard.notice.content',
        'gutenverse/dashboard/notice/content',
        (content, plugin, version) => {
            if (plugin === 'gutenverse-form') {
                switch (version) {
                    case '1.0.0':
                        content = <ContentV100 />;
                        break;
                }
            }

            return content;
        }
    );
};