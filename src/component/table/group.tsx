"use client";
import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {DataGrid, GridColDef, GridRenderCellParams} from "@mui/x-data-grid";
import {useRouter} from "next/navigation";
import {Group} from "@/lib/prisma";

interface Props {
    groups: Group[]
}

const GroupTable = (props: Props) => {
    const [mounted, setMounted] = React.useState(false);
    const router = useRouter();
    const columns: GridColDef[] = [
        {field: "id", headerName: "ID"},
        {
            field: "name",
            headerName: "团购信息",
            width: 250,
            renderCell: (params: GridRenderCellParams<Group, string>) => (
                <Stack direction="column" spacing={0.5}>
                    <Typography>{params.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{params.row.qq}</Typography>
                </Stack>
            )
        },
        {field: "createAt", headerName: "创建时间", type: "dateTime", width: 180}
    ]
    React.useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <DataGrid
            columns={columns}
            rows={props.groups}
            onRowClick={(params) => {
                router.push(`/group/${params.id}`)
            }}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 10,
                    },
                },
            }}
        />
    );
}

export default GroupTable;
