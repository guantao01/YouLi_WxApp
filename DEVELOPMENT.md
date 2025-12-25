# 开发指南

## 目录结构说明

### Backend核心模块

#### Orders Module (订单模块)
**核心功能：担保交易流程**

1. **创建订单** (`createOrder`)
   - 验证商品可用性
   - 检查买家余额
   - 冻结买家资金（资金托管）
   - 创建订单记录

2. **发货** (`shipOrder`)
   - 更新物流信息
   - 设置7天自动确认时间
   - 状态变更：paid → shipped

3. **确认收货** (`confirmReceipt`)
   - 解冻资金并转账给卖家
   - **触发地图点亮逻辑**
   - 状态变更：shipped → completed

4. **退款流程** (`requestRefund`, `processRefund`)
   - 买家申请退款
   - 管理员仲裁
   - 退款到买家账户

#### Map Module (地图模块)
**核心功能：点亮逻辑 + 防刷**

1. **点亮处理** (`processMapLighting`)
   ```typescript
   // 防刷检查
   1. 查询 transaction_locks 表
   2. 如果用户对已点亮该省份 → 返回false
   3. 如果未点亮 → 创建/更新锁记录
   
   // 更新足迹
   4. 查询/创建 user_footprints 记录
   5. 更新点亮状态和次数
   
   // 头衔晋升
   6. 更新用户 provinces_lit 计数
   7. 检查是否达到晋升条件
   8. 自动升级头衔
   ```

2. **头衔晋升** (`checkTitlePromotion`)
   - 根据点亮省份数判断等级
   - 自动升级到对应头衔

#### Payment Module (支付模块)
**核心功能：资金托管**

- `freezeFunds`: 冻结资金（买家支付时）
- `releaseFunds`: 解冻并转账（确认收货时）
- `refundFunds`: 退款（仲裁通过时）

### 数据流示例

#### 完整交易流程
```
1. 买家创建订单
   ↓
2. 系统冻结买家资金 (balance → frozen_balance)
   ↓
3. 卖家发货，填写物流信息和发货省份
   ↓
4. 买家确认收货（或7天自动）
   ↓
5. 系统解冻资金，转账给卖家
   ↓
6. 触发地图点亮逻辑
   - 检查防刷机制
   - 更新用户足迹
   - 播放动画
   - 检查头衔晋升
```

## 开发注意事项

### 1. 安全考虑

#### 输入验证
```typescript
// 所有用户输入都需要验证和清理
private sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
```

#### 交易安全
- 使用事务确保操作原子性
- 防止并发问题（乐观锁）
- 严格的状态机控制

### 2. 防刷机制详解

**问题：** 用户A和用户B互相刷单，快速点亮所有省份

**解决方案：**
```sql
-- transaction_locks 表确保同一对用户在同一省份只能点亮一次
CREATE UNIQUE INDEX uk_users_province ON transaction_locks(user_a_id, user_b_id, province);
```

**实现逻辑：**
```typescript
// 1. 标准化用户ID顺序（小的在前）
const [userAId, userBId] = buyerId < sellerId ? [buyerId, sellerId] : [sellerId, buyerId];

// 2. 查询是否已存在锁
let lock = await findLock(userAId, userBId, province);

// 3. 如果已点亮，则不再计数
if (lock && lock.has_lit) {
  return { lit: false, newProvince: false };
}
```

### 3. 自动确认订单

使用定时任务实现：

```typescript
// 在 main.ts 中注册定时任务
import { CronJob } from 'cron';

new CronJob('0 * * * *', async () => { // 每小时执行
  await ordersService.autoConfirmOrders();
}).start();
```

### 4. 微信登录流程

```typescript
// 前端
wx.login({
  success: (res) => {
    // 发送 res.code 到后端
    authAPI.wechatLogin(res.code, userInfo)
  }
})

// 后端
1. 使用 code 调用微信API获取 openid
2. 查找或创建用户
3. 生成JWT token
4. 返回给前端
```

## 测试指南

### 单元测试示例

```typescript
// orders.service.spec.ts
describe('OrdersService', () => {
  it('should freeze funds when creating order', async () => {
    const order = await service.createOrder(buyerId, productId, address);
    const buyer = await usersRepository.findOne(buyerId);
    expect(buyer.frozen_balance).toBeGreaterThan(0);
  });

  it('should trigger map lighting on confirm', async () => {
    await service.confirmReceipt(orderId, buyerId);
    const footprint = await footprintsRepository.findOne({
      user_id: buyerId,
      province: 'Sichuan'
    });
    expect(footprint.lit_status).toBe(true);
  });
});
```

## 调试技巧

### 1. 后端调试
```bash
# 启动开发模式（带热重载）
npm run start:dev

# 查看日志
tail -f logs/app.log
```

### 2. 前端调试
- 使用微信开发者工具的调试器
- Console查看API请求
- Network面板查看网络请求

### 3. 数据库调试
```sql
-- 查看用户点亮的省份
SELECT * FROM user_footprints WHERE user_id = 1 AND lit_status = 1;

-- 查看交易锁
SELECT * FROM transaction_locks WHERE user_a_id = 1 OR user_b_id = 1;

-- 查看订单流水
SELECT * FROM orders WHERE buyer_id = 1 ORDER BY created_at DESC;
```

## 常见错误处理

### 1. 余额不足
```typescript
if (buyer.balance < product.price) {
  throw new BadRequestException('Insufficient balance');
}
```

### 2. 订单状态不正确
```typescript
if (order.status !== OrderStatus.SHIPPED) {
  throw new BadRequestException('Cannot confirm, order not shipped');
}
```

### 3. 防止自己和自己交易
```typescript
if (product.user_id === buyerId) {
  throw new BadRequestException('Cannot buy your own product');
}
```

## 性能优化

### 1. 数据库索引
- user_id, openid, phone 等常用查询字段
- 订单状态、省份等筛选字段

### 2. Redis缓存
```typescript
// 缓存用户信息
await redis.set(`user:${userId}`, JSON.stringify(user), 3600);

// 缓存热门商品
await redis.set(`product:${productId}`, JSON.stringify(product), 1800);
```

### 3. 分页查询
```typescript
const [products, total] = await productsRepository
  .findAndCount({
    skip: (page - 1) * limit,
    take: limit,
  });
```

## 发布检查清单

- [ ] 环境变量配置完成
- [ ] 数据库索引创建
- [ ] Redis连接测试
- [ ] 微信登录测试
- [ ] 支付接口测试
- [ ] 物流API测试
- [ ] 压力测试
- [ ] 安全审计
- [ ] 备份策略
- [ ] 监控告警

## 联系开发团队

如有问题，请联系：
- 后端：backend@youli.com
- 前端：frontend@youli.com
- 运维：devops@youli.com
