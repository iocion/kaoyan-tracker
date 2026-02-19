# Vercel 部署指南

## 准备工作

### 1. 数据库设置

#### 使用 Supabase（推荐）

1. 访问 [Supabase](https://supabase.com) 并创建免费账户
2. 创建新项目：
   - Project Name: `kaoyan-tracker`
   - Database Password: 设置强密码（记住它！）
   - Region: 选择离你最近的区域（如 Singapore）
3. 等待数据库创建完成（约 2 分钟）
4. 进入 Project Settings → Database，获取连接字符串：
   - Connection string: `postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
   - URI: `postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`

#### 使用 Neon

1. 访问 [Neon](https://neon.tech) 并创建账户
2. 创建新项目：
   - Name: `kaoyan-tracker`
   - Region: 选择最近的区域
3. 获取连接字符串：
   - Connection String: `postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require`

#### 使用 Vercel Postgres（最简单）

1. 在 Vercel 项目中：
   - 进入 Settings → Storage
   - 点击 "Create Database"
   - 选择 "Postgres"
   - Vercel 会自动配置环境变量
   - 点击 "Connect" 按钮，选择 Next.js 项目
   - 环境变量会自动添加到项目中

### 2. 运行数据库迁移

本地开发时，需要先迁移数据库：

```bash
# 生成 Prisma Client
npm run db:push

# 或者运行迁移
npm run db:migrate
```

## 部署步骤

### 方式一：通过 Vercel CLI（推荐）

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署项目：
```bash
vercel
```

4. 配置环境变量：
在 Vercel Dashboard 中添加以下环境变量：
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `DATABASE_URL`

5. 部署生产环境：
```bash
vercel --prod
```

### 方式二：通过 Git 仓库

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 Vercel 中导入项目
3. 配置环境变量：
   - 进入 Project Settings → Environment Variables
   - 添加数据库相关的环境变量
4. 部署会自动触发

### 方式三：使用 Vercel Postgres（最简单）

1. 在 Vercel 项目中：
   - 进入 Settings → Storage
   - 点击 "Create Database"
   - 选择 "Postgres"
   - 点击 "Connect" 按钮
   - 选择你的 Next.js 项目
   - 环境变量会自动添加

2. 运行数据库迁移：
   - 进入项目根目录
   - 运行：`npx prisma db push`
   - 这会连接到 Vercel Postgres 并创建表结构

## 环境变量配置

在 Vercel Dashboard 中添加以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `POSTGRES_PRISMA_URL` | PostgreSQL 连接 URL（带连接池） | `postgresql://postgres.xxx:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `POSTGRES_URL_NON_POOLING` | PostgreSQL 直接连接 URL（用于迁移） | `postgresql://postgres.xxx:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `DATABASE_URL` | 数据库主 URL | `postgresql://postgres.xxx:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `NODE_ENV` | Node 环境 | `production` |

## 验证部署

1. 访问部署的 URL
2. 测试基本功能：
   - 打开首页
   - 访问 `/timer` 页面
   - 访问 `/records` 页面
   - 测试 API 端点

## 常见问题

### 1. 数据库连接失败

- 检查环境变量是否正确配置
- 确认数据库 IP 白名单（如果需要）
- 验证连接字符串格式

### 2. 迁移失败

- 确保 `POSTGRES_URL_NON_POOLING` 是正确的直接连接 URL
- 检查数据库权限
- 尝试运行 `npx prisma db push` 而不是 `npx prisma migrate dev`

### 3. 构建失败

- 检查 `package.json` 中的构建脚本
- 确保 `prisma generate` 在构建前运行
- 查看 Vercel 构建日志

### 4. 运行时错误

- 检查 API 路由是否正确导出
- 验证服务层代码
- 查看 Vercel 函数日志

## 数据库管理

### 查看 Prisma Studio

```bash
npx prisma studio
```

### 重置数据库（谨慎！）

```bash
npx prisma migrate reset
```

### 重新生成 Prisma Client

```bash
npx prisma generate
```

## 生产环境建议

1. **监控**：启用 Vercel Analytics 和日志
2. **备份**：定期备份数据库
3. **安全**：
   - 使用强密码
   - 启用 SSL
   - 限制数据库访问
4. **性能**：
   - 使用连接池
   - 启用缓存
   - 优化查询

## 成本估算

- **Vercel Hobby Plan**：免费
- **Vercel Pro Plan**：$20/月
- **Supabase Free Tier**：500MB 数据库，2GB 文件存储
- **Neon Free Tier**：3GB 存储，200 小时计算/月

免费方案足够个人使用。

## 更新部署

每次推送代码到主分支，Vercel 会自动部署。

手动部署：
```bash
vercel --prod
```
