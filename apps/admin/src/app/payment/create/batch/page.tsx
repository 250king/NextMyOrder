"use client";
import {App, Avatar, Form, DatePicker, Radio, Select, Button} from "antd";
import React from "react";
import GroupTable from "@/component/form/table/group";
import ShippingTable from "@/component/form/table/shipping";
import { PageContainer } from "@ant-design/pro-components";
import { ProFormText } from "@ant-design/pro-components";
import { useRouter } from "next/navigation";
import trpc from "@/trpc/client";
import {TRPCClientError} from "@trpc/client";
import { PaymentData } from "@repo/schema/payment";
const Page = () => {
  const [step, setStep] = React.useState(0);
  const [user, setUser] = React.useState();
  const [type, setType] = React.useState<string>("group");
  const router = useRouter();
  const message = App.useApp().message;

  async function handleFormFinish(values: any){
    try{
      values.objectId = values.objectId[0];
      values.exchangeRate = Number(values.exchangeRate);
      
      console.log(values);
      await trpc.paymentCreateAll.mutate(values as PaymentData);
      message.success("批量生成订单成功")
      router.back();
    }catch(e){
      if (e instanceof TRPCClientError) {
        message.error(e.message);
      } else {
        message.error("发生未知错误");
      }
      return false;
    }
  }
  return(
    <PageContainer style={{display:"flex", flexDirection: "column"}}>
      <Form onFinish={handleFormFinish} style={{display:"flex", flexDirection: "column"}}>
        <div style={{display:"flex", gap:"100px"}}> 
          <Form.Item name = "type" label = "关联类型" 
          style={{alignSelf: "center"}} 
          rules={[{required: true, message: "请选择类别"}]}
          initialValue="group"
          >
            <Radio.Group

              options = {
                [
                  { value: "group", label: "团购"},
                  { value: "shipping-tax", label: "运单(税费)"},
                  { value: "shipping-fee", label: "运单(费)"}
                ]
              }
              onChange={(e) => {
                setType(e.target.value);
              }}
            />
          </Form.Item>
          <ProFormText name="exchangeRate" label="汇率" 
          rules={[
            {
              validator:(_, value) => {
                if(!value){
                  return Promise.reject("请输入汇率");
                }
                else if(!Number(value)){
                  return Promise.reject("请输入一个有效的数字");
                }else if(Number(value) < 0){
                  return Promise.reject("请输入一个正数");
                }
                return Promise.resolve();
              }   
            }
          ]} 
          
          />
        </div>
        <Form.Item name = "objectId"  rules={[{required: true, message: "请选择关联项目"}]}>
          {type === 'group' && <GroupTable/>} 
          {type === 'shipping-fee' && <ShippingTable/>}
          {type === 'shipping-tax' && <ShippingTable/>}
        </Form.Item>
        <Button type="primary" htmlType="submit" style={{alignSelf: "center"}}>
            提交
        </Button>
      </Form>
    </PageContainer>
  )
}
export default Page;