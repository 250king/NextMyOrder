import React from "react";
import {Button} from "antd";

const UnselectWeight = (props: {
    action: () => void,
}) => {
    return (
        <Button type="link" onClick={props.action}>取消选择</Button>
    );
};

export default UnselectWeight;
