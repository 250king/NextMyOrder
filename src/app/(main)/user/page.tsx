"use client";
import React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {User} from "@/lib/prisma";
import {
    DataGrid,
    GridColDef,
    GridDataSource,
    GridRenderCellParams,
    useGridApiRef
} from "@mui/x-data-grid";

const Page = () => {
    const table = useGridApiRef()
    const data: GridDataSource = {
        async getRows(params) {
            const query = new URLSearchParams({
                page: ((params.paginationModel?.page || 0)).toString(),
                size: (params.paginationModel?.pageSize || 10).toString(),
                sort: params.sortModel[0]?.field || "id",
                order: params.sortModel[0]?.sort || "asc"
            })
            const result = await ((await fetch(`/api/user?${query.toString()}`)).json());
            return {
                rows: result.items,
                rowCount: result.total
            }
        }
    }
    const columns: GridColDef[] = [
        {field: "id", headerName: "ID"},
        {
            field: "qq",
            headerName: "用户信息",
            width: 250,
            renderCell: (params: GridRenderCellParams<User, number>) => (
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${params.value}&s=0`}/>
                    <Stack direction="column" spacing={0.5}>
                        <Typography>{params.row.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{params.value}</Typography>
                    </Stack>
                </Stack>
            )
        },
        {
            field: "createAt",
            headerName: "创建时间",
            type: "dateTime",
            width: 180,
            valueGetter: (value: string) => {
                return new Date(value);
            }
        }
    ]

    return (
        <Container sx={{mt: 2, height: 700}} fixed>
            <Button variant="contained" sx={{mb: 2}} onClick={() => {}}>添加</Button>
            <DataGrid
                checkboxSelection
                pageSizeOptions={[10, 20, 50]}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 10,
                            page: 0
                        },
                        rowCount: 0
                    }
                }}
                apiRef={table}
                columns={columns}
                dataSource={data}
            />
        </Container>
    );
}

export default Page;
