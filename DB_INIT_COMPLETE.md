# 🗄️ 数据库自动初始化完整指南

## ✅ 新增功能

**现在你可以直接访问 `/api/db/init-auto` 来自动初始化数据库！**

无需手动运行 `npx prisma db push` 了！

---

## 🚀 三种初始化方式

### 方式 1：自动初始化（推荐）⭐

**访问以下 URL 即可自动初始化数据库：**

```bash
curl -X POST https://你的应用.vercel.app/api/db/init-auto
```

或者在浏览器中直接访问：
```
https://你的应用.vercel.app/api/db/init-auto
```

**优点：**
- ✅ 自动推送所有表结构
- ✅ 自动创建默认用户和设置
- ✅ 自动创建示例任务
- ✅ 无需打开 Vercel CLI
- ✅ 无需运行任何命令

**返回信息：**
```json
{
  "success": true,
  "message": "数据库初始化成功",
  "data": {
    "userId": "default",
    "tasksCreated": 4
  }
}
```

---

### 方式 2：手动初始化（备用）

如果自动方式失败，可以手动初始化：

**步骤 1：访问初始化端点**
```bash
curl -X POST https://你的应用.vercel.app/api/db/init
```

**步骤 2：验证初始化**
```bash
curl https://你的应用.vercel.app/api/health
```

**期望响应：**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "userExists": true,
    "taskCount": 4
  }
}
```

---

### 方式 3：Vercel CLI 初始化（开发调试用）

如果你有 Vercel CLI 并且想手动初始化：

```bash
# 登录 Vercel
vercel login

# 在项目目录
cd /path/to/kaoyan-tracker

# 初始化数据库
npx prisma db push

# 验证
npx prisma db studio
```

---

## 📊 初始化会做什么

### 1. 创建所有表结构

| 表名 | 说明 |
|------|------|
| `User` | 用户信息（ID、姓名、时间） |
| `UserSettings` | 用户设置（专注时长、休息时长、声音等） |
| `Task` | 任务（标题、学科、番茄数、进度） |
| `Pomodoro` | 番茄钟记录（类型、状态、时长） |
| `DailyStat` | 每日统计（番茄数、学习时长、学科分布） |
| `StudyRecord` | 学习记录（学科、时长、备注） |

### 2. 创建默认用户和设置

- 用户 ID：`default`
- 用户名：`考研人`
- 默认设置：
  - 专注时长：25 分钟
  - 休息时长：5 分钟
  - 长休息：15 分钟
  - 长休息间隔：4 个番茄
  - 自动开始：关闭

### 3. 创建示例任务

| 标题 | 学科 | 番茄数 |
|------|------|--------|
| 数据结构 - 复习二叉树 | 408 | 2 |
| 高数 - 微积分练习 | 数学 | 3 |
| 英语单词背诵 | 英语 | 1 |
| 马原复习 | 政治 | 2 |

---

## 🎯 完整初始化流程

### 第 1 步：访问自动初始化端点（推荐）

```bash
# 在浏览器中访问
https://你的应用.vercel.app/api/db/init-auto

# 或使用 curl
curl -X POST https://你的应用.vercel.app/api/db/init-auto
```

### 第 2 步：验证健康状态

```bash
curl https://你的应用.vercel.app/api/health
```

### 第 3 步：测试功能

访问番茄钟页面：
```
https://你的应用.vercel.app/timer
```

测试：
1. 点击"开始专注"按钮
2. 查看计时器是否开始
3. 检查进度条是否更新

---

## 🔍 故障排除

### 问题 1：自动初始化失败

**错误信息：**
```
{
  "success": false,
  "error": "数据库初始化失败"
}
```

**可能原因：**
1. 数据库连接失败
2. 表已存在
3. 权限问题

**解决方法：**
```bash
# 使用方式 2 手动初始化
curl -X POST https://你的应用.vercel.app/api/db/init

# 或检查健康状态
curl https://你的应用.vercel.app/api/health

# 或在 Vercel 中手动运行
npx prisma db push
```

### 问题 2：健康检查返回错误

**错误信息：**
```
{
  "success": false,
  "error": "健康检查失败"
}
```

**解决方法：**
1. 检查环境变量是否配置
2. 检查数据库 URL 是否正确
3. 检查数据库是否在线
4. 查看数据库日志（如果使用 Neon）

---

## 📝 环境变量检查

在 Vercel 项目中，确认以下环境变量已配置：

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|---------|------|------|
| `DATABASE_URL` | 主数据库 URL | `postgresql://user:pass@host:port/db` |
| `POSTGRES_PRISMA_URL` | Prisma 连接 URL | `postgresql://user:pass@host:port/db` |

### 检查方法

在 Vercel Dashboard 中：
1. 进入项目 → **Settings** → **Environment Variables**
2. 确认上述环境变量存在
3. 如果不存在，添加它们

---

## 🚀 快速开始

### 立即使用（最简单的方式）

```bash
# 1. 访问自动初始化
curl -X POST https://你的应用.vercel.app/api/db/init-auto

# 2. 等待 2-3 秒
sleep 3

# 3. 验证初始化
curl https://你的应用.vercel.app/api/health

# 4. 开始使用！
```

### 在浏览器中使用

1. 访问：`https://你的应用.vercel.app/api/db/init-auto`
2. 看到 "数据库初始化成功" 消息
3. 访问：`https://你的应用.vercel.app/timer`
4. 点击"开始专注"开始学习

---

## 🎉 初始化完成标志

当你看到以下情况，说明初始化成功：

### ✅ 健康检查通过
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "userExists": true,
    "taskCount": 4
  }
}
```

### ✅ 计时器可以开始

在 `/timer` 页面：
- 看到 "25:00" 倒计时
- 点击"开始专注"后计时器开始运行
- 进度条从 0% 开始增长

### ✅ 任务列表显示

在 `/timer` 页面底部：
- 看到 4 个示例任务
- 可以点击"开始专注"开始学习
- 可以切换当前任务

---

## 📚 后续步骤

初始化完成后，你可以：

1. ✅ **开始使用番茄钟** - 点击"开始专注"开始 25 分钟计时
2. ✅ **创建自己的任务** - 添加你的考研任务
3. ✅ **查看学习统计** - 访问 `/records` 页面
4. ✅ **调整设置** - 修改专注时长、休息时长等

---

## 💡 提示

- **首次访问 `/api/db/init-auto`** 可能需要 5-10 秒
- **建议在部署后立即访问**，避免出现"表不存在"错误
- **初始化只需要一次**，之后数据库会保持
- **如果需要重新初始化**，可以清空数据库或删除表

---

## 🔧 高级功能

如果需要清空数据库重新初始化：

```bash
# 方式 1：访问清空端点（如果存在）
curl -X POST https://你的应用.vercel.app/api/db/reset

# 方式 2：在 Vercel 中手动运行
npx prisma db push --reset
```

---

**需要帮助吗？**

如果以上步骤都无法解决你的问题，请提供：
1. 错误信息的完整内容
2. 浏览器控制台的错误
3. 访问的健康检查返回内容
4. 你使用的部署方式（Vercel、本地等）

我会进一步帮助你诊断问题！
