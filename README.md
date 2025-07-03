# NextMyOrder

一个基于Next.js的团购管理系统。

## 简介

现团购规模越来越大，要处理的数据也越来越多，传统的Excel表格虽然容易实行，但其与其他环节的联动性差，局限性也很大，大多数地方依旧要手动处理，在大规模的情况下效率很低，而且容易出现问题。

因无法忍受低效处理，遂依借自己的一技之长，尝试性开发这一套系统。除了基本的订单和团购管理，还与标签机、快递公司API等拓展功能联动，力求实现一站式的团购管理。

### 技术栈

主体使用Next.js，前端使用React、TypeScript，UI库选择Ant Design。

后端使用TRPC，数据库框架使用Prisma。

使用精臣标签机API打印标签，快递100 API完成C端寄件。

## 使用

> 注意：本项目仍在开发中，功能不完善，可能存在bug，仅供学习和参考使用，**不建议用于生产环境**。
> 
> 如果您对本项目感兴趣，欢迎参与开发和完善，提交issue或PR。

现在已经支持Docker部署，使用Docker可以更方便地进行部署。

```bash
docker run -d \
  --name nextmyorder \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://user:password@host:port/database" \
  -e APP_KEY="your_fast_express_api_key" \
  -e EXPRESS_KEY="your_fast_express_api_secret" \
  -e EXPRESS_SECRET="https://api.fast-express.com" \
  -e CALLBACK_URL="https://example.com/api/v1.0/webhook/delivery" \
  250king/nextmyorder:beta
```

### 环境变量说明
- `DATABASE_URL`: 用于配置Prisma与数据库连接，详情请参考[Prisma文档](https://www.prisma.io/docs/orm/reference/connection-urls)。
- `APP_KEY`: 应用加密密钥，请使用`openssl rand -base64 64 | tr -d '\n'`生成随机密钥
- `EXPRESS_KEY` `EXPRESS_SECRET`: 快递100 API密钥，请在[快递100官网](https://api.kuaidi100.com/manager/v2/myinfo/enterprise)申请。
- `CALLBACK_URL`: 快递100 API回调地址，需配置为您的服务器地址。

### 访问
访问`http://localhost:3000`即可访问系统。请注意，首次访问请在设置页面完成应用配置。

基本使用按照正常团购流程进行，创建团购、添加商品、添加订单等。具体教程正在编写中，敬请期待！

## 开发环境搭建

1. 克隆仓库
   ```bash
   git clone https://github.com/250king/NextMyOrder.git
   cd NextMyOrder
   ```
2. 安装依赖
   ```bash
   npm install
   ```
3. 配置环境变量。复制`.env.example`为`.env`并根据上面的环境变量说明进行修改
4. 初始化数据库
   ```bash
   npx prisma migrate dev --name init
   ```
5. 启动项目
   ```bash
   npm start
   ```

## ToDo
- [ ] 完善文档
- [ ] 部署支付系统
- [ ] 部署通知系统
- [ ] 降低使用门槛
- [ ] 完善批量处理
- [ ] 添加登录功能
- [ ] 提供更高的可拓展性
- [ ] 适配手机端

其中支付系统因为还没通过审核，还在研究中

然后关于可用性问题，最大问题是快递API是只面向企业，所以对于个体用户来说使用门槛较高，后续会考虑提供更简单的寄件方式。

关于本地化部署，现在也在研究了。

关于拓展性，目前通过URL解析商品信息是支持自行编写解析过程来适配每个网站。但像标签机目前只能使用精臣的标签机，后续会考虑提供更高的可拓展性，支持为不同的标签机提供不同的API
