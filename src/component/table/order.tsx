"use client";
import React from "react";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {DataGrid, GridColDef, GridRenderCellParams} from "@mui/x-data-grid";
import {Order} from "@/lib/prisma";

interface Props {
    orders: Order[]
}

const OrderTable = (props: Props) => {
    const [mounted, setMounted] = React.useState(false);
    const columns: GridColDef[] = [
        {field: "id", headerName: "ID"},
        {
            field: "user.name",
            headerName: "用户信息",
            width: 250,
            valueGetter: (_value, row) => row.user.name,
            renderCell: (params: GridRenderCellParams<any, string>) => (
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${params.row.user.qq}&s=0`}/>
                    <Stack direction="column" spacing={0.5}>
                        <Typography>{params.value}</Typography>
                        <Typography variant="body2" color="text.secondary">{params.row.user.qq}</Typography>
                    </Stack>
                </Stack>
            )
        },
        {
            field: "item.name",
            headerName: "商品名",
            width: 200,
            valueGetter: (_value, row) => row.item.name
        },
        {field: "status", headerName: "状态"},
        {field: "count", headerName: "数量"},
        {field: "createAt", headerName: "创建时间", type: "dateTime", width: 180}
    ];
    React.useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return null;
    }

    return (
        <DataGrid
            columns={columns}
            rows={props.orders}
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

export default OrderTable;
