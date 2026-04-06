import React from "react";
import { getGroupController } from "@/api/generated/group-controller/group-controller";
import { GetMembersParams } from "@/api/model";
import { MemberTable } from "@/component/table/member";
import { getConfig, getContext } from "@/util/context";

type PageProps = {
    searchParams: Promise<GetMembersParams>;
    params: Promise<{
        groupId: number;
    }>;
};

const Page = async ({ searchParams, params }: PageProps) => {
    const query = await params;
    const data = await searchParams;
    const context = await getContext();
    const members = await getGroupController().getMembers(query.groupId, data, getConfig(context));

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold">成员管理</h1>
                <MemberTable {...members} {...data} />
            </div>
        </div>
    );
};

export default Page;
