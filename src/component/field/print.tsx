"use client";
import React from "react";
import printLabel from "@/util/print/label";
import {App, Button, Image, Space, Spin} from "antd";
import {useControlModel, WithControlPropsType} from "@ant-design/pro-form";

type Props = WithControlPropsType<{
    data?: Record<string, unknown>;
    image: string
}>

const PrintField = (props: Props) => {
    const message = App.useApp().message;
    const model = useControlModel(props);
    const [loading, setLoading] = React.useState(false);
    React.useEffect(() => {
        if (!props.data) {
            setLoading(false)
        }
    }, [props.data])

    return (
        <Space size="large" direction="vertical">
            {
                props.image === ""? (
                    <div style={{width: 420, height: 200, display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <Spin/>
                    </div>
                ): (
                    <Image src={`data:image/jpeg;base64,${props.image}`} alt="" preview={false}/>
                )
            }
            <Button
                type="primary"
                loading={loading}
                onClick={async () => {
                    try {
                        setLoading(true);
                        await printLabel(props.data!, true);
                        model.onChange(true);
                    }
                    catch {
                        message.error("打印失败，请稍后再试");
                    }
                    finally {
                        setLoading(false);
                    }
                }}
            >
                打印
            </Button>
        </Space>
    );
}

export default PrintField;
