import { sql } from "drizzle-orm"
import { pgTable, text, uniqueIndex, serial, timestamp, boolean, foreignKey, integer, doublePrecision, index, primaryKey, pgView, pgEnum } from "drizzle-orm/pg-core"

export const deliveryCompany = pgEnum("DeliveryCompany", ['SF', 'YTO', 'ZTO', 'JD'])
export const deliveryStatus = pgEnum("DeliveryStatus", ['PENDING', 'PUSHED', 'TRANSITING', 'DELIVERING', 'ARRIVED', 'CANCELLED'])
export const orderStatus = pgEnum("OrderStatus", ['PENDING', 'CONFIRMED', 'PURCHASED', 'TRANSITING', 'ARRIVED', 'DELIVERING', 'COMPLETED', 'CANCELLED'])
export const paymentMethod = pgEnum("PaymentMethod", ['WECHAT', 'ALIPAY', 'JDPAY', 'UNIONPAY', 'CASH'])
export const paymentType = pgEnum("PaymentType", ['LIST', 'TAX', 'TRANSIT', 'DELIVERY'])
export const transitStatus = pgEnum("TransitStatus", ['PENDING', 'DISPATCHED_TRANSIT', 'OVERSEA_TRANSIT', 'CUSTOMS', 'DELIVERED_TRANSIT', 'ARRIVED', 'CANCELLED'])
export const transitType = pgEnum("TransitType", ['LOGISTICS', 'PERSONAL'])


export const setting = pgTable("Setting", {
	key: text().primaryKey().notNull(),
	value: text(),
});

export const group = pgTable("Group", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	qq: text().notNull(),
	deadline: timestamp({ precision: 3, mode: 'string' }).notNull(),
	ended: boolean().default(false).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("Group_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("Group_qq_key").using("btree", table.qq.asc().nullsLast().op("text_ops")),
]);

