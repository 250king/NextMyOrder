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

export const groupStatus = pgEnum("GroupStatus", ["PENDING", "CLOSED", "COMPLETED"]);
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
        status: groupStatus().default("PENDING").notNull(),
        createdAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [uniqueIndex().using("btree", table.name), uniqueIndex().using("btree", table.qq)]
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
        primaryKey({
            columns: [table.userId, table.groupId],
        }),
        foreignKey({
            columns: [table.groupId],
            foreignColumns: [group.id],
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
        }).onDelete("cascade"),
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
        uniqueIndex().using("btree", table.groupId, table.url, table.name, table.price),
        foreignKey({
            columns: [table.groupId],
            foreignColumns: [group.id],
        }).onDelete("cascade"),
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
        uniqueIndex().using("btree", table.userId, table.itemId),
        foreignKey({
            columns: [table.itemId],
            foreignColumns: [item.id],
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.transitId],
            foreignColumns: [transit.id],
        }).onDelete("cascade"),
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
    (table) => [uniqueIndex().using("btree", table.ticketNum)]
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
        uniqueIndex().using("btree", table.taskId),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
        }).onDelete("cascade"),
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
        uniqueIndex().using("btree", table.requestId),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
        }).onDelete("cascade"),
    ]
);

export const refundRequest = pgTable(
    "RefundRequest",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        paymentId: bigint({ mode: "number" }).notNull(),
        requestId: text().notNull(),
        amount: decimal({ mode: "number" }).notNull(),
        createdAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [
        uniqueIndex().using("btree", table.requestId),
        foreignKey({
            columns: [table.paymentId],
            foreignColumns: [payment.id],
        }).onDelete("cascade"),
    ]
);

export const user = pgTable(
    "User",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
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
        uniqueIndex().using("btree", table.email),
        uniqueIndex().using("btree", table.name),
        uniqueIndex().using("btree", table.qq),
    ]
);

export const address = pgTable(
    "Address",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        userId: bigint({ mode: "number" }).notNull(),
        recipient: text().notNull(),
        phone: text().notNull(),
        address: text().notNull(),
    },
    (table) => [
        uniqueIndex().using("btree", table.userId, table.recipient, table.phone, table.address),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
        }).onDelete("cascade"),
    ]
);

export const deliveryToOrder = pgTable(
    "_DeliveryToOrder",
    {
        a: bigint("A", { mode: "number" }).notNull(),
        b: bigint("B", { mode: "number" }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.a],
            foreignColumns: [delivery.id],
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.b],
            foreignColumns: [order.id],
        }).onDelete("cascade"),
        primaryKey({ columns: [table.b, table.a] }),
    ]
);
