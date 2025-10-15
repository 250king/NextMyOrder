"use client";
import React from "react";
import {App, Avatar, Button, Popconfirm, Space, Typography} from "antd";
import {ActionType, ProColumns} from "@ant-design/pro-table";
import UserSelector from "@/component/form/filter/user";
import { statusMap, currencyMap, typeMap } from "@repo/schema/payment";
import {PageContainer} from "@ant-design/pro-layout";
import {SettingOutlined} from "@ant-design/icons";
import BaseTable from "@repo/component/base/table";
import Link from "next/link";
import fakeData from "./fakeData";
import { mcStd } from "@repo/util/data/string";
function Payment(){
  const message = App.useApp().message;
  const table = React.useRef<ActionType>(null);
  function typeToChinese(type: keyof typeof typeMap){
    return typeMap[type].text
  }
  function exchangeRateCalculate(value:number, exchangeRate:number){
    return mcStd(value * exchangeRate, "CNY");
  }

  const columns: ProColumns[] = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: true,
    },
    {
      title: "用户",
      dataIndex: "userId",
      sorter: true,
      search: false,
      render: (_, record) => (
          <Space size="middle" align="center">
              <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${record.user.qq}&s=0`}/>
              <div>
                  <Typography>{record.user.name}</Typography>
                  <Typography style={{fontSize: 12}}>{record.user.qq}</Typography>
              </div>
          </Space>
      ),
      renderFormItem: () => <UserSelector/>,
    },
    {
      title: '关联的账单',
      valueEnum: typeMap,
      search: false,
      render: (_, record) => (
        <span>{typeToChinese(record.type)}#{record.objectId}</span>
      )
    },
    {
      title: '金额',
      dataIndex:'amount',
      sorter: true,
      search: false,
      render(_ ,record){
        return(
          <div>
            {mcStd(record.amount, record.baseCurrency)}<br/>
            <span style={{fontSize:"0.8rem", color:"grey"}}>{exchangeRateCalculate(record.amount, record.exchangeRate)}</span>
            {record.amount < 0 &&  <span style = {{fontSize:"0.8rem", color:"green"}}><br/>已退款</span>}
          </div>
        )
      }
    },
    {
      title: '支付方法',
      dataIndex: 'payMethod',
      sorter: false,
    },
    {
      title: '支付货币',
      dataIndex: 'baseCurrency',
      valueType: "select",
      valueEnum: currencyMap,
      sorter: true,
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      sorter: true,
      search: false,
    },
    {
      title: '支付时间',
      dataIndex: 'paidAt',
      sorter: true,
      search: false,
    },
    {
      title: "状态",
      dataIndex: "status",
      sorter: true,
      valueType: "select",
      valueEnum: statusMap,
    },
    {
      title: "操作",
      valueType: "option",
      width: 150,
      render: (_, record) => [
          <Link key="manage" href={`/payment/${record.id}`} passHref>
              <Button type="link" icon={<SettingOutlined/>}/>
          </Link>,
      ],
    },
  ]
  return (
    <PageContainer>
      <BaseTable
        rowKey = "id"
        rowSelection={{
          preserveSelectedRowKeys: true,
        }}
        actionRef={table}
        columns={columns}
        search={{filterType: "light"}}
        options={{search: {allowClear: true}}}
        toolBarRender={() => [
            <Link key="add" href="/payment/create" passHref>
                <Button type="primary">添加</Button>
            </Link>,
            <Link key="add" href="/payment/create/batch" passHref>
                <Button type="primary">批量添加</Button>
            </Link>,
        ]}
        request = {async () => {
          return Promise.resolve({
            data: fakeData,
            success: true,
            total: fakeData.length
          });
        }}
      />
    </PageContainer>
  )
}
export default Payment