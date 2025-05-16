# edgetunnel

在 Cloudflare Workers/Pages 运行 VLESS 代理。

## 快速部署

### Cloudflare Pages

1. 注册 Cloudflare 账号
2. 在 [Releases](https://github.com/shyinsei/edgetunnel/releases) 下载 `worker.zip` 文件
3. 新建 Pages，选择上传文件，选中下载的 `worker.zip` 文件上传
4. 设置相关环境变量
5. 重新上传文件使环境变量生效

### Cloudflare Workers

1. 注册 Cloudflare 账号
2. 在 [Releases](https://github.com/shyinsei/edgetunnel/releases) 下载 `worker.zip` 文件
3. 创建 Worker 项目，编辑代码，复制并粘贴 `worker.zip` 内的 `_worker.js` 文件内容
4. 设置相关环境变量

## 环境变量

| 变量名称   | 说明                                                                                  | 示例                                                                        |
| ---------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `UUID`     | 设置 UUID，这是访问代理的凭据，可设置多个（中间用英文逗号分隔）                       | `c9dde940-72ae-4dba-ab44-3a5f7abfd226,210acab7-bd49-4bbb-8d4a-7a1f66bc5dbc` |
| `PROXY_IP` | 代理 IP，设置此变量可访问使用 Cloudflare CDN 的网站，可设置多个（中间用英文逗号分隔） | `132.145.127.203:8443,141.145.216.142:2087`                                 |
