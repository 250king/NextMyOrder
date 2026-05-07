import { sql } from "drizzle-orm";
import {
    bigint,
    bigserial,
    boolean,
    decimal,
    foreignKey,
    index,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const deliveryCompany = pgEnum("DeliveryCompany", ["SF", "YTO", "ZTO", "JD", "EMS"]);
export const deliveryStatus = pgEnum("DeliveryStatus", ["PENDING", "PUSHED", "DELIVERED", "ARRIVED", "CANCELED"]);
export const orderStatus = pgEnum("OrderStatus", [
    "PENDING",
    "CONFIRMED",
    "PURCHASED",
    "TRANSITING",
    "ARRIVED",
    "DELIVERING",
    "COMPLETED",
    "CANCELLED",
]);
export const paymentMethod = pgEnum("PaymentMethod", ["WECHAT", "ALIPAY", "JDPAY", "UNIONPAY", "CASH"]);
export const paymentType = pgEnum("PaymentType", ["LIST", "TAX", "TRANSIT", "DELIVERY"]);
export const transitStatus = pgEnum("TransitStatus", [
    "PENDING",
    "DISPATCHED_TRANSIT",
    "OVERSEA_TRANSIT",
    "CUSTOMS",
    "DELIVERED_TRANSIT",
    "ARRIVED",
    "CANCELLED",
]);
export const transitType = pgEnum("TransitType", ["LOGISTICS", "PERSONAL"]);

export const setting = pgTable("Setting", {
    key: text().primaryKey().notNull(),
    value: text(),
});

export const group = pgTable(
    "Group",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        name: text().notNull(),
        qq: text().notNull(),
        deadline: timestamp({ mode: "date" }).notNull(),
        ended: boolean().default(false).notNull(),
        createdAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        uniqueIndex("Group_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
        uniqueIndex("Group_qq_key").using("btree", table.qq.asc().nullsLast().op("text_ops")),
    ]
);

export const list = pgTable(
    "List",
    {
        userId: bigint({ mode: "number" }).notNull(),
        groupId: bigint({ mode: "number" }).notNull(),
        joinedAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        uniqueIndex("List_userId_groupId_key").using(
            "btree",
            table.userId.asc().nullsLast().op("int4_ops"),
            table.groupId.asc().nullsLast().op("int4_ops")
        ),
        foreignKey({
            columns: [table.groupId],
            foreignColumns: [group.id],
            name: "List_groupId_fkey",
        })
            .onUpdate("cascade")
            .onDelete("cascade"),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "List_userId_fkey",
        })
            .onUpdate("cascade")
            .onDelete("cascade"),
    ]
);

export const item = pgTable(
    "Item",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        groupId: bigint({ mode: "number" }).notNull(),
        name: text().notNull(),
        url: text().notNull(),
        image: text(),
        price: decimal({ mode: "number" }).notNull(),
        weight: decimal({ mode: "number" }),
        allowed: boolean().default(false).notNull(),
        createdAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        uniqueIndex("Item_groupId_url_key").using(
            "btree",
            table.groupId.asc().nullsLast().op("int4_ops"),
            table.url.asc().nullsLast().op("int4_ops")
        ),
        foreignKey({
            columns: [table.groupId],
            foreignColumns: [group.id],
            name: "Item_groupId_fkey",
        })
            .onUpdate("cascade")
            .onDelete("cascade"),
    ]
);

export const order = pgTable(
    "Order",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        userId: bigint({ mode: "number" }).notNull(),
        itemId: bigint({ mode: "number" }).notNull(),
        transitId: bigint({ mode: "number" }),
        count: integer().default(1).notNull(),
        status: orderStatus().default("PENDING").notNull(),
        createdAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
            .notNull(),
        comment: text(),
    },
    (table) => [
        uniqueIndex("Order_userId_itemId_key").using(
            "btree",
            table.userId.asc().nullsLast().op("int4_ops"),
            table.itemId.asc().nullsLast().op("int4_ops")
        ),
        foreignKey({
            columns: [table.itemId],
            foreignColumns: [item.id],
            name: "Order_itemId_fkey",
        })
            .onUpdate("cascade")
            .onDelete("cascade"),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "Order_userId_fkey",
        })
            .onUpdate("cascade")
            .onDelete("cascade"),
        foreignKey({
            columns: [table.transitId],
            foreignColumns: [transit.id],
            name: "Order_transitId_fkey",
        })
            .onUpdate("cascade")
            .onDelete("set null"),
    ]
);

