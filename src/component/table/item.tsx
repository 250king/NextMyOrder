"use client";
import React from "react";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {Item} from "@/lib/prisma";

interface Props {
    items: Item[]
}

const ItemTable = (props: Props) => {
    const [mounted, setMounted] = React.useState(false);
    const columns: GridColDef[] = [
        {field: "id", headerName: "ID"},
        {field: "name", headerName: "商品名", width: 250},
        {field: "price", headerName: "单价", type: "number"},
        {field: "weight", headerName: "重量", type: "number"},
        {field: "allowed", headerName: "已通过", type: "boolean"}
    ]
    React.useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return null;
    }

    return (
        <DataGrid
            columns={columns}
            rows={props.items}
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

export default ItemTable;
