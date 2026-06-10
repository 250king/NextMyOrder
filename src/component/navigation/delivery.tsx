"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { Button, ButtonGroup, Dropdown, Label, toast } from "@heroui/react";
import { LinkButton } from "@/component/common/link";
import { SelectAll } from "@/component/common/select";
import { DeliveryPushModal } from "@/component/modal/delivery";
import { DeliveryResult } from "@/type/delivery";

export const DeliveryButton = ({items}: {
    items: DeliveryResult[];
}) => {
    const [open, setOpen] = React.useState(false);
    const searchParams = useSearchParams();
    const selected = JSON.parse(searchParams.get("selected") || "[]") as number[];

    return (
        <div className="flex flex-row justify-between">
            <SelectAll items={items} />
            <ButtonGroup className="ml-auto">
                <LinkButton href="/deliveries/create">新建运单</LinkButton>
                <Dropdown>
                    <Button isIconOnly>
                        <ButtonGroup.Separator />
                        <span className="icon-[ri--arrow-down-s-line]" />
                    </Button>
                    <Dropdown.Popover className="min-w-40" placement="bottom end">
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => {
                                if (selected.length == 0) {
                                    toast.warning("没有运单选中")
                                    return;
                                }
                                setOpen(true);
                            }}>
                                <Label>运单推送</Label>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
            </ButtonGroup>
            <DeliveryPushModal open={open} onChange={setOpen} selected={selected} />
        </div>
    );
}
