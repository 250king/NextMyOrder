"use client";
import React from "react";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {DataGrid, GridColDef, GridRenderCellParams} from "@mui/x-data-grid";
import {User} from "@/lib/prisma";

interface Props {
    users: User[]
}

const JoinTable = (props: Props) => {
    const [mounted, setMounted] = React.useState(false);
    const columns: GridColDef[] = [
        {field: "id", headerName: "ID"},
        {
            field: "name",
            headerName: "用户信息",
            width: 250,
            renderCell: (params: GridRenderCellParams<User, string>) => (
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${params.row.qq}&s=0`}/>
                    <Stack direction="column" spacing={0.5}>
                        <Typography>{params.value}</Typography>
                        <Typography variant="body2" color="text.secondary">{params.row.qq}</Typography>
                    </Stack>
                </Stack>
            )
        },
        {
            field: "join.createAt",
            headerName: "加入时间",
            type: "dateTime",
            width: 180,
            valueGetter: (_value, row) => row.groups[0].createAt
        }
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
            rows={props.users}
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

export default JoinTable;
