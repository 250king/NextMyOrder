import { relations } from "drizzle-orm/relations";
import {
    Address,
    Delivery,
    DeliveryToOrder,
    Group,
    Item,
    List,
    Order,
    Payment,
    PaymentItem,
    RefundRequest,
    TicketLink,
    Transit,
    User,
} from "./schema";

export const listRelations = relations(List, ({ one }) => ({
    group: one(Group, {
        fields: [List.groupId],
        references: [Group.id],
    }),
    user: one(User, {
        fields: [List.userId],
        references: [User.id],
    }),
}));

export const groupRelations = relations(Group, ({ many }) => ({
    lists: many(List),
    items: many(Item),
}));

export const userRelations = relations(User, ({ many }) => ({
    lists: many(List),
    orders: many(Order),
    deliveries: many(Delivery),
    payments: many(Payment),
    addresses: many(Address),
}));

export const itemRelations = relations(Item, ({ one, many }) => ({
    group: one(Group, {
        fields: [Item.groupId],
        references: [Group.id],
    }),
    orders: many(Order),
}));

export const orderRelations = relations(Order, ({ one, many }) => ({
    item: one(Item, {
        fields: [Order.itemId],
        references: [Item.id],
    }),
    user: one(User, {
        fields: [Order.userId],
        references: [User.id],
    }),
    transit: one(Transit, {
        fields: [Order.transitId],
        references: [Transit.id],
    }),
    deliveryToOrders: many(DeliveryToOrder),
}));

export const transitRelations = relations(Transit, ({ many }) => ({
    orders: many(Order),
}));

export const deliveryRelations = relations(Delivery, ({ one, many }) => ({
    user: one(User, {
        fields: [Delivery.userId],
        references: [User.id],
    }),
    deliveryToOrders: many(DeliveryToOrder),
}));

export const paymentRelations = relations(Payment, ({ one, many }) => ({
    user: one(User, {
        fields: [Payment.userId],
        references: [User.id],
    }),
    refundRequests: many(RefundRequest),
    items: many(PaymentItem),
}));

export const paymentItemRelations = relations(PaymentItem, ({ one }) => ({
    payment: one(Payment, {
        fields: [PaymentItem.paymentId],
        references: [Payment.id],
    }),
}));

export const refundRequestRelations = relations(RefundRequest, ({ one }) => ({
    payment: one(Payment, {
        fields: [RefundRequest.paymentId],
        references: [Payment.id],
    }),
}));

export const addressRelations = relations(Address, ({ one }) => ({
    user: one(User, {
        fields: [Address.userId],
        references: [User.id],
    }),
}));

export const deliveryToOrderRelations = relations(DeliveryToOrder, ({ one }) => ({
    delivery: one(Delivery, {
        fields: [DeliveryToOrder.deliveryId],
        references: [Delivery.id],
    }),
    order: one(Order, {
        fields: [DeliveryToOrder.orderId],
        references: [Order.id],
    }),
}));

export const ticketLinkRelations = relations(TicketLink, ({ one }) => ({
    delivery: one(Delivery, {
        fields: [TicketLink.deliveryId],
        references: [Delivery.id],
    }),
}));
