# 计时器按钮无反应 - 诊断步骤

## 问题描述
点击计时器按钮（开始专注、短休息、长休息）没有反应。

## 诊断步骤

### 1. 检查浏览器控制台

1. 按 F12 打开浏览器开发者工具
2. 切换到 **Console** 标签
3. 点击"开始专注"按钮
4. 查看是否有错误信息或日志

**期望看到的日志：**
```
[Timer] Starting focus with taskId: undefined (or task id)
[API] POST /api/pomodoro body: {taskId: ..., type: "FOCUS", duration: 25}
[Timer] Focus started successfully
```

**如果有错误：**
- 记录完整的错误消息
- 记录堆栈跟踪（如果有）

### 2. 检查网络请求

1. 按 F12 打开开发者工具
2. 切换到 **Network** 标签
3. 点击"开始专注"按钮
4. 查找 `/api/pomodoro` 请求
5. 查看请求详情：
   - **请求体**：是否正确发送？
   - **响应状态**：200、400、500？
   - **响应体**：包含什么内容？

### 3. 检查健康状态

访问以下 URL 检查数据库连接：
```
https://your-app.vercel.app/api/health
```

**期望的响应：**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "userExists": true,
    "taskCount": 0,
    "pomodoroCount": 0,
    "timestamp": "2024-02-20T00:00:00.000Z"
  }
}
```

**可能的错误：**
- `"database": "disconnected"` - 数据库连接问题
- `error` - 其他错误

### 4. 检查数据库是否已初始化

数据库初始化是必要的，首次部署后需要运行：

```bash
npx prisma db push
```

或者在 Vercel 项目中：
1. 进入 **Settings** → **Environment Variables**
2. 确认以下变量存在：
   - `DATABASE_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL`
   - `POSTGRES_URL_NO_SSL`
3. 进入 **Deployments** → 最新部署
4. 点击终端图标，运行：
   ```
   npx prisma db push
   ```

### 5. 常见问题和解决方案

#### 问题 1：数据库未连接
**症状：**
- `/api/health` 返回 `"database": "disconnected"`
- 控制台错误："Connection failed"

**解决方案：**
1. 检查环境变量是否正确配置
2. 确认数据库 URL 格式正确
3. 运行 `npx prisma db push` 初始化表

#### 问题 2：数据库表不存在
**症状：**
- `/api/health` 返回错误："relation does not exist"
- API 返回 500 错误

**解决方案：**
```bash
npx prisma db push
```

#### 问题 3：CORS 错误
**症状：**
- 控制台错误："CORS policy"
- 请求被阻止

**解决方案：**
- 确认 API 和前端在同一域名下

#### 问题 4：JavaScript 错误
**症状：**
- 控制台有红色错误
- 按钮点击无反应

**解决方案：**
1. 查看完整错误信息
2. 确认所有依赖已安装
3. 清除浏览器缓存重试

#### 问题 5：网络超时
**症状：**
- 请求长时间等待
- 控制台显示 "timeout"

**解决方案：**
1. 检查网络连接
2. 确认 Vercel 部署正常
3. 查看函数日志（Vercel Dashboard）

### 6. 查看 Vercel 日志

1. 进入 Vercel 项目 Dashboard
2. 进入 **Functions** 标签
3. 查找 `/api/pomodoro` 函数
4. 点击 **Logs** 查看实时日志
5. 查找错误和警告

### 7. 本地测试

在本地开发环境测试：

```bash
cd kaoyan-tracker
npm run dev
```

访问 `http://localhost:3000/timer`，测试是否正常工作。

如果本地正常但线上不正常，说明是部署问题。

## 快速修复检查清单

- [ ] 数据库环境变量已配置
- [ ] 数据库已初始化（`npx prisma db push`）
- [ ] 浏览器控制台没有错误
- [ ] Network 请求正常（状态码 200）
- [ ] `/api/health` 返回 `status: "healthy"`
- [ ] Vercel 部署成功

## 需要帮助？

如果以上步骤都无法解决问题，请提供：

1. 浏览器控制台的完整错误信息
2. `/api/health` 的响应内容
3. `/api/pomodoro` 的请求和响应详情
4. Vercel 函数日志截图

这样我才能进一步诊断问题。
