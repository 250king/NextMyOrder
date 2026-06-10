import { Item } from "@/service/db/schema";
import { GroupResult } from "@/type/group";

export type ItemResult = typeof Item.$inferSelect & {
    group: GroupResult;
}
