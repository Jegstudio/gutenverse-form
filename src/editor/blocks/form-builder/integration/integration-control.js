import { useState, useEffect } from '@wordpress/element';
import { useInstanceId } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { ControlHeadingSimple } from 'gutenverse-core/controls';
import { Button, Plus, X, Select, classnames, cryptoRandomString, DefaultLayout } from 'gutenverse-core/components';
import { IconChevronDownSVG } from 'gutenverse-core/icons';

const customStyles = {
    input: () => ({ padding: 0, margin: 0 }),
    control: (provided, state) => ({
        ...provided,
        border: 'none',
        boxShadow: 'none',
        borderRadius: '3px',
        color: state.isFocused ? '#ffffff' : '#1c1d21',
        backgroundColor: state.isFocused ? 'rgba(59, 87, 247, 1)' : '#ffffff',
    }),
    menu: (provided) => ({ ...provided, zIndex: 999 }),
    menuList: (provided) => ({
        ...provided,
        msOverflowStyle: 'none',
        paddingBottom: 0,
        paddingTop: 0,
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': {
            display: 'none',
        },
        transition: 'all .3s ease',
    }),
    option: (provided, state) => {
        const isActive = state.isSelected;
        const isFocused = state.isFocused;

        return {
            ...provided,
            backgroundColor: isActive ? 'rgba(59, 87, 247, 1)' : isFocused ? 'rgba(219, 231, 255, 1)' : '#ffffff',
            color: isActive ? '#ffffff' : '#1c1d21',
            transition: 'all .3s ease',
        };
    },
    singleValue: (provided, state) => ({
        ...provided,
        position: 'absolute',
        color: state.selectProps.menuIsOpen ? '#ffffff' : '#1c1d21',
    }),
    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: state.selectProps.menuIsOpen ? '#ffffff' : '#1c1d21',
    }),
    indicatorSeparator: () => ({}),
};

const typeOptions = (customOptions) => {
    const options = [
        { label: __('Whatsapp', 'gutenverse-form'), value: 'whatsapp', pro: true },
        { label: __('Telegram', 'gutenverse-form'), value: 'telegram', pro: true },
        { label: __('Discord', 'gutenverse-form'), value: 'discord', pro: true },
        { label: __('Mail Chimp', 'gutenverse-form'), value: 'mailchimp', pro: true },
        { label: __('Slack', 'gutenverse-form'), value: 'slack', pro: true },
        { label: __('Webhook', 'gutenverse-form'), value: 'webhook', pro: true },
        { label: __('GetResponse', 'gutenverse-form'), value: 'get_response', pro: true },
        { label: __('Drip', 'gutenverse-form'), value: 'drip', pro: true },
        { label: __('Active Campaign', 'gutenverse-form'), value: 'active_campaign', pro: true },
        { label: __('Kit', 'gutenverse-form'), value: 'convert_kit', pro: true },
        { label: __('MailerLite', 'gutenverse-form'), value: 'mailer', pro: true },
        { label: __('Google Sheets', 'gutenverse-form'), value: 'google_sheets', pro: true },
    ];

    customOptions.forEach(custom => {
        options.push({ label: custom.label, value: custom.value });
    });

    return options;
};

const createIntegrationAction = (base = {}, overrides = {}) => ({
    ...base,
    ...overrides,
    _key: base._key || overrides._key || cryptoRandomString({ length: 6, type: 'alphanumeric' }),
});

