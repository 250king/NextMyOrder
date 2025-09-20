import {ProTable, ProTableProps} from "@ant-design/pro-table";
import {ParamsType} from "@ant-design/pro-components";

const BaseTable = <T extends Record<string, unknown>>(props: ProTableProps<T, ParamsType>) => {
    return (
        <ProTable
            {...props}
            rowKey="id"
            search={{
                filterType: "light",
            }}
            options={{
                search: {
                    allowClear: true,
                },
            }}
            pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
            }}
        />
    );
};

export default BaseTable;
