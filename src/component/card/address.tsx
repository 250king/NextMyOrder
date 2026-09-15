import { Card } from "@heroui/react";
import { AddressModifyModal, AddressRemoveModal } from "@/component/modal/address";
import { AddressResult } from "@/type/address";

export const AddressCard = ({ items }: { items: AddressResult[] }) => {
    if (items.length === 0) {
        return (
            <div className="py-12 text-center">
                <div className="font-medium">地址簿还是空的</div>
                <div className="text-muted mt-1 text-sm">添加常用收件地址后，填写分发信息时可以直接选择。</div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
                <Card key={item.id} className="h-full min-w-0">
                    <Card.Header className="flex flex-row items-start justify-between gap-3">
                        <div className="min-w-0">
                            <Card.Title className="truncate">{item.recipient}</Card.Title>
                            <Card.Description>{item.phone}</Card.Description>
                        </div>
                        <span className="icon-[ri--map-pin-line] text-muted shrink-0" />
                    </Card.Header>
                    <Card.Content className="flex-1">
                        <div className="text-sm leading-6">{item.address}</div>
                    </Card.Content>
                    <Card.Footer className="mt-auto flex justify-end gap-2">
                        <AddressModifyModal data={item} />
                        <AddressRemoveModal data={item} />
                    </Card.Footer>
                </Card>
            ))}
        </div>
    );
};
