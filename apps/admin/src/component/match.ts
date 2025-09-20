import {match} from "path-to-regexp";

export const sc = match("/shipping/create");

export const sd = match("/shipping/:shippingId");

export const ll = match("/group/:groupId");

export const ld = match("/group/:groupId/list/:listId");

export const ls = match("/group/:groupId/purchase");

export const dc = match("/delivery/create");

export const dd = match("/delivery/:deliveryId");
