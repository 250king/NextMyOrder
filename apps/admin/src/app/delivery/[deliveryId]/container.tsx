"use client";
import React from "react";
import OrderCheckTable from "@/component/form/table/order";
import GroupSelector from "@/component/form/filter/group";
import ItemSelector from "@/component/form/filter/item";
import BaseModalForm from "@repo/component/base/modal";
import BaseTable from "@repo/component/base/table";
import printLabel from "@repo/util/client/printer";
import trpc from "@/trpc/client";
import {ActionType, PageContainer, ProDescriptions} from "@ant-design/pro-components";
import {companyMap, statusMap, DeliverySchema} from "@repo/schema/delivery";
import {DeleteOutlined, LinkOutlined} from "@ant-design/icons";
import {App, Button, Form, Popconfirm, Typography} from "antd";
import {labelSdk} from "@repo/util/printer/niimbot";
import {ShippingData} from "@repo/schema/shipping";
import {SettingSchema} from "@repo/schema/setting";
import {ProColumns} from "@ant-design/pro-table";
import {TRPCClientError} from "@trpc/client";
import {UserData} from "@repo/schema/user";
import {useRouter} from "next/navigation";

const Container = (props: {
    data: DeliverySchema,
    setting: SettingSchema,
}) => {
    const [loading, setLoading] = React.useState(false);
    const table = React.useRef<ActionType>(null);
    const message = App.useApp().message;
    const router = useRouter();
    const columns: ProColumns[] = [
        {
            title: "ID",
            dataIndex: "id",
            sorter: true,
        },
        {
            title: "商品",
            dataIndex: "itemId",
            sorter: true,
            render: (_, record) => (
                <div>
                    <Typography>{record.item.name}</Typography>
                    <Typography style={{fontSize: 12}}>{record.item.group.name}</Typography>
                </div>
            ),
            renderFormItem: () => <ItemSelector/>,
        },
        {
            title: "团购",
            dataIndex: ["item", "groupId"],
            hideInTable: true,
            renderFormItem: () => <GroupSelector/>,
        },
        {
            title: "数量",
            dataIndex: "count",
            valueType: "digit",
            sorter: true,
            search: false,
        },
        {
            title: "创建时间",
            dataIndex: "createdAt",
            valueType: "dateTime",
            sorter: true,
            search: false,
        },
        {
            title: "操作",
            valueType: "option",
            width: 150,
            render: (_, record, _1, action) => [
                <Button key="link" shape="circle" icon={<LinkOutlined/>} size="small" type="link" target="_blank" href={record.url}/>,
                <Popconfirm
                    key="remove"
                    title="提醒"
                    description="您确定删除该商品？"
                    onConfirm={async () => {
                        try {
                            await trpc.deliveryDeleteOrder.mutate({
                                id: props.data.id,
                                orderId: record.id,
                            });
                            message.success("删除成功");
                            action?.reload();
                            return true;
                        } catch (e) {
                            if (e instanceof TRPCClientError) {
                                message.error(e.message);
                            } else {
                                message.error("发生未知错误");
                            }
                            return false;
                        }
                    }}
                    okText="确定"
                    cancelText="取消"
                >
                    <Button size="small" type="link" variant="link" color="danger" icon={<DeleteOutlined/>}/>
                </Popconfirm>,
            ],
        },
    ];

    React.useEffect(() => {
        const init = async () => {
            await labelSdk.connect();
            const painters = JSON.parse((await labelSdk.getAllPrinters()).info as string);
            await labelSdk.selectPrinter(Object.keys(painters)[0], Number(Object.values(painters)[0]));
            await labelSdk.initSdk();
            await labelSdk.setPrinterAutoShutDownTime(4);
        };
        init().catch((err) => {
            message.error(err.message);
        });
        return () => {
            labelSdk.disconnect();
        };
    }, []);

    return (
        <PageContainer
            content={
                <ProDescriptions
                    request={async () => {
                        try {
                            const res = await trpc.deliveryGetById.query({id: props.data.id});
                            return {
                                data: res,
                                success: true,
                            };
                        } catch {
                            return {
                                data: {},
                                success: false,
                            };
                        }
                    }}
                    editable={{
                        onSave: async (_key, record) => {
                            try {
                                await trpc.deliveryUpdate.mutate(record as UserData);
                                return true;
                            } catch (e) {
                                if (e instanceof TRPCClientError) {
                                    message.error(e.message);
                                } else {
                                    message.error("发生未知错误");
                                }
                                return false;
                            }
                        },
                    }}
                >
                    <ProDescriptions.Item dataIndex="id" title="ID" editable={false}/>
                    <ProDescriptions.Item dataIndex="createdAt" title="创建时间" valueType="dateTime" editable={false}/>
                    <ProDescriptions.Item dataIndex="status" title="状态" valueEnum={statusMap}/>
                    <ProDescriptions.Item dataIndex="name" title="收件人" formItemProps={{rules: [{required: true}]}}/>
                    <ProDescriptions.Item dataIndex="phone" title="手机号" formItemProps={{rules: [{pattern: /^1\d{10}$/}]}}/>
                    <ProDescriptions.Item dataIndex="company" title="快递公司" valueEnum={companyMap}/>
                    <ProDescriptions.Item dataIndex="expressNumber" title="快递单号" editable={false}/>
                    <ProDescriptions.Item dataIndex="address" title="地址" valueType="textarea" span={2}/>
                    <ProDescriptions.Item dataIndex="comment" title="备注" valueType="textarea" span={3}/>
                </ProDescriptions>
            }
            extra={[
                <Button
                    key="print"
                    type="primary"
                    loading={loading}
                    disabled={!props.data.address || !props.data.phone || !props.data.company || !props.setting.label}
                    onClick={async () => {
                        try {
                            setLoading(true);
                            const res = await trpc.deliveryGetCity.query({
                                address: props.data.address,
                            });
                            await printLabel({
                                id: props.data.id,
                                name: props.data.name,
                                phone: props.data.phone,
                                company: props.data.company,
                                label: props.setting.label,
                                city: res.result,
                            });
                            message.success("打印成功");
                            return true;
                        } catch (e) {
                            if (e instanceof TRPCClientError) {
                                message.error(e.message);
                            } else {
                                message.error("发生未知错误");
                            }
                            return false;
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    打印面单
                </Button>,
                <Popconfirm
                    key="remove"
                    title="提醒"
                    description="您确定移除该运单？"
                    onConfirm={async () => {
                        try {
                            await trpc.deliveryDelete.mutate({
                                id: props.data.id,
                            });
                            message.success("移除成功");
                            router.replace("/delivery");
                            return true;
                        } catch (e) {
                            if (e instanceof TRPCClientError) {
                                message.error(e.message);
                            } else {
                                message.error("发生未知错误");
                            }
                            return false;
                        }
                    }}
                >
                    <Button color="danger" variant="solid">移除</Button>
                </Popconfirm>,
            ]}
        >
            <BaseTable
                rowKey="id"
                actionRef={table}
                columns={columns}
                toolBarRender={() => [
                    <BaseModalForm
                        key="add"
                        title="添加订单"
                        width="80%"
                        trigger={<Button type="primary">添加</Button>}
                        onFinish={async (values: Record<string, unknown>) => {
                            try {
                                values.id = props.data.id;
                                await trpc.deliveryAddOrders.mutate(values as ShippingData);
                                message.success("添加成功");
                                table.current?.reload();
                                return true;
                            } catch (e) {
                                if (e instanceof TRPCClientError) {
                                    message.error(e.message);
                                } else {
                                    message.error("发生未知错误");
                                }
                                return false;
                            }
                        }}
                    >
                        <Form.Item name="orderIds" rules={[{required: true, message: "请选择订单"}]}>
                            <OrderCheckTable isShow={true} userId={props.data.user.id}/>
                        </Form.Item>
                    </BaseModalForm>,
                ]}
                request={async (params, sort) => {
                    const res = await trpc.orderGetAll.query({
                        filter: [
                            ...(params.id ? [{field: "id", operator: "eq" as const, value: Number(params.id)}] : []),
                            ...(params.itemId ? [{field: "itemId", operator: "eq" as const, value: Number(params.itemId)}] : []),
                            ...(params.item?.groupId ? [{field: "item.groupId", operator: "eq" as const, value: Number(params.item.groupId)}] : []),
                            {field: "deliveries.some.deliveryId", operator: "eq", value: props.data.id},
                        ],
                        search: params.keyword ?? "",
                        sort: {
                            field: Object.keys(sort).length > 0 ? Object.keys(sort)[0] : "id",
                            order: Object.values(sort)[0] === "descend"? "desc" : "asc",
                        },
                        page: {
                            size: params.pageSize,
                            current: params.current,
                        },
                    });
                    return {
                        data: res.items,
                        success: true,
                        total: res.total,
                    };
                }}
            />
        </PageContainer>
    );
};

export default Container;
