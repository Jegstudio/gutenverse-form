import { useState, useEffect } from '@wordpress/element';
import { useInstanceId } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { 
    CheckboxControl, 
    SelectControl, 
    SwitchControl, 
    AlertControl,
    TextControl,
    TextareaControl,
    ControlHeadingSimple 
} from 'gutenverse-core/controls';
import { Button, Plus, X, Select, classnames, cryptoRandomString, DefaultLayout } from 'gutenverse-core/components';
import { IconChevronDownSVG } from 'gutenverse-core/icons';
import { WhatsappControls } from './whatsapp-controls';
import { TelegramControls } from './telegram-controls';
import { DiscordControls } from './discord-controls';
import { MailChimpControls } from './mailchimp-controls';
import { SlackControls } from './slack-controls';
import { WebhookControls } from './webhook-controls';
import { GetResponseControls } from './get-response-controls';
import { DripControls } from './drip-controls';
import { ActiveCampaignControls } from './active-campaign-controls';
import { ConvertKitControls } from './convert-kit-controls';
import { MailerControls } from './mailer-controls';
import { GoogleSheetsControls } from './google-sheets-controls';

const customStyles = {
    input: () => ({ padding: 0, margin: 0 }),
    control: (provided, state) => ({
        ...provided,
        border: 'none',
        boxShadow: 'none',
        borderRadius: '3px',
        color: state.isFocused ? '#ffffff' : '#1c1d21',
        backgroundColor: state.isFocused ? '#5e81f4' : '#ffffff',
    }),
    menu: (provided) => ({ ...provided, zIndex: 999 }),
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
        { label: __('Whatsapp', 'gutenverse-form'), value: 'whatsapp', pro: false },
        { label: __('Telegram', 'gutenverse-form'), value: 'telegram', pro: false },
        { label: __('Discord', 'gutenverse-form'), value: 'discord', pro: false },
        { label: __('Mail Chimp', 'gutenverse-form'), value: 'mailchimp', pro: false },
        { label: __('Slack', 'gutenverse-form'), value: 'slack', pro: false },
        { label: __('Webhook', 'gutenverse-form'), value: 'webhook', pro: false },
        { label: __('GetResponse', 'gutenverse-form'), value: 'get_response', pro: false },
        { label: __('Drip', 'gutenverse-form'), value: 'drip', pro: false },
        { label: __('Active Campaign', 'gutenverse-form'), value: 'active_campaign', pro: false },
        { label: __('Convert Kit', 'gutenverse-form'), value: 'convert_kit', pro: false },
        { label: __('Mailer', 'gutenverse-form'), value: 'mailer', pro: false },
        { label: __('Google Sheets', 'gutenverse-form'), value: 'google_sheets', pro: false },
    ];

    customOptions.forEach(custom => {
        options.push({ label: custom.label, value: custom.value });
    });

    return options;
};

const IntegrationTypeControl = ({ item, selectType, onUpdateIndexValue, onUpdateIndexStyle }) => {
    const props = { item, onUpdateIndexValue, onUpdateIndexStyle, selectType };
    switch (item.type) {
        case 'whatsapp':
            return <WhatsappControls {...props} />;
        case 'telegram':
            return <TelegramControls {...props} />;
        case 'discord':
            return <DiscordControls {...props} />;
        case 'mailchimp':
            return <MailChimpControls {...props} />;
        case 'slack':
            return <SlackControls {...props} />;
        case 'webhook':
            return <WebhookControls {...props} />;
        case 'get_response':
            return <GetResponseControls {...props} />;
        case 'drip':
            return <DripControls {...props} />;
        case 'active_campaign':
            return <ActiveCampaignControls {...props} />;
        case 'convert_kit':
            return <ConvertKitControls {...props} />;
        case 'mailer':
            return <MailerControls {...props} />;
        case 'google_sheets':
            return <GoogleSheetsControls {...props} />;
        default:
            return null;
    }
};

