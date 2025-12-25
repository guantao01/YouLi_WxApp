# YouLi (游礼) - 基于LBS的特产盲盒交换小程序

## 项目简介

YouLi（游礼）是一款创新的微信小程序，核心功能包括：
1. **特产交易市场** - C2C模式的特产出售/求购/盲盒交换
2. **点亮中国地图** - 游戏化成就系统，通过交易点亮全国省份
3. **宝贝回家公益** - 展示失踪儿童信息，支持海报生成和分享

## 核心功能

### 1. 特产交易 (Market)

#### 交易模式
- **出售** - 用户发布本地特产销售信息
- **求购** - 用户发布特产求购需求
- **盲盒** - 随机特产惊喜盒，增加趣味性

#### 担保交易流程（严格风控）
```
买家支付 → 资金冻结 → 卖家发货(物流跟踪) → 确认收货(或7天自动) → 资金解冻 → 触发地图点亮判定
```

**关键特性：**
- 实名认证系统
- 资金托管机制（escrow）
- 物流API对接
- 7天自动确认收货
- 退款仲裁系统

### 2. 点亮中国地图 (Map)

#### 点亮逻辑
当订单完成时：
1. 获取卖家发货省份
2. 查询买家的 `user_footprints` 表
3. 若该省份未点亮 → 更新状态 + 播放动画
4. 若已点亮 → 仅增加获得次数

#### 防刷机制
- 使用 `transaction_locks` 表记录用户对
- 两个用户之间多次交易，同一省份只计入1次点亮
- 确保公平性和游戏平衡

#### 头衔晋升系统
| 等级 | 头衔 | 所需省份数 |
|------|------|-----------|
| Lv.1 | 探索者 | 3 |
| Lv.2 | 旅行家 | 10 |
| Lv.3 | 游侠 | 20 |
| Lv.4 | 游礼大师 | 30 |

点亮足够省份后自动升级头衔。

### 3. 宝贝回家公益 (Welfare)

**重要说明：**
- ⚠️ **严禁UGC** - 普通用户只能查看，不能创建或编辑
- ✅ **CMS录入** - 仅管理员可通过后台CMS录入失踪儿童信息
- 📱 **前端只读** - 展示信息 + 生成分享海报
- 🔒 **数据来源** - 对接"宝贝回家"等权威公益组织数据

## 技术栈

### 前端 (Frontend)
- **框架**: Uni-app (Vue 3)
- **地图**: 腾讯地图 SDK
- **UI**: 自定义组件库
- **状态管理**: Pinia

### 后端 (Backend)
- **框架**: NestJS (Node.js)
- **数据库**: MySQL 8.0+
- **缓存**: Redis
- **ORM**: TypeORM
- **认证**: JWT + 微信登录

### 外部服务
- 微信小程序 API
- 腾讯地图 API
- 物流跟踪 API (快递100等)
- 微信支付

## 项目结构

```
YouLi_WxApp/
├── frontend/              # 前端 Uni-app
│   ├── pages/            # 页面
│   │   ├── index/       # 首页
│   │   ├── market/      # 特产市场
│   │   ├── map/         # 点亮地图
│   │   ├── welfare/     # 宝贝回家
│   │   ├── order/       # 订单管理
│   │   └── profile/     # 个人中心
│   ├── components/       # 组件
│   ├── api/             # API接口
│   ├── utils/           # 工具函数
│   ├── static/          # 静态资源
│   ├── App.vue          # 应用入口
│   ├── pages.json       # 页面配置
│   ├── manifest.json    # 应用配置
│   └── package.json
│
├── backend/              # 后端 NestJS
│   ├── src/
│   │   ├── modules/     # 功能模块
│   │   │   ├── auth/   # 认证
│   │   │   ├── users/  # 用户
│   │   │   ├── products/ # 商品
│   │   │   ├── orders/ # 订单（核心）
│   │   │   ├── map/    # 地图点亮（核心）
│   │   │   ├── payment/ # 支付托管
│   │   │   └── welfare/ # 公益
│   │   ├── common/      # 公共模块
│   │   ├── config/      # 配置
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example     # 环境变量示例
│   ├── package.json
│   └── tsconfig.json
│
└── database/             # 数据库
    └── schema.sql       # 数据库结构
```

## 数据库设计

### 核心表

