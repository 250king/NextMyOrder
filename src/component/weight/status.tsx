import React from "react";
import {ActionType} from "@ant-design/pro-table";
import {Button, Popconfirm} from "antd";
import {MessageInstance} from "antd/lib/message/interface";
import trpc from "@/server/client";

interface Props {
    table: React.RefObject<ActionType | null>
    message: MessageInstance,
    selected: React.Key[],
    target: "order" | "user"
}

const StatusWeight = (props: Props) => {
    const actionList = [
        {
            status: "confirmed",
            description: "您确定选中的订单没有错误？",
            buttonText: "确认",
        },
        {
            status: "arrived",
            description: "您确定选中的订单的商品安然无恙？",
            buttonText: "完成验货",
        },
        {
            status: "finished",
            description: "您确定选中的订单以面提方式交付？",
            buttonText: "交付",
        },
        {
            status: "failed",
            description: "您确定作废选中的订单？",
            buttonText: "作废",
        },
    ];
    const list = actionList.map(({status, description, buttonText}) => (
        <Popconfirm
            key={status}
            title="提醒"
            description={description}
            onConfirm={async () => {
                try {
                    if (props.target == "order") {
                        await trpc.order.flow.mutate({
                            ids: props.selected.map((id) => Number(id)),
                            status,
                        });
                    }
                    else {
                        await trpc.order.flow.mutate({
                            userIds: props.selected.map((id) => Number(id)),
                            status,
                        });
                    }
                    props.table.current?.clearSelected?.();
                    props.message.success("修改成功");
                    props.table.current?.reload();
                    return true;
                } catch {
                    props.message.error("发生错误，请稍后再试");
                    return false;
                }
            }}
        >
            <Button type="link">{buttonText}</Button>
        </Popconfirm>
    ))
    list.push(
        <Button key="cancle" type="link" onClick={() => props.table.current?.clearSelected?.()}>取消选择</Button>
    )
    return list;
}

export default StatusWeight;
