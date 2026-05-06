"use client";
import React from "react";
import { Button, Description, Input, Label, Modal, Radio, RadioGroup, Tabs, TextArea, TextField } from "@heroui/react";
import clsx from "clsx";
import { deliveryCompany } from "@/service/db/schema";
import { getAddresses } from "@/service/delivery";
import { AddressResult } from "@/type/address";
import { companyMap, DeliveryResult, iconMap } from "@/type/delivery";

export const DeliveryModal = ({ data }: { data: Omit<DeliveryResult, "user"> }) => {
    const [addresses, setAddresses] = React.useState<AddressResult[]>([]);
    const companyOptions = deliveryCompany.enumValues.map((company) => ({
        id: company,
        label: companyMap[company],
        icon: iconMap[company],
    }));
    React.useEffect(() => {
        getAddresses().then((r) => {
            setAddresses(r)
        });
    }, []);

    return (
        <Modal>
            <Button variant="secondary">
                <span className="icon-[ri--edit-2-fill]" />
                编辑
            </Button>
            <Modal.Backdrop>
                <Modal.Container placement="center">
                    <Modal.Dialog className="sm:max-w-2xl">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>修改信息</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <form className="flex flex-col gap-4">
                                <Tabs>
                                    <Tabs.ListContainer className="w-fit max-w-full p-2">
                                        <Tabs.List className="w-fit max-w-full *:w-fit *:whitespace-nowrap">
                                            <Tabs.Tab id="blank">
                                                直接填写
                                                <Tabs.Indicator />
                                            </Tabs.Tab>
                                            <Tabs.Tab id="book">
                                                通过地址簿填写
                                                <Tabs.Indicator />
                                            </Tabs.Tab>
                                        </Tabs.List>
                                    </Tabs.ListContainer>
                                    <Tabs.Panel id="blank" className="flex flex-col gap-4">
                                        <TextField className="w-full" name="recipient" type="text">
                                            <Label>收件人</Label>
                                            <Input variant="secondary" />
                                        </TextField>
                                        <TextField className="w-full" name="phone" type="text">
                                            <Label>手机号</Label>
                                            <Input variant="secondary" />
                                        </TextField>
                                        <TextField className="w-full" name="address" type="text">
                                            <Label>地址</Label>
                                            <TextArea variant="secondary" />
                                        </TextField>
                                    </Tabs.Panel>
                                    <Tabs.Panel id="book">
                                        <RadioGroup name="addressId" defaultValue={data.company} variant="secondary">
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <Label>选择地址</Label>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                {addresses.map((option) => (
                                                    <Radio
                                                        key={option.id}
                                                        value={String(option.id)}
                                                        className={clsx(
                                                            "group relative flex-col gap-4 rounded-lg border border-transparent bg-default p-4 transition-all",
                                                            "data-[hovered=true]:bg-default-hover",
                                                            "data-[selected=true]:border-accent data-[selected=true]:bg-accent/10"
                                                        )}
                                                    >
                                                        <Radio.Control className="absolute top-3 right-4 size-5">
                                                            <Radio.Indicator />
                                                        </Radio.Control>
                                                        <Radio.Content className="flex flex-row items-start justify-start gap-4">
                                                            <div className="flex flex-col gap-1">
                                                                <Label>{option.recipient}</Label>
                                                                <Description>{option.phone} {option.address}</Description>
                                                            </div>
                                                        </Radio.Content>
                                                    </Radio>
                                                ))}
                                            </div>
                                        </RadioGroup>
                                    </Tabs.Panel>
                                </Tabs>
                                <RadioGroup name="company" className="p-2" defaultValue={data.company} variant="secondary">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <Label>快递方式</Label>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {companyOptions.map((option) => (
                                            <Radio
                                                key={option.id}
                                                value={option.id}
                                                className={clsx(
                                                    "group relative flex-col gap-4 rounded-lg border border-transparent bg-default p-4 transition-all",
                                                    "data-[hovered=true]:bg-default-hover",
                                                    "data-[selected=true]:border-accent data-[selected=true]:bg-accent/10"
                                                )}
                                            >
                                                <Radio.Control className="absolute top-3 right-4 size-5">
                                                    <Radio.Indicator />
                                                </Radio.Control>
                                                <Radio.Content className="flex flex-row items-start justify-start gap-4">
                                                    <span className={clsx(option.icon)} />
                                                    <div className="flex flex-col gap-1">
                                                        <Label>{option.label}</Label>
                                                    </div>
                                                </Radio.Content>
                                            </Radio>
                                        ))}
                                    </div>
                                </RadioGroup>
                            </form>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};
