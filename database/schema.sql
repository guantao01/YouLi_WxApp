-- Database: youli_db
-- Character Set: utf8mb4

-- Users Table (用户表)
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `openid` VARCHAR(100) NOT NULL UNIQUE COMMENT '微信OpenID',
  `unionid` VARCHAR(100) DEFAULT NULL COMMENT '微信UnionID',
  `nickname` VARCHAR(100) NOT NULL COMMENT '昵称',
  `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '实名姓名',
  `id_card` VARCHAR(18) DEFAULT NULL COMMENT '身份证号',
  `real_name_verified` BOOLEAN DEFAULT FALSE COMMENT '实名认证状态',
  `province` VARCHAR(50) DEFAULT NULL COMMENT '所在省份',
  `city` VARCHAR(50) DEFAULT NULL COMMENT '所在城市',
  `title_level` TINYINT DEFAULT 1 COMMENT '头衔等级 1-4',
  `provinces_lit` INT DEFAULT 0 COMMENT '点亮省份数',
  `balance` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '账户余额',
  `frozen_balance` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '冻结金额',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1:正常 2:冻结',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_openid` (`openid`),
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- Products Table (商品表)
CREATE TABLE `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT '卖家ID',
  `title` VARCHAR(200) NOT NULL COMMENT '商品标题',
  `description` TEXT COMMENT '商品描述',
  `images` JSON COMMENT '商品图片JSON数组',
  `province` VARCHAR(50) NOT NULL COMMENT '特产所属省份',
  `city` VARCHAR(50) DEFAULT NULL COMMENT '特产所属城市',
  `price` DECIMAL(10, 2) NOT NULL COMMENT '价格',
  `type` ENUM('sale', 'purchase', 'blindbox') DEFAULT 'sale' COMMENT '类型: sale出售/purchase求购/blindbox盲盒',
  `stock` INT DEFAULT 1 COMMENT '库存',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1:上架 2:下架 3:售罄',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_province` (`province`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- Orders Table (订单表)
CREATE TABLE `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
  `product_id` INT UNSIGNED NOT NULL COMMENT '商品ID',
  `buyer_id` INT UNSIGNED NOT NULL COMMENT '买家ID',
  `seller_id` INT UNSIGNED NOT NULL COMMENT '卖家ID',
  `amount` DECIMAL(10, 2) NOT NULL COMMENT '订单金额',
  `status` ENUM('pending_payment', 'paid', 'shipped', 'completed', 'cancelled', 'refunding', 'refunded') DEFAULT 'pending_payment' COMMENT '订单状态',
  `payment_time` TIMESTAMP NULL COMMENT '支付时间',
  `ship_time` TIMESTAMP NULL COMMENT '发货时间',
  `confirm_time` TIMESTAMP NULL COMMENT '确认收货时间',
  `auto_confirm_time` TIMESTAMP NULL COMMENT '自动确认时间(发货后7天)',
  `shipping_address` JSON COMMENT '收货地址JSON',
  `shipping_no` VARCHAR(100) DEFAULT NULL COMMENT '物流单号',
  `shipping_company` VARCHAR(50) DEFAULT NULL COMMENT '物流公司',
  `seller_province` VARCHAR(50) DEFAULT NULL COMMENT '卖家发货省份',
  `refund_reason` TEXT COMMENT '退款原因',
  `arbitration_result` TEXT COMMENT '仲裁结果',
  `map_lit_triggered` BOOLEAN DEFAULT FALSE COMMENT '是否已触发地图点亮',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_buyer_id` (`buyer_id`),
  INDEX `idx_seller_id` (`seller_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- User Footprints Table (用户足迹表 - 点亮地图)
CREATE TABLE `user_footprints` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `province` VARCHAR(50) NOT NULL COMMENT '省份名称',
  `lit_status` BOOLEAN DEFAULT FALSE COMMENT '是否已点亮',
  `lit_count` INT DEFAULT 0 COMMENT '获得该省份次数',
  `first_lit_time` TIMESTAMP NULL COMMENT '首次点亮时间',
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_province` (`user_id`, `province`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户足迹表';

-- Transaction Locks Table (交易锁表 - 防刷机制)
CREATE TABLE `transaction_locks` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_a_id` INT UNSIGNED NOT NULL COMMENT '用户A ID',
  `user_b_id` INT UNSIGNED NOT NULL COMMENT '用户B ID',
  `province` VARCHAR(50) NOT NULL COMMENT '省份',
  `has_lit` BOOLEAN DEFAULT FALSE COMMENT '是否已计入点亮',
  `order_id` INT UNSIGNED DEFAULT NULL COMMENT '关联订单ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_users_province` (`user_a_id`, `user_b_id`, `province`),
  INDEX `idx_user_a` (`user_a_id`),
  INDEX `idx_user_b` (`user_b_id`),
  FOREIGN KEY (`user_a_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_b_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='交易锁表-防止同用户多次点亮';

-- Titles Table (头衔表)
CREATE TABLE `titles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `level` TINYINT NOT NULL UNIQUE COMMENT '等级 1-4',
  `name` VARCHAR(50) NOT NULL COMMENT '头衔名称',
  `required_provinces` INT NOT NULL COMMENT '所需点亮省份数',
  `badge_icon` VARCHAR(500) DEFAULT NULL COMMENT '徽章图标URL',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='头衔等级表';

-- Insert default titles
INSERT INTO `titles` (`level`, `name`, `required_provinces`, `description`) VALUES
(1, '探索者', 3, '点亮3个省份'),
(2, '旅行家', 10, '点亮10个省份'),
(3, '游侠', 20, '点亮20个省份'),
(4, '游礼大师', 30, '点亮30个省份');

-- Missing Children Table (宝贝回家 - 公益数据)
CREATE TABLE `missing_children` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `gender` ENUM('male', 'female') NOT NULL COMMENT '性别',
  `missing_date` DATE NOT NULL COMMENT '失踪日期',
  `missing_location` VARCHAR(200) NOT NULL COMMENT '失踪地点',
  `province` VARCHAR(50) NOT NULL COMMENT '失踪省份',
  `age_at_missing` INT COMMENT '失踪时年龄',
  `current_age` INT COMMENT '当前推算年龄',
  `photo` VARCHAR(500) DEFAULT NULL COMMENT '照片URL',
  `description` TEXT COMMENT '特征描述',
  `contact_info` VARCHAR(200) DEFAULT NULL COMMENT '联系方式',
  `case_number` VARCHAR(100) DEFAULT NULL COMMENT '案件编号',
  `status` ENUM('missing', 'found', 'archived') DEFAULT 'missing' COMMENT '状态',
  `created_by` INT UNSIGNED DEFAULT NULL COMMENT '录入管理员ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_province` (`province`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宝贝回家公益数据表';

-- Admin Users Table (管理员表)
CREATE TABLE `admin_users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码hash',
  `role` ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin' COMMENT '角色',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1:正常 2:禁用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- Transaction Records Table (交易记录表)
CREATE TABLE `transaction_records` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `order_id` INT UNSIGNED DEFAULT NULL COMMENT '关联订单ID',
  `type` ENUM('freeze', 'unfreeze', 'payment', 'refund', 'withdraw') NOT NULL COMMENT '类型',
  `amount` DECIMAL(10, 2) NOT NULL COMMENT '金额',
  `balance_before` DECIMAL(10, 2) NOT NULL COMMENT '操作前余额',
  `balance_after` DECIMAL(10, 2) NOT NULL COMMENT '操作后余额',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_order_id` (`order_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='交易记录表';