export const list = pgTable("List", {
	userId: integer().notNull(),
	groupId: integer().notNull(),
	joinedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("List_userId_groupId_key").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.groupId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [group.id],
			name: "List_groupId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "List_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const item = pgTable("Item", {
	id: serial().primaryKey().notNull(),
	groupId: integer().notNull(),
	name: text().notNull(),
	url: text().notNull(),
	image: text(),
	price: doublePrecision().notNull(),
	weight: doublePrecision(),
	allowed: boolean().default(false).notNull(),
}, (table) => [
	uniqueIndex("Item_groupId_url_key").using("btree", table.groupId.asc().nullsLast().op("int4_ops"), table.url.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.groupId],
			foreignColumns: [group.id],
			name: "Item_groupId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const order = pgTable("Order", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	itemId: integer().notNull(),
	transitId: integer(),
	count: integer().default(1).notNull(),
	status: orderStatus().default('PENDING').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	comment: text(),
}, (table) => [
	uniqueIndex("Order_userId_itemId_key").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.itemId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.itemId],
			foreignColumns: [item.id],
			name: "Order_itemId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Order_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.transitId],
			foreignColumns: [transit.id],
			name: "Order_transitId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const transit = pgTable("Transit", {
	id: serial().primaryKey().notNull(),
	type: transitType().default('LOGISTICS').notNull(),
	ticketNum: text(),
	carrier: text().notNull(),
	tax: doublePrecision(),
	fee: doublePrecision(),
	status: transitStatus().default('PENDING').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	comment: text(),
}, (table) => [
	uniqueIndex("Transit_ticketNum_key").using("btree", table.ticketNum.asc().nullsLast().op("text_ops")),
]);

export const delivery = pgTable("Delivery", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	recipient: text().notNull(),
	phone: text(),
	address: text(),
	company: deliveryCompany(),
	status: deliveryStatus().default('PENDING').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	comment: text(),
	taskId: text(),
	ticketId: text(),
	ticketNum: text(),
	queryToken: text(),
}, (table) => [
	uniqueIndex("Delivery_taskId_key").using("btree", table.taskId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Delivery_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const payment = pgTable("Payment", {
	id: serial().primaryKey().notNull(),
	userId: integer().notNull(),
	requestId: text(),
	refId: integer().notNull(),
	type: paymentType().notNull(),
	amount: doublePrecision().notNull(),
	method: paymentMethod(),
	currency: text().default('CNY').notNull(),
	currencyRate: doublePrecision().default(1).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	paidAt: timestamp({ precision: 3, mode: 'string' }),
	comment: text(),
}, (table) => [
	uniqueIndex("Payment_requestId_key").using("btree", table.requestId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Payment_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const refundRequest = pgTable("RefundRequest", {
	id: serial().primaryKey().notNull(),
	paymentId: integer().notNull(),
	requestId: text().notNull(),
	amount: doublePrecision().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("RefundRequest_requestId_key").using("btree", table.requestId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.paymentId],
			foreignColumns: [payment.id],
			name: "RefundRequest_paymentId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const user = pgTable("User", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	qq: text().notNull(),
	email: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("User_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("User_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("User_qq_key").using("btree", table.qq.asc().nullsLast().op("text_ops")),
]);

export const deliveryToOrder = pgTable("_DeliveryToOrder", {
	a: integer("A").notNull(),
	b: integer("B").notNull(),
}, (table) => [
	index().using("btree", table.b.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.a],
			foreignColumns: [delivery.id],
			name: "_DeliveryToOrder_A_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.b],
			foreignColumns: [order.id],
			name: "_DeliveryToOrder_B_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	primaryKey({ columns: [table.b, table.a], name: "_DeliveryToOrder_AB_pkey"}),
]);
export const userView = pgView("UserView", {	id: integer(),
	completed: boolean(),
}).as(sql`SELECT id, CASE WHEN address IS NOT NULL AND phone IS NOT NULL THEN true ELSE false END AS completed FROM "User"`);

export const groupView = pgView("GroupView", {	id: integer(),
	completed: boolean(),
}).as(sql`SELECT id, CASE WHEN NOT (EXISTS ( SELECT 1 FROM "Item" i JOIN "Order" o ON o."itemId" = i.id WHERE i."groupId" = g.id AND o.status <> 'COMPLETED'::"OrderStatus")) AND (EXISTS ( SELECT 1 FROM "Item" i JOIN "Order" o ON o."itemId" = i.id WHERE i."groupId" = g.id)) THEN true ELSE false END AS completed FROM "Group" g`);

export const listView = pgView("ListView", {	userId: integer(),
	groupId: integer(),
	confirmed: boolean(),
	finished: boolean(),
	has: boolean(),
}).as(sql`SELECT "userId", "groupId", CASE WHEN (EXISTS ( SELECT 1 FROM "Order" o JOIN "Item" i ON o."itemId" = i.id WHERE o."userId" = l."userId" AND i."groupId" = l."groupId")) AND NOT (EXISTS ( SELECT 1 FROM "Order" o JOIN "Item" i ON o."itemId" = i.id WHERE o."userId" = l."userId" AND i."groupId" = l."groupId" AND o.status = 'PENDING'::"OrderStatus")) THEN true ELSE false END AS confirmed, CASE WHEN (EXISTS ( SELECT 1 FROM "Order" o JOIN "Item" i ON o."itemId" = i.id WHERE o."userId" = l."userId" AND i."groupId" = l."groupId")) AND NOT (EXISTS ( SELECT 1 FROM "Order" o JOIN "Item" i ON o."itemId" = i.id WHERE o."userId" = l."userId" AND i."groupId" = l."groupId" AND o.status <> 'COMPLETED'::"OrderStatus")) THEN true ELSE false END AS finished, CASE WHEN (EXISTS ( SELECT 1 FROM "Order" o JOIN "Item" i ON o."itemId" = i.id WHERE o."userId" = l."userId" AND i."groupId" = l."groupId")) THEN true ELSE false END AS has FROM "List" l`);