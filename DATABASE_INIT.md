# 数据库初始化指南

## 问题

`/api/health` 返回错误：
```
The table `public.Task` does not exist in current database
```

这是因为数据库还没有初始化表结构。

## 解决方案

### 方法一：在 Vercel Dashboard 中初始化（推荐）

1. **进入 Vercel 项目 Dashboard**
   - 访问 [vercel.com](https://vercel.com)
   - 进入你的 `kaoyan-tracker` 项目

2. **进入最新部署**
   - 点击 **Deployments** 标签
   - 找到最新的部署记录
   - 点击进入

3. **打开 Vercel CLI**

   有两种方式：

   **方式 A：使用 Vercel CLI（如果你已安装）**
   ```bash
   cd /path/to/kaoyan-tracker
   vercel login
   vercel --prod
   ```

   **方式 B：使用 Vercel Dashboard 中的终端**
   - 在部署详情页，点击终端图标
   - 或者进入项目 → **Settings** → **General**
   - 滚动到 "Vercel CLI"
   - 运行以下命令

4. **初始化数据库**

   在 Vercel CLI 中运行：

   ```bash
   npx prisma db push
   ```

   你会看到类似输出：

   ```
   ✔ Generated Prisma Client to ./node_modules/.prisma/client
   🚀  The following database changes are being applied:

   ...

   🚀  Your database is now in sync with your Prisma schema. Happy hacking!
   ```

### 方法二：使用本地环境初始化

如果你有本地开发环境：

1. **克隆项目到本地**
   ```bash
   git clone https://github.com/iocion/kaoyan-tracker.git
   cd kaoyan-tracker
   npm install
   ```

2. **配置环境变量**

   在 Vercel Dashboard → Settings → Environment Variables

   复制以下环境变量的值：
   - `POSTGRES_URL`
   - `POSTGRES_URL_NO_SSL`
   - `DATABASE_URL`
   - `POSTGRES_PRISMA_URL`

   在本地创建 `.env` 文件：

   ```env
   POSTGRES_URL=复制 Vercel 的值
   POSTGRES_URL_NO_SSL=复制 Vercel 的值
   DATABASE_URL=复制 Vercel 的值
   POSTGRES_PRISMA_URL=复制 Vercel 的值
   ```

3. **初始化数据库**

   ```bash
   npx prisma db push
   ```

### 方法三：使用 Vercel Postgres 仪表板

如果你使用的是 Vercel Postgres：

1. 进入 Vercel 项目
2. 进入 **Storage** 标签
3. 点击你的 Postgres 数据库
4. 点击 **Query** 标签
5. 在查询编辑器中粘贴以下 SQL：

   ```sql
   -- Prisma 会自动生成这些表，但你可以手动检查
   -- 通常不需要手动创建，使用 npx prisma db push 即可
   ```

   **注意：** Vercel Postgres 会自动应用 `npx prisma db push` 的结果，无需手动创建表。

## 验证数据库是否初始化成功

### 1. 检查健康状态

访问：
```
https://你的应用.vercel.app/api/health
```

**期望响应：**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "userExists": false,
    "taskCount": 0,
    "pomodoroCount": 0,
    "timestamp": "2024-02-20T00:00:00.000Z"
  }
}
```

### 2. 初始化用户数据

数据库初始化后，需要创建默认用户和设置：

访问以下 URL（会在浏览器中发起请求）：
```
https://你的应用.vercel.app/api/init
```

**期望响应：**
```json
{
  "success": true,
  "message": "初始化成功",
  "tasksCreated": 4
}
```

### 3. 测试应用

1. 访问应用首页
2. 点击"开始专注"按钮
3. 检查计时器是否开始

## 常见问题

### Q: 运行 `npx prisma db push` 时报错 "Prisma Client is not generated"

**A:** 先运行：
```bash
npx prisma generate
npx prisma db push
```

### Q: 报错 "Can't reach database server"

**A:** 检查环境变量是否正确：
- `POSTGRES_URL` 格式是否正确
- 数据库是否在线（检查 Neon/Vercel Dashboard）
- 网络连接是否正常

### Q: 报错 "Relation does not exist"

**A:** 数据库没有初始化，重新运行：
```bash
npx prisma db push
```

### Q: 初始化成功但计时器按钮还是没反应

**A:** 按 F12 打开浏览器控制台，查看错误信息，然后查看 [DEBUG_TIMER.md](./DEBUG_TIMER.md)

## 完整初始化步骤总结

1. ✅ 确认环境变量已配置
2. ✅ 运行 `npx prisma db push` 初始化数据库
3. ✅ 访问 `/api/health` 验证连接
4. ✅ 访问 `/api/init` 初始化用户数据
5. ✅ 测试计时器功能

## 自动化方案（可选）

如果你希望每次部署时自动初始化数据库，可以添加 Vercel Cron Job 或使用 GitHub Actions。

但通常只需要初始化一次即可。

---

**需要帮助？**
如果以上步骤都无法解决，请提供：
1. `npx prisma db push` 的完整输出
2. `/api/health` 的响应
3. 浏览器控制台的错误信息
