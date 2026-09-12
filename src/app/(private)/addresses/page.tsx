import { AddressCard } from "@/component/card/address";
import { AddressCreateModal } from "@/component/modal/address";
import { getAddresses } from "@/service/address";

const Page = async () => {
    const items = await getAddresses();

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">地址簿</h1>
                        <p className="text-muted mt-1 text-sm">管理常用收件地址，分发时直接选择，不再重复填写。</p>
                    </div>
                    <AddressCreateModal />
                </header>
                <p className="text-default-500 text-sm">共保存 {items.length} 个地址</p>
                <AddressCard items={items} />
            </div>
        </div>
    );
};

export default Page;
