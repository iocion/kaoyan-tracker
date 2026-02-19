# 🍅 考研番茄钟

一个专为考研学生设计的番茄钟学习追踪器，帮助高效管理学习时间。

## ✨ 功能特性

### 🎯 番茄钟计时
- 25分钟专注 + 5分钟短休息 + 15分钟长休息
- 可自定义时长
- 实时进度显示
- 暂停/继续/完成/取消操作

### 📋 任务管理
- 创建考研任务（408、数学、英语、政治）
- 设置预计番茄数
- 追踪完成进度
- 设置当前任务

### 📊 学习统计
- 每日/每周/每月统计
- 学科分布（饼图）
- 每日趋势（柱状图）
- 学科排名
- 热力图（GitHub 风格）

### ⚙️ 个性化设置
- 自定义专注时长
- 自定义休息时长
- 长休息间隔设置
- 自动开始选项
- 声音提醒

## 🚀 快速开始

### 本地开发

1. 克隆仓库
```bash
git clone <your-repo-url>
cd kaoyan-tracker
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env` 文件，填写数据库配置：
```env
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
DATABASE_URL="postgresql://..."
```

4. 初始化数据库
```bash
npm run db:push
```

5. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 🏗️ 项目结构

```
kaoyan-tracker/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── pomodoro/         # 番茄钟 API
│   │   ├── tasks/            # 任务 API
│   │   ├── settings/         # 设置 API
│   │   ├── stats/            # 统计 API
│   │   └── records/          # 记录 API
│   ├── timer/                # 番茄钟页面
│   ├── records/              # 统计页面
│   └── page.tsx              # 首页
├── components/               # React 组件
│   ├── timer/               # 番茄钟组件
│   ├── tasks/               # 任务组件
│   ├── stats/               # 统计组件
│   └── ui/                  # 通用 UI 组件
├── lib/                     # 工具库
│   ├── db/                  # 数据库
│   ├── services/            # 业务逻辑层
│   ├── validators/          # 数据验证
│   ├── hooks/               # React Hooks
│   └── utils.ts             # 工具函数
├── types/                   # TypeScript 类型
├── prisma/                  # Prisma 配置
│   └── schema.prisma        # 数据库模型
└── public/                  # 静态资源
```

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 库**: Tailwind CSS
- **图表库**: Recharts
- **图标库**: Lucide React
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL (via Prisma)
- **验证**: Zod
- **语言**: TypeScript

## 📦 可用脚本

```bash
# 开发
npm run dev

# 构建
npm run build

# 生产环境运行
npm run start

# 数据库操作
npm run db:push          # 推送 schema 到数据库
npm run db:migrate       # 运行迁移
npm run db:studio        # 打开 Prisma Studio
```

## 🚀 部署

### Vercel 部署

详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

快速步骤：

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（数据库 URL）
4. 部署

### 环境变量

| 变量名 | 说明 |
|--------|------|
| `POSTGRES_PRISMA_URL` | PostgreSQL 连接 URL（带连接池） |
| `POSTGRES_URL_NON_POOLING` | PostgreSQL 直接连接 URL |
| `DATABASE_URL` | 数据库主 URL |

## 📊 数据库模型

### 核心表

- **User**: 用户信息
- **Task**: 任务
- **Pomodoro**: 番茄钟记录
- **DailyStat**: 每日统计
- **UserSettings**: 用户设置
- **StudyRecord**: 学习记录

详见 `prisma/schema.prisma`

## 🔧 开发指南

### 添加新的 API 端点

1. 在 `app/api/` 下创建路由
2. 在 `lib/services/` 创建对应服务
3. 在 `lib/validators/` 添加验证器
4. 使用 Zod 验证输入

### 添加新的页面

1. 在 `app/` 下创建页面组件
2. 使用自定义 Hooks (`lib/hooks/`) 获取数据
3. 使用 Tailwind CSS 样式

### 数据库迁移

```bash
# 创建迁移
npx prisma migrate dev --name migration_name

# 推送 schema（开发阶段）
npx prisma db push

# 生成 Client
npx prisma generate
```

## 🧪 测试

```bash
# 运行测试（待添加）
npm test
```

## 📝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

---

开始你的考研之旅吧！🚀
