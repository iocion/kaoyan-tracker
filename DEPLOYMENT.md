# Vercel 部署指南

## 准备工作

### 1. 数据库设置

#### 使用 Neon（推荐）

你已经在 Vercel 中配置了 Neon 数据库，环境变量已自动添加：

- ✅ `NEON_PROJECT_ID` - Neon 项目 ID
- ✅ `POSTGRES_URL` - PostgreSQL 连接 URL（带 SSL）
- ✅ `POSTGRES_URL_NO_SSL` - PostgreSQL 连接 URL（无 SSL）
- ✅ `POSTGRES_HOST` - 数据库主机地址

**无需额外配置！**

#### 使用 Supabase

1. 访问 [Supabase](https://supabase.com) 并创建免费账户
2. 创建新项目：
   - Project Name: `kaoyan-tracker`
   - Database Password: 设置强密码（记住它！）
   - Region: 选择离你最近的区域（如 Singapore）
3. 等待数据库创建完成（约 2 分钟）
4. 进入 Project Settings → Database，获取连接字符串：
   - Connection string: `postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
   - URI: `postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`

#### 使用 Vercel Postgres

1. 在 Vercel 项目中：
   - 进入 Settings → Storage
   - 点击 "Create Database"
   - 选择 "Postgres"
   - Vercel 会自动配置环境变量
   - 点击 "Connect" 按钮，选择 Next.js 项目
   - 环境变量会自动添加到项目中

### 2. 运行数据库迁移

**本地开发时：**

```bash
# 使用 POSTGRES_URL_NO_SSL（直连）
export POSTGRES_URL_NON_POOLING="$POSTGRES_URL_NO_SSL"
export DATABASE_URL="$POSTGRES_URL"

# 生成 Prisma Client
npm run db:push

# 或者运行迁移
npm run db:migrate
```

**部署到 Vercel 后：**

在 Vercel 项目中运行迁移命令（在项目设置或终端中）：

```bash
npx prisma db push
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

4. 部署生产环境：
```bash
vercel --prod
```

### 方式二：通过 Git 仓库（你的方式）

1. **推送代码到 GitHub** ✅（已完成）

2. **在 Vercel 中导入项目**
   - 进入 [vercel.com](https://vercel.com)
   - 点击 "Add New" → "Project"
   - 选择你的 GitHub 仓库 `iocion/kaoyan-tracker`
   - 点击 "Import"

3. **配置环境变量**
   在 Import 页面，你会看到以下环境变量已自动配置：
   - ✅ `NEON_PROJECT_ID` - Neon 项目 ID
   - ✅ `POSTGRES_URL` - Neon 连接 URL
   - ✅ `POSTGRES_URL_NO_SSL` - Neon 直连 URL
   - ✅ `POSTGRES_HOST` - 数据库主机

   **确保这些变量都存在且正确！**

4. **点击 "Deploy"**
   - Vercel 会自动构建项目
   - 等待 2-3 分钟
   - 部署完成后，你会获得一个 `.vercel.app` 域名

## 环境变量配置

### Neon 数据库（你的配置）

Vercel 已经自动配置了以下环境变量：

| 变量名 | 说明 | 来源 |
|--------|------|------|
| `POSTGRES_URL` | PostgreSQL 连接 URL（带 SSL） | Neon 自动配置 |
| `POSTGRES_URL_NO_SSL` | PostgreSQL 直连 URL（用于迁移） | Neon 自动配置 |
| `DATABASE_URL` | 数据库主 URL | 需要手动添加，值同 `POSTGRES_URL` |
| `POSTGRES_PRISMA_URL` | Prisma 连接 URL | 需要手动添加，值同 `POSTGRES_URL` |
| `NEON_PROJECT_ID` | Neon 项目 ID | Neon 自动配置 |

**缺失的环境变量：**

你需要在 Vercel 项目设置中手动添加：
- `DATABASE_URL` = `POSTGRES_URL` 的值
- `POSTGRES_PRISMA_URL` = `POSTGRES_URL` 的值

**如何添加：**
1. 进入 Vercel 项目 → Settings → Environment Variables
2. 点击 "Add New"
3. 添加：
   - Name: `DATABASE_URL`, Value: (复制 `POSTGRES_URL` 的值)
   - Name: `POSTGRES_PRISMA_URL`, Value: (复制 `POSTGRES_URL` 的值)

### Supabase/Vercel Postgres

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `POSTGRES_PRISMA_URL` | PostgreSQL 连接 URL（带连接池） | `postgresql://postgres.xxx:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `POSTGRES_URL_NON_POOLING` | PostgreSQL 直接连接 URL（用于迁移） | `postgresql://postgres.xxx:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `DATABASE_URL` | 数据库主 URL | `postgresql://postgres.xxx:[password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |

## 验证部署

1. 访问部署的 URL
2. 测试基本功能：
   - 打开首页
   - 访问 `/timer` 页面
   - 访问 `/records` 页面
   - 测试 API 端点

## 运行数据库迁移

部署完成后，需要初始化数据库表结构：

**方式一：通过 Vercel Dashboard**
1. 进入项目 → Deployments
2. 找到最新的部署，点击三个点 → "Redeploy"
3. 在 "Build & Development Settings" 中添加 Build Command：
   ```
   npx prisma db push && prisma generate && next build
   ```

**方式二：通过 Vercel CLI**
```bash
# 在项目根目录运行
npx prisma db push
```

**方式三：通过本地（推荐开发时）**
```bash
# 设置本地环境变量
export POSTGRES_URL="你的 Neon 连接 URL"
export POSTGRES_URL_NON_POOLING="你的 Neon 直连 URL"
export DATABASE_URL="你的 Neon 连接 URL"

# 推送 schema
npx prisma db push
```

## 常见问题

### 1. 数据库连接失败

- 检查环境变量是否正确配置
- 确认 `DATABASE_URL` 和 `POSTGRES_PRISMA_URL` 已添加
- 验证连接字符串格式

### 2. 迁移失败

- 确保 `POSTGRES_URL_NON_POOLING` 是正确的直连 URL
- 检查数据库权限
- 尝试运行 `npx prisma db push` 而不是 `npx prisma migrate dev`

### 3. 构建失败

- 检查 `package.json` 中的构建脚本
- 确保 `prisma generate` 在构建前运行
- 查看 Vercel 构建日志

### 4. 部署成功但无法访问

- 检查数据库是否已迁移
- 确认所有必需的环境变量都已设置
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
   - 启用 SSL（Neon 默认启用）
   - 限制数据库访问
4. **性能**：
   - Neon 自动处理连接池
   - 启用缓存（如需要）
   - 优化查询

## 成本估算

- **Vercel Hobby Plan**：免费
- **Vercel Pro Plan**：$20/月
- **Neon Free Tier**：
  - 0.5GB 存储
  - 400 小时计算/月
  - 完全够用个人项目

免费方案足够个人使用！

## 更新部署

每次推送代码到主分支，Vercel 会自动部署。

手动部署：
```bash
vercel --prod
```

## 你的当前配置

✅ **Neon 数据库已配置**
- `POSTGRES_URL` ✅
- `POSTGRES_URL_NO_SSL` ✅
- `POSTGRES_HOST` ✅
- `NEON_PROJECT_ID` ✅

⚠️ **需要手动添加**
- `DATABASE_URL` = `POSTGRES_URL` 的值
- `POSTGRES_PRISMA_URL` = `POSTGRES_URL` 的值

**添加后重新部署即可！**
