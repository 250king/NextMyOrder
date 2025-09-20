import {Result} from "antd";

const Page = () => {
    return (
        <div
            style={{
                minHeight: 'calc(100vh - 146px)', display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            }}
        >
            <Result status="error" title="404" subTitle="抱歉，你访问的页面不存在。"/>
        </div>
    );
};

export default Page;