const ActionItem = ({
    values,
    index,
    onValueChange,
    onLocalChange,
    onRemove,
    open,
    setOpen,
    customOptions
}) => {
    const onClickHeader = () => {
        if (open) {
            setOpen(-1);
        } else {
            setOpen(index);
        }
    };

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

    const LockedIntegrationControl = ({isOpen}) => {
        const id = useInstanceId(LockedIntegrationControl, 'inspector-locked-integration-control');
        return <div id={id} className={'gutenverse-control-wrapper gutenverse-control-locked-integration gutenverse-control-locked-layout'}>
            <DefaultLayout
                title={__( 'Unlock Integration', 'gutenverse-form' )}
                description={__( 'Integrate your form with various third-party services to streamline your workflow and enhance user experience.', 'gutenverse-form' )}
                img={'/scroll-sticky.mp4'}
                isOpen={isOpen}
                permaLink={__('#integration')}
            />
        </div>;
    };


    return (
        <div className={itemClass}>
            <div className={'repeater-header'} onClick={onClickHeader}>
                <div className={classnames('repeater-expand', { expand: open })}>
                    <IconChevronDownSVG />
                </div>
                <div className={'repeater-title'}>
                    <div id={`${id}-select`} className={'gutenverse-control-wrapper gutenverse-control-select'}>
                        <div className={'control-body'}>
                            <Select
                                id={`${id}-select`}
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
                    {selectType?.pro ? (
                        <LockedIntegrationControl isOpen={open} />
                    ): 
                    <IntegrationTypeControl 
                        item={values[index]}
                        selectType={selectType}
                        onUpdateIndexValue={onUpdateIndexValue}
                        onUpdateIndexStyle={onUpdateIndexStyle}
                    />
                    }
                </div>
            )}
        </div>
    );
};

const ActionItemDummy = ({ onValueChange, onLocalChange, repeaterDefault, setOpenLast, customOptions }) => {
    const id = useInstanceId(ActionItemDummy, 'inspector-select-control');

    return (
        <div className={'repeater-item close dummy'}>
            <div className={'repeater-header'}>
                <div className={'repeater-expand'}>
                    <IconChevronDownSVG />
                </div>
                <div className={'repeater-title'}>
                    <div id={`${id}-dummy-select`} className={'gutenverse-control-wrapper gutenverse-control-select'}>
                        <div className={'control-body'}>
                            <Select
                                id={'dummy-select'}
                                value={{ label: __('Select Integration', 'gutenverse-form'), value: '' }}
                                styles={customStyles}
                                options={typeOptions(customOptions)}
                                menuPortalTarget={document.body}
                                onChange={option => {
                                    const newValue = [{
                                        ...repeaterDefault,
                                        type: option.value,
                                    }];
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
    customOptions
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
            repeaterDefault
        ];

        onValueChange(newValue);
        onLocalChange(newValue);
    };

    return <div id={id} className={'gutenverse-control-wrapper gutenverse-control-repeater gutenverse-control-adanim-repeater'}>
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
    } = props;

    useEffect(() => {
        if ((!value.actions || value.actions.length <= 0) && window.GutenverseConfig?.globalIntegrations?.length > 0) {
            const globalActions = window.GutenverseConfig.globalIntegrations.map(global => ({
                ...global,
                _key: cryptoRandomString({ length: 6, type: 'alphanumeric' })
            }));
            
            onValueChange({ ...value, actions: globalActions });
            onLocalChange({ ...value, actions: globalActions });
        }
    }, []);

    const id = useInstanceId(IntegrationControl, 'inspector-integration-control');
    const parameter = {
        id,
        value,
        onValueChange,
        onLocalChange,
        customOptions
    };

    // return applyFilters(
    //     'gutenverse.integration.options',
    //     integrationOption(parameter),
    //     parameter
    // );

    return integrationOption(parameter);
};

export default IntegrationControl;