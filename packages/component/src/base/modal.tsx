import {ModalForm, ModalFormProps} from "@ant-design/pro-form";
import React from "react";

const BaseModalForm = (props: ModalFormProps & React.PropsWithChildren) => {
    return (
        <ModalForm
            {...props}
            modalProps={{
                destroyOnHidden: true,
            }}
        >
            {props.children}
        </ModalForm>
    );
};

export default BaseModalForm;