export const transit = pgTable(
    "Transit",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        type: transitType().default("LOGISTICS").notNull(),
        ticketNum: text(),
        carrier: text().notNull(),
        tax: decimal({ mode: "number" }),
        fee: decimal({ mode: "number" }),
        status: transitStatus().default("PENDING").notNull(),
        createdAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
            .notNull(),
        comment: text(),
    },
    (table) => [uniqueIndex("Transit_ticketNum_key").using("btree", table.ticketNum.asc().nullsLast().op("text_ops"))]
);

export const delivery = pgTable(
    "Delivery",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        userId: bigint({ mode: "number" }).notNull(),
        recipient: text().notNull(),
        phone: text(),
        address: text(),
        company: deliveryCompany(),
        status: deliveryStatus().default("PENDING").notNull(),
        createdAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        comment: text(),
        taskId: text(),
        ticketId: text(),
        ticketNum: text(),
        queryToken: text(),
        updatedAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        uniqueIndex("Delivery_taskId_key").using("btree", table.taskId.asc().nullsLast().op("text_ops")),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "Delivery_userId_fkey",
        })
            .onUpdate("cascade")
            .onDelete("cascade"),
    ]
);

export const payment = pgTable(
    "Payment",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        userId: bigint({ mode: "number" }).notNull(),
        requestId: text(),
        refId: bigint({ mode: "number" }).notNull(),
        type: paymentType().notNull(),
        amount: decimal({ mode: "number" }).notNull(),
        method: paymentMethod(),
        currency: text().default("CNY").notNull(),
        currencyRate: decimal({ mode: "number" }).default(1).notNull(),
        createdAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        paidAt: timestamp({ mode: "date" }),
        comment: text(),
    },
    (table) => [
        uniqueIndex("Payment_requestId_key").using("btree", table.requestId.asc().nullsLast().op("text_ops")),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "Payment_userId_fkey",
        })
            .onUpdate("cascade")
            .onDelete("cascade"),
    ]
);

export const refundRequest = pgTable(
    "RefundRequest",
    {
        id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
        paymentId: bigint({ mode: "bigint" }).notNull(),
        requestId: text().notNull(),
        amount: decimal({ mode: "number" }).notNull(),
        createdAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        uniqueIndex("RefundRequest_requestId_key").using("btree", table.requestId.asc().nullsLast().op("text_ops")),
        foreignKey({
            columns: [table.paymentId],
            foreignColumns: [payment.id],
            name: "RefundRequest_paymentId_fkey",
        })
            .onUpdate("cascade")
            .onDelete("cascade"),
    ]
);

export const user = pgTable(
    "User",
    {
        id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
        name: text().notNull(),
        qq: text().notNull(),
        email: text(),
        createdAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
        uniqueIndex("User_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
        uniqueIndex("User_qq_key").using("btree", table.qq.asc().nullsLast().op("text_ops")),
    ]
);

export const address = pgTable(
    "Address",
    {
        id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
        userId: bigint({ mode: "bigint" }).notNull(),
        recipient: text().notNull(),
        phone: text().notNull(),
        address: text().notNull(),
    },
    (table) => [
        uniqueIndex("Address_userId_recipient_phone_address_key").using(
            "btree",
            table.userId.asc().nullsLast(),
            table.recipient.asc().nullsLast(),
            table.phone.asc().nullsLast(),
            table.address.asc().nullsLast()
        ),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "Address_userId_fkey",
        })
            .onUpdate("restrict")
            .onDelete("cascade"),
    ]
);

export const deliveryToOrder = pgTable(
    "_DeliveryToOrder",
    {
        a: bigint("A", { mode: "number" }).notNull(),
        b: bigint("B", { mode: "number" }).notNull(),
    },
    (table) => [
        index().using("btree", table.b.asc().nullsLast().op("int4_ops")),
        foreignKey({
            columns: [table.a],
            foreignColumns: [delivery.id],
            name: "_DeliveryToOrder_A_fkey",
        })
            .onUpdate("cascade")
            .onDelete("cascade"),
        foreignKey({
            columns: [table.b],
            foreignColumns: [order.id],
            name: "_DeliveryToOrder_B_fkey",
        })
            .onUpdate("cascade")
            .onDelete("cascade"),
        primaryKey({ columns: [table.b, table.a], name: "_DeliveryToOrder_AB_pkey" }),
    ]
);
