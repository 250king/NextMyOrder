-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."DeliveryCompany" AS ENUM('SF', 'YTO', 'ZTO', 'JD');--> statement-breakpoint
CREATE TYPE "public"."DeliveryStatus" AS ENUM('PENDING', 'PUSHED', 'TRANSITING', 'DELIVERING', 'ARRIVED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."OrderStatus" AS ENUM('PENDING', 'CONFIRMED', 'PURCHASED', 'TRANSITING', 'ARRIVED', 'DELIVERING', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."PaymentMethod" AS ENUM('WECHAT', 'ALIPAY', 'JDPAY', 'UNIONPAY', 'CASH');--> statement-breakpoint
CREATE TYPE "public"."PaymentType" AS ENUM('LIST', 'TAX', 'TRANSIT', 'DELIVERY');--> statement-breakpoint
CREATE TYPE "public"."TransitStatus" AS ENUM('PENDING', 'DISPATCHED_TRANSIT', 'OVERSEA_TRANSIT', 'CUSTOMS', 'DELIVERED_TRANSIT', 'ARRIVED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."TransitType" AS ENUM('LOGISTICS', 'PERSONAL');--> statement-breakpoint
CREATE TABLE "Setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "Group" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"qq" text NOT NULL,
	"deadline" timestamp(3) NOT NULL,
	"ended" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "List" (
	"userId" integer NOT NULL,
	"groupId" integer NOT NULL,
	"joinedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Item" (
	"id" serial PRIMARY KEY NOT NULL,
	"groupId" integer NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"image" text,
	"price" double precision NOT NULL,
	"weight" double precision,
	"allowed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Order" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"itemId" integer NOT NULL,
	"transitId" integer,
	"count" integer DEFAULT 1 NOT NULL,
	"status" "OrderStatus" DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"comment" text
);
--> statement-breakpoint
CREATE TABLE "Transit" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "TransitType" DEFAULT 'LOGISTICS' NOT NULL,
	"ticketNum" text,
	"carrier" text NOT NULL,
	"tax" double precision,
	"fee" double precision,
	"status" "TransitStatus" DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"comment" text
);
--> statement-breakpoint
CREATE TABLE "Delivery" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"recipient" text NOT NULL,
	"phone" text,
	"address" text,
	"company" "DeliveryCompany",
	"status" "DeliveryStatus" DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"comment" text,
	"taskId" text,
	"ticketId" text,
	"ticketNum" text,
	"queryToken" text
);
--> statement-breakpoint
CREATE TABLE "Payment" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"requestId" text,
	"refId" integer NOT NULL,
	"type" "PaymentType" NOT NULL,
	"amount" double precision NOT NULL,
	"payMethod" "PaymentMethod",
	"currency" text DEFAULT 'CNY' NOT NULL,
	"currencyRate" double precision DEFAULT 1 NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"paidAt" timestamp(3),
	"comment" text
);
--> statement-breakpoint
CREATE TABLE "RefundRequest" (
	"id" serial PRIMARY KEY NOT NULL,
	"paymentId" integer NOT NULL,
	"requestId" text NOT NULL,
	"amount" double precision NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"qq" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_DeliveryToOrder" (
	"A" integer NOT NULL,
	"B" integer NOT NULL,
	CONSTRAINT "_DeliveryToOrder_AB_pkey" PRIMARY KEY("B","A")
);
--> statement-breakpoint
ALTER TABLE "List" ADD CONSTRAINT "List_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "List" ADD CONSTRAINT "List_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Item" ADD CONSTRAINT "Item_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_transitId_fkey" FOREIGN KEY ("transitId") REFERENCES "public"."Transit"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_DeliveryToOrder" ADD CONSTRAINT "_DeliveryToOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Delivery"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "_DeliveryToOrder" ADD CONSTRAINT "_DeliveryToOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Order"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "Group_name_key" ON "Group" USING btree ("name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Group_qq_key" ON "Group" USING btree ("qq" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "List_userId_groupId_key" ON "List" USING btree ("userId" int4_ops,"groupId" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Item_groupId_url_key" ON "Item" USING btree ("groupId" int4_ops,"url" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Order_userId_itemId_key" ON "Order" USING btree ("userId" int4_ops,"itemId" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Transit_ticketNum_key" ON "Transit" USING btree ("ticketNum" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Delivery_taskId_key" ON "Delivery" USING btree ("taskId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "Payment_requestId_key" ON "Payment" USING btree ("requestId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "RefundRequest_requestId_key" ON "RefundRequest" USING btree ("requestId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_name_key" ON "User" USING btree ("name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "User_qq_key" ON "User" USING btree ("qq" text_ops);--> statement-breakpoint
CREATE INDEX "_DeliveryToOrder_B_index" ON "_DeliveryToOrder" USING btree ("B" int4_ops);--> statement-breakpoint
CREATE VIEW "public"."UserView" AS (SELECT id, CASE WHEN address IS NOT NULL AND phone IS NOT NULL THEN true ELSE false END AS completed FROM "User");--> statement-breakpoint
CREATE VIEW "public"."GroupView" AS (SELECT id, CASE WHEN NOT (EXISTS ( SELECT 1 FROM "Item" i JOIN "Order" o ON o."itemId" = i.id WHERE i."groupId" = g.id AND o.status <> 'COMPLETED'::"OrderStatus")) AND (EXISTS ( SELECT 1 FROM "Item" i JOIN "Order" o ON o."itemId" = i.id WHERE i."groupId" = g.id)) THEN true ELSE false END AS completed FROM "Group" g);--> statement-breakpoint
CREATE VIEW "public"."ListView" AS (SELECT "userId", "groupId", CASE WHEN (EXISTS ( SELECT 1 FROM "Order" o JOIN "Item" i ON o."itemId" = i.id WHERE o."userId" = l."userId" AND i."groupId" = l."groupId")) AND NOT (EXISTS ( SELECT 1 FROM "Order" o JOIN "Item" i ON o."itemId" = i.id WHERE o."userId" = l."userId" AND i."groupId" = l."groupId" AND o.status = 'PENDING'::"OrderStatus")) THEN true ELSE false END AS confirmed, CASE WHEN (EXISTS ( SELECT 1 FROM "Order" o JOIN "Item" i ON o."itemId" = i.id WHERE o."userId" = l."userId" AND i."groupId" = l."groupId")) AND NOT (EXISTS ( SELECT 1 FROM "Order" o JOIN "Item" i ON o."itemId" = i.id WHERE o."userId" = l."userId" AND i."groupId" = l."groupId" AND o.status <> 'COMPLETED'::"OrderStatus")) THEN true ELSE false END AS finished, CASE WHEN (EXISTS ( SELECT 1 FROM "Order" o JOIN "Item" i ON o."itemId" = i.id WHERE o."userId" = l."userId" AND i."groupId" = l."groupId")) THEN true ELSE false END AS has FROM "List" l);
*/