const ActionItem = ({
    values,
    index,
    onValueChange,
    onLocalChange,
    onRemove,
    open,
    setOpen,
    customOptions,
    elementId
}) => {
    const onClickHeader = () => {
        if (open) {
            setOpen(-1);
        } else {
            setOpen(index);
        }
    };
    const emptyLicense = applyFilters('gutenverse.panel.tab.pro.content', true);

    const id = useInstanceId(ActionItem, 'inspector-select-control');
    const itemClass = classnames('repeater-item', open ? 'open' : 'close');

    const types = typeOptions(customOptions);
    const selectType = types.find(option => option.value === values[index].type);

    const onUpdateIndexValue = (val) => {
        const newValue = values.map((item, idx) => index === idx ? val : item);
        onValueChange(newValue);
    };

    const onUpdateIndexStyle = (val) => {
        const newValue = values.map((item, idx) => index === idx ? val : item);
        onLocalChange(newValue);
    };

    const imageBase = window?.GutenverseConfig?.gutenverseFormVideoDir || '';

    const LockedIntegrationControl = ({isOpen}) => {
        const id = useInstanceId(LockedIntegrationControl, 'inspector-locked-integration-control');
        return <div id={id} className={'gutenverse-control-wrapper gutenverse-control-locked-integration gutenverse-control-locked-layout'}>
            <DefaultLayout
                title={__( 'Unlock Integration', 'gutenverse-form' )}
                description={__( 'Integrate your form with various third-party services to streamline your workflow and enhance user experience.', 'gutenverse-form' )}
                img={'integration-form.mp4'}
                isOpen={isOpen}
                permaLink={__('#integration')}
                assetDir={imageBase}
            />
        </div>;
    };

    const IntegrationOption = (
        {
            item,
            selectType,
            onUpdateIndexValue,
            onUpdateIndexStyle,
            elementId
        }
    ) => {
        return applyFilters(
            'gutenverse.integration.options',
            <LockedIntegrationControl isOpen={open} />,
            {
                item:item,
                selectType:selectType,
                onUpdateIndexValue:onUpdateIndexValue,
                onUpdateIndexStyle:onUpdateIndexStyle,
                elementId:elementId
            }
        );
    };

    return (
        <div className={itemClass}>
            <div className={'repeater-header'} onClick={onClickHeader}>
                <div className={classnames('repeater-expand', { expand: open })}>
                    <IconChevronDownSVG />
                </div>
                <div className={'repeater-title'}>
                    <div id={`${id}-select`} className={'gutenverse-control-wrapper gutenverse-control-select'}>
                        <div className={classnames('control-body', { 'has-pro-badge': emptyLicense })}>
                            {emptyLicense && (
                                <span className="gutenverse-integration-pro-badge">
                                    {__('PRO', 'gutenverse-form')}
                                </span>
                            )}
                            <Select
                                id={`${id}-select`}
                                classNamePrefix="gutenverse-integration-select"
                                value={selectType}
                                styles={customStyles}
                                options={types}
                                menuPortalTarget={document.body}
                                onChange={option => {
                                    onUpdateIndexValue({ ...values[index], type: option.value });
                                    onUpdateIndexStyle({ ...values[index], type: option.value });
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className={'repeater-remove'} onClick={() => onRemove()}>
                    <X />
                </div>
            </div>
            {open && (
                <div className={'repeater-body'}>
                    <IntegrationOption
                        item={values[index]}
                        selectType={selectType}
                        onUpdateIndexValue={onUpdateIndexValue}
                        onUpdateIndexStyle={onUpdateIndexStyle}
                        elementId={elementId}
                    />
                </div>
            )}
        </div>
    );
};

const ActionItemDummy = ({ onValueChange, onLocalChange, repeaterDefault, setOpenLast, customOptions }) => {
    const id = useInstanceId(ActionItemDummy, 'inspector-select-control');
    const emptyLicense = applyFilters('gutenverse.panel.tab.pro.content', true);

    return (
        <div className={'repeater-item close dummy'}>
            <div className={'repeater-header'}>
                <div className={'repeater-expand'}>
                    <IconChevronDownSVG />
                </div>
                <div className={'repeater-title'}>
                    <div id={`${id}-dummy-select`} className={'gutenverse-control-wrapper gutenverse-control-select'}>
                        <div className={classnames('control-body', { 'has-pro-badge': emptyLicense })}>
                            {emptyLicense && (
                                <span className="gutenverse-integration-pro-badge">
                                    {__('PRO', 'gutenverse-form')}
                                </span>
                            )}
                            <Select
                                id={'dummy-select'}
                                classNamePrefix="gutenverse-integration-select"
                                value={{ label: __('Select Integration', 'gutenverse-form'), value: '' }}
                                styles={customStyles}
                                options={typeOptions(customOptions)}
                                menuPortalTarget={document.body}
                                onChange={option => {
                                    const newValue = [createIntegrationAction(repeaterDefault, {
                                        type: option.value,
                                    })];
                                    onValueChange(newValue);
                                    onLocalChange(newValue);
                                    setOpenLast(0);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionControl = ({
    label,
    repeaterDefault = {},
    value = [],
    titleFormat,
    elementValue,
    onValueChange,
    onLocalChange,
    customOptions,
    elementId
}) => {
    const id = useInstanceId(ActionControl, 'inspector-integration-action-control');
    const [openLast, setOpenLast] = useState(null);

    useEffect(() => {
        const newValue = value.map(item => {
            if (item._key === undefined) {
                return {
                    ...item,
                    _key: cryptoRandomString({ length: 6, type: 'alphanumeric' })
                };
            } else {
                return item;
            }
        });

        onValueChange(newValue);
        onLocalChange(newValue);
    }, []);

    const removeIndex = index => {
        const newValue = value.filter((item, idx) => index !== idx);

        onValueChange(newValue);
        onLocalChange(newValue);
    };

    const addNewItem = () => {
        setOpenLast(value.length);

        const newValue = [
            ...value,
            createIntegrationAction(repeaterDefault)
        ];

        onValueChange(newValue);
        onLocalChange(newValue);
    };

    return <div id={id} className={'gutenverse-control-wrapper gutenverse-control-repeater gutenverse-control-integration-repeater'}>
        <ControlHeadingSimple
            id={`${id}-repeater`}
            label={label}
        />
        <div className={'control-body'}>
            <div className={'repeater-wrapper'}>
                <div className={'repeater-container'}>
                    {value.length === 0 ? <ActionItemDummy
                        onValueChange={onValueChange}
                        onLocalChange={onLocalChange}
                        repeaterDefault={repeaterDefault}
                        setOpenLast={setOpenLast}
                        customOptions={customOptions}
                    /> : value?.map((item, index) =>
                        <ActionItem
                            key={item._key === undefined ? `${id}-${index}` : item._key}
                            id={item._key === undefined ? `${id}-${index}` : item._key}
                            index={index}
                            values={value}
                            elementValue={elementValue}
                            onValueChange={onValueChange}
                            onLocalChange={onLocalChange}
                            titleFormat={titleFormat}
                            onRemove={() => removeIndex(index)}
                            open={index === openLast}
                            setOpen={setOpenLast}
                            customOptions={customOptions}
                            elementId={elementId}
                        />
                    )}
                </div>
            </div>
        </div>
        {value.length !== 0 && <div className={'control-add'}>
            <Button isPrimary={true} onClick={addNewItem}>
                <Plus />
                {__('Add Integration', 'gutenverse-form')}
            </Button>
        </div>}
    </div>;
};

const integrationOption = ({ id, value, onValueChange, onLocalChange, customOptions }) => {

    return <div id={id}>
        <ActionControl
            label={__('Integration Action', 'gutenverse-form')}
            value={value.actions}
            elementValue={value}
            titleFormat={'<strong><%= value.type%></strong>'}
            onValueChange={actions => onValueChange({ ...value, actions })}
            onLocalChange={actions => onLocalChange({ ...value, actions })}
            customOptions={customOptions}
            repeaterDefault={{
                type: 'whatsapp',
            }}
        />
    </div>;
};

const IntegrationControl = (props) => {
    const {
        value = {},
        onValueChange,
        onLocalChange,
        customOptions = [],
        elementId,
    } = props;

    const id = useInstanceId(IntegrationControl, 'inspector-integration-control');
    const parameter = {
        id,
        value,
        onValueChange,
        onLocalChange,
        customOptions,
        elementId
    };

    return integrationOption(parameter);
};

export default IntegrationControl;
