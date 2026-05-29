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
    "CANCELLED",
]);
export const PaymentMethod = pgEnum("PaymentMethod", ["WECHAT", "ALIPAY", "JDPAY", "UNIONPAY", "CASH"]);
export const PaymentType = pgEnum("PaymentType", ["LIST", "TAX", "TRANSIT", "DELIVERY"]);
export const TransitStatus = pgEnum("TransitStatus", [
    "PENDING",
    "DISPATCHED_TRANSIT",
    "OVERSEA_TRANSIT",
    "CUSTOMS",
    "DELIVERED_TRANSIT",
    "ARRIVED",
    "CANCELLED",
]);
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
        createdAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP`)
            .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (table) => [uniqueIndex().using("btree", table.name, table.qq)]
);

export const List = pgTable(
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
            foreignColumns: [Group.id],
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [User.id],
        }).onDelete("cascade"),
    ]
);

export const Item = pgTable(
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
            foreignColumns: [Group.id],
        }).onDelete("cascade"),
    ]
);

export const Order = pgTable(
    "Order",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        userId: bigint({ mode: "number" }).notNull(),
        itemId: bigint({ mode: "number" }).notNull(),
        transitId: bigint({ mode: "number" }),
        count: integer().default(1).notNull(),
        status: OrderStatus().default("PENDING").notNull(),
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
            foreignColumns: [Item.id],
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [User.id],
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.transitId],
            foreignColumns: [Transit.id],
        }).onDelete("cascade"),
    ]
);

export const Transit = pgTable(
    "Transit",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        type: TransitType().default("LOGISTICS").notNull(),
        ticketNum: text(),
        carrier: text().notNull(),
        tax: decimal({ mode: "number" }),
        fee: decimal({ mode: "number" }),
        status: TransitStatus().default("PENDING").notNull(),
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

export const Delivery = pgTable(
    "Delivery",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        userId: bigint({ mode: "number" }).notNull(),
        recipient: text().notNull(),
        phone: text(),
        address: text(),
        company: DeliveryCompany(),
        status: DeliveryStatus().default("PENDING").notNull(),
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
            foreignColumns: [User.id],
        }).onDelete("cascade"),
    ]
);

export const Payment = pgTable(
    "Payment",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        userId: bigint({ mode: "number" }).notNull(),
        requestId: text(),
        refId: bigint({ mode: "number" }).notNull(),
        type: PaymentType().notNull(),
        amount: decimal({ mode: "number" }).notNull(),
        method: PaymentMethod(),
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
            foreignColumns: [User.id],
        }).onDelete("cascade"),
    ]
);

export const RefundRequest = pgTable(
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
            foreignColumns: [Payment.id],
        }).onDelete("cascade"),
    ]
);

export const User = pgTable(
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

export const Address = pgTable(
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
            foreignColumns: [User.id],
        }).onDelete("cascade"),
    ]
);

export const DeliveryToOrder = pgTable(
    "_DeliveryToOrder",
    {
        deliveryId: bigint("A", { mode: "number" }).notNull(),
        orderId: bigint("B", { mode: "number" }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.deliveryId],
            foreignColumns: [Delivery.id],
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.orderId],
            foreignColumns: [Order.id],
        }).onDelete("cascade"),
        primaryKey({ columns: [table.deliveryId, table.orderId] }),
    ]
);

export const TicketLink = pgTable(
    "TicketLink",
    {
        id: bigserial({ mode: "number" }).primaryKey().notNull(),
        code: text().notNull(),
        deliveryId: bigint({ mode: "number" }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.deliveryId],
            foreignColumns: [Delivery.id]
        }),
        uniqueIndex().using("btree", table.code),
    ]
)
