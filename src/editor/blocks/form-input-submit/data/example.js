const example = {
    attributes: {
        buttonSize: 'lg',
        buttonType: 'info',
        iconSpacing: '14',
        buttonBorderRadius: {
            Desktop: {
                unit: 'px',
                dimension: { top: '25', right: '25', bottom: '25', left: '25' }
            },
            Tablet: {
                unit: 'px',
                dimension: { top: '25', right: '25', bottom: '25', left: '25' }
            },
            Mobile: {
                unit: 'px',
                dimension: { top: '25', right: '25', bottom: '25', left: '25' }
            }
        },
        content: 'Join Now!',
        showIcon: true,
        typography: { font: { label: 'Trebuchet MS', value: 'Trebuchet MS', type: 'system' } }
    }
};

export default example;