import { Order } from "@/service/db/schema";
import { ItemResult } from "@/type/item";
import { TransitResult } from "@/type/transit";
import { UserResult } from "@/type/user";

export type OrderResult = typeof Order.$inferSelect & {
    user: UserResult;
    item: ItemResult;
    transit: TransitResult | null;
}
