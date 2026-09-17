"use client";
import { Button } from "@heroui/react";
import { AlertModal } from "@/component/common/alert";
import { finalizeGroupList } from "@/service/group";
import { GroupResult } from "@/type/group";

export const GroupListFinalizeModal = ({ data }: { data: GroupResult }) => {
    return (
        <AlertModal
            title="确认需求并生成订单？"
            status="warning"
            confirmLabel="生成订单"
            trigger={<Button>确认需求</Button>}
            onConfirmed={async () => {
                await finalizeGroupList(data.id);
            }}
        >
            确认后系统会按照当前需求生成正式订单，之后将无法自行修改商品和数量。请确认需求内容无误后再继续。
        </AlertModal>
    );
};