#### users - 用户表
- 实名认证字段 (real_name, id_card, real_name_verified)
- 头衔等级 (title_level)
- 点亮省份数 (provinces_lit)
- 账户余额和冻结金额

#### orders - 订单表
- 担保交易状态流转
- 物流信息
- 7天自动确认时间
- 地图点亮触发标记

#### user_footprints - 用户足迹表
- 记录每个用户点亮的省份
- 首次点亮时间
- 获得次数

#### transaction_locks - 交易锁表
- **防刷核心** - 记录用户对在某省份的交易
- 确保同一对用户同一省份只计1次

#### missing_children - 失踪儿童表
- 公益数据存储
- 仅管理员可操作
- 状态管理 (missing/found/archived)

## 安全特性

### 1. 交易安全
- ✅ 资金托管机制
- ✅ 实名认证
- ✅ 物流跟踪
- ✅ 仲裁系统

### 2. 数据安全
- ✅ 输入验证和清理 (防XSS)
- ✅ SQL注入防护 (TypeORM)
- ✅ JWT认证
- ✅ 敏感信息加密

### 3. 业务安全
- ✅ 防刷机制 (transaction_locks)
- ✅ 防止自己交易自己
- ✅ 余额充足检查
- ✅ 订单状态机严格控制

## 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+
- 微信开发者工具

### 1. 数据库初始化
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE youli_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入表结构
mysql -u root -p youli_db < database/schema.sql
```

### 2. 后端启动
```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 填入配置

npm run start:dev
```

### 3. 前端启动
```bash
cd frontend
npm install
# 编辑 config.js 填入后端API地址

npm run dev:mp-weixin
# 在微信开发者工具中导入 dist/dev/mp-weixin 目录
```

## API文档

### 订单相关 (核心)

#### POST /orders - 创建订单
```json
{
  "buyerId": 1,
  "productId": 10,
  "shippingAddress": {
    "name": "张三",
    "phone": "13800138000",
    "province": "北京",
    "city": "北京市",
    "district": "朝阳区",
    "detail": "xxx街道xxx号"
  }
}
```

#### PUT /orders/:id/ship - 发货
```json
{
  "sellerId": 2,
  "shippingNo": "SF1234567890",
  "shippingCompany": "顺丰速运",
  "sellerProvince": "四川"
}
```

#### PUT /orders/:id/confirm - 确认收货
触发资金解冻和地图点亮逻辑

### 地图相关

#### GET /map/progress/:userId - 获取地图进度
返回：用户点亮的省份、当前头衔、下一级头衔、进度等

## 部署指南

### 生产环境配置

1. **后端部署**
   - 使用 PM2 或 Docker
   - 配置 Nginx 反向代理
   - 启用 HTTPS
   - 配置环境变量

2. **数据库**
   - MySQL 主从复制
   - 定期备份
   - 索引优化

3. **缓存**
   - Redis 集群
   - 会话管理
   - 热点数据缓存

4. **监控**
   - 日志系统
   - 性能监控
   - 错误追踪

## 开发规范

### Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

### 代码规范
- ESLint + Prettier
- TypeScript严格模式
- 单元测试覆盖率 > 80%

## 常见问题

### Q: 如何防止用户刷地图？
A: 使用 `transaction_locks` 表记录用户对，同一对用户在同一省份只能点亮一次。

### Q: 7天自动确认如何实现？
A: 使用定时任务（cron job）每小时检查 `auto_confirm_time` 字段，超时则自动调用确认收货逻辑。

### Q: 公益数据如何保证真实性？
A: 只允许管理员通过CMS录入，对接权威公益组织数据，前端严禁UGC。

### Q: 如何保证交易安全？
A: 采用资金托管机制，买家支付后资金冻结，确认收货后才解冻给卖家。

## 未来规划

- [ ] AI智能匹配盲盒
- [ ] 社交功能（加好友、聊天）
- [ ] 积分系统
- [ ] 更多公益项目接入
- [ ] 国际版（海外特产）

## 许可证

MIT License

## 联系方式

- 项目地址: https://github.com/guantao01/YouLi_WxApp
- 技术支持: support@youli.com

---

**⚠️ 重要提示：**
1. 上线前必须完成实名认证接口对接
2. 配置微信支付商户号
3. 物流API申请
4. 数据库定期备份策略
5. 公益数据审核机制