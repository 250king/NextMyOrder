
type FakePaymentData = {
  id:number,
  userId:number,
  objectId:number,
  type:String,
  amount:number,
  payMethod:String,
  baseCurrency:String,
  exchangeRate:number,
  createdAt:String,
  paidAt:String,
  status:String,
  user:{
    name:string
    qq:string
  }
}

const fakeData: FakePaymentData[] = [
  {
    id: 1,
    userId: 101,
    objectId: 5001,
    type: "order",
    amount: 29.99,
    payMethod: "credit_card",
    baseCurrency: "USD",
    exchangeRate: 7.24,
    createdAt: "2025-10-10",
    paidAt: "2025-10-10",
    status: "paid",
    user: { name:"a", qq: "2024235770" }
  },
  {
    id: 2,
    userId: 102,
    objectId: 5002,
    type: "order",
    amount: 199.0,
    payMethod: "alipay",
    baseCurrency: "CNY",
    exchangeRate: 1.0,
    createdAt: "2025-10-11",
    paidAt: "2025-10-11",
    status: "paid",
    user: { name:"a", qq: "2024235770" }
  },
  {
    id: 3,
    userId: 103,
    objectId: 5003,
    type: "order",
    amount: 50.0,
    payMethod: "wechat",
    baseCurrency: "CNY",
    exchangeRate: 1.0,
    createdAt: "2025-10-12",
    paidAt: "2025-10-13",
    status: "pending",
    user: { name:"a", qq: "2024235770" }
  },
  {
    id: 4,
    userId: 104,
    objectId: 5004,
    type: "order",
    amount: -49.99,
    payMethod: "paypal",
    baseCurrency: "USD",
    exchangeRate: 7.21,
    createdAt: "2025-10-13",
    paidAt: "2025-10-13",
    status: "canceled",
    user: { name:"a", qq: "2024235770" }
  },
  {
    id: 5,
    userId: 105,
    objectId: 5005,
    type: "order",
    amount: 15.5,
    payMethod: "bank_transfer",
    baseCurrency: "JPY",
    exchangeRate: 0.048,
    createdAt: "2025-10-14",
    paidAt: "2025-10-14",
    status: "paid",
    user: { name:"a", qq: "2024235770" }
  }
];
export default fakeData;