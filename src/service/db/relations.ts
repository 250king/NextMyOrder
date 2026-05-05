import { relations } from "drizzle-orm/relations";
import { group, list, user, item, order, transit, delivery, payment, refundRequest, deliveryToOrder } from "./schema";

export const listRelations = relations(list, ({one}) => ({
	group: one(group, {
		fields: [list.groupId],
		references: [group.id]
	}),
	user: one(user, {
		fields: [list.userId],
		references: [user.id]
	}),
}));

export const groupRelations = relations(group, ({many}) => ({
	lists: many(list),
	items: many(item),
}));

export const userRelations = relations(user, ({many}) => ({
	lists: many(list),
	orders: many(order),
	deliveries: many(delivery),
	payments: many(payment),
}));

export const itemRelations = relations(item, ({one, many}) => ({
	group: one(group, {
		fields: [item.groupId],
		references: [group.id]
	}),
	orders: many(order),
}));

export const orderRelations = relations(order, ({one, many}) => ({
	item: one(item, {
		fields: [order.itemId],
		references: [item.id]
	}),
	user: one(user, {
		fields: [order.userId],
		references: [user.id]
	}),
	transit: one(transit, {
		fields: [order.transitId],
		references: [transit.id]
	}),
	deliveryToOrders: many(deliveryToOrder),
}));

export const transitRelations = relations(transit, ({many}) => ({
	orders: many(order),
}));

export const deliveryRelations = relations(delivery, ({one, many}) => ({
	user: one(user, {
		fields: [delivery.userId],
		references: [user.id]
	}),
	deliveryToOrders: many(deliveryToOrder),
}));

export const paymentRelations = relations(payment, ({one, many}) => ({
	user: one(user, {
		fields: [payment.userId],
		references: [user.id]
	}),
	refundRequests: many(refundRequest),
}));

export const refundRequestRelations = relations(refundRequest, ({one}) => ({
	payment: one(payment, {
		fields: [refundRequest.paymentId],
		references: [payment.id]
	}),
}));

export const deliveryToOrderRelations = relations(deliveryToOrder, ({one}) => ({
	delivery: one(delivery, {
		fields: [deliveryToOrder.a],
		references: [delivery.id]
	}),
	order: one(order, {
		fields: [deliveryToOrder.b],
		references: [order.id]
	}),
}));