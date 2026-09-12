import { sql } from "drizzle-orm";
import {
    bigint,
    bigserial,
    boolean,
    decimal,
    foreignKey,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const GroupStatus = pgEnum("GroupStatus", ["PENDING", "CLOSED", "COMPLETED"]);
export const DeliveryCompany = pgEnum("DeliveryCompany", ["SF", "YTO", "ZTO", "JD", "EMS"]);
export const DeliveryStatus = pgEnum("DeliveryStatus", ["PENDING", "PUSHED", "DELIVERED", "ARRIVED", "CANCELED"]);
export const OrderStatus = pgEnum("OrderStatus", [
    "PENDING",
    "CONFIRMED",
    "PURCHASED",
    "TRANSITING",
    "ARRIVED",
    "DELIVERING",
    "COMPLETED",
    "CANCELED",
]);
export const PaymentMethod = pgEnum("PaymentMethod", ["WECHAT", "ALIPAY", "JDPAY", "UNIONPAY", "CASH"]);
export const PaymentType = pgEnum("PaymentType", ["LIST", "TAX", "TRANSIT", "DELIVERY"]);
export const TransitStatus = pgEnum("TransitStatus", ["PENDING", "DISPATCHED", "ARRIVED", "CANCELED"]);
export const TransitType = pgEnum("TransitType", ["LOGISTICS", "PERSONAL"]);

export const Group = pgTable(
    "Group",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        name: text().notNull(),
        qq: text().notNull(),
        deadline: timestamp({ mode: "date" }).notNull(),
        status: GroupStatus().default("PENDING").notNull(),
        image: text(),
        createdAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
        updatedAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
    },
    (table) => [uniqueIndex().using("btree", table.name, table.qq)]
);

export const Member = pgTable(
    "Member",
    {
        userId: bigint({ mode: "number" }).notNull().references(() => User.id),
        groupId: bigint({ mode: "number" }).notNull().references(() => Group.id),
        joinedAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
        finalizedAt: timestamp({ mode: "date" }),
    },
    (table) => [primaryKey({ columns: [table.userId, table.groupId] })]
);

export const Item = pgTable(
    "Item",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        groupId: bigint({ mode: "number" }).notNull().references(() => Group.id),
        name: text().notNull(),
        url: text().notNull(),
        image: text(),
        price: decimal({ mode: "number" }).notNull(),
        weight: decimal({ mode: "number" }),
        allowed: boolean().default(false).notNull(),
        createdAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
        updatedAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
    },
    (table) => [uniqueIndex().using("btree", table.groupId, table.url, table.name, table.price)]
);

export const List = pgTable(
    "List",
    {
        userId: bigint({ mode: "number" }).notNull().references(() => User.id),
        itemId: bigint({ mode: "number" }).notNull().references(() => Item.id),
        count: integer().default(1).notNull(),
        createdAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
        updatedAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.itemId] })]
);

export const Order = pgTable(
    "Order",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        userId: bigint({ mode: "number" }).notNull().references(() => User.id),
        groupId: bigint({ mode: "number" }).notNull().references(() => Group.id),
        itemId: bigint({ mode: "number" }).notNull().references(() => Item.id),
        itemName: text().notNull(),
        itemUrl: text().notNull(),
        itemImage: text(),
        itemPrice: decimal({ mode: "number" }).notNull(),
        itemWeight: decimal({ mode: "number" }),
        transitId: bigint({ mode: "number" }).references(() => Transit.id),
        count: integer().default(1).notNull(),
        status: OrderStatus().default("PENDING").notNull(),
        createdAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
        updatedAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
        comment: text(),
    },
    (table) => [uniqueIndex().using("btree", table.userId, table.itemId)]
);

export const Transit = pgTable("Transit", {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    type: TransitType().default("LOGISTICS").notNull(),
    ticketNum: text().unique(),
    carrier: text().notNull(),
    tax: decimal({ mode: "number" }),
    fee: decimal({ mode: "number" }),
    status: TransitStatus().default("PENDING").notNull(),
    createdAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
    comment: text(),
});

export const Delivery = pgTable("Delivery", {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    userId: bigint({ mode: "number" }).notNull().references(() => User.id),
    recipient: text().notNull(),
    phone: text(),
    address: text(),
    company: DeliveryCompany(),
    status: DeliveryStatus().default("PENDING").notNull(),
    createdAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    comment: text(),
    ticketNum: text(),
    updatedAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
});

export const Payment = pgTable("Payment", {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    userId: bigint({ mode: "number" }).notNull().references(() => User.id),
    requestId: text().unique(),
    refId: bigint({ mode: "number" }).notNull(),
    type: PaymentType().notNull(),
    amount: decimal({ mode: "number" }).notNull(),
    method: PaymentMethod(),
    currency: text().default("CNY").notNull(),
    currencyRate: decimal({ mode: "number" }).default(1).notNull(),
    createdAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    paidAt: timestamp({ mode: "date" }),
    comment: text(),
});

export const PaymentItem = pgTable("PaymentItem", {
    id: bigserial({ mode: "number" }),
    paymentId: bigserial({ mode: "number" }).references(() => Payment.id),
    name: text().notNull(),
    image: text(),
    description: text(),
    price: decimal({ mode: "number" }).notNull(),
    count: integer().default(1).notNull(),
    total: decimal({ mode: "number" }).notNull(),
    unit: text().default("个").notNull(),
    currency: text().default("CNY").notNull(),
    currencyRate: decimal({ mode: "number" }).default(1).notNull(),
});

export const RefundRequest = pgTable("RefundRequest", {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    paymentId: bigint({ mode: "number" }).notNull().references(() => Payment.id),
    requestId: text().notNull().unique(),
    amount: decimal({ mode: "number" }).notNull(),
    createdAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const User = pgTable("User", {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    name: text().notNull().unique(),
    qq: text().notNull().unique(),
    email: text().unique(),
    createdAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp({ mode: "date" }).default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`).notNull(),
});

export const Address = pgTable(
    "Address",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        userId: bigint({ mode: "number" }).notNull().references(() => User.id),
        recipient: text().notNull(),
        phone: text().notNull(),
        address: text().notNull(),
    },
    (table) => [uniqueIndex().using("btree", table.userId, table.recipient, table.phone, table.address)]
);

export const DeliveryToOrder = pgTable(
    "_DeliveryToOrder",
    {
        deliveryId: bigint("A", { mode: "number" }).notNull().references(() => Delivery.id),
        orderId: bigint("B", { mode: "number" }).notNull().references(() => Order.id),
    },
    (table) => [
        foreignKey({ columns: [table.deliveryId], foreignColumns: [Delivery.id] }).onDelete("cascade"),
        foreignKey({ columns: [table.orderId], foreignColumns: [Order.id] }).onDelete("cascade"),
        primaryKey({ columns: [table.deliveryId, table.orderId] }),
    ]
);
