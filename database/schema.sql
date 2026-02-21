-- ============================================
-- SocialMRT Database Schema
-- MySQL 8.0+
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS socialmrt_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE socialmrt_db;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar VARCHAR(500) NULL,
    bio TEXT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at DATETIME NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================
-- EMAIL VERIFICATION TOKENS
-- ============================================
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_otp (otp_code),
    INDEX idx_user_expires (user_id, expires_at)
) ENGINE=InnoDB;

-- ============================================
-- REFRESH TOKENS
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token(255)),
    INDEX idx_user_expires (user_id, expires_at)
) ENGINE=InnoDB;

-- ============================================
-- PASSWORD RESET TOKENS
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token)
) ENGINE=InnoDB;

-- ============================================
-- SOCIAL ACCOUNTS (Connected Platforms)
-- ============================================
CREATE TABLE IF NOT EXISTS social_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    platform ENUM('bluesky', 'mastodon', 'telegram', 'discord', 'reddit', 
                  'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 
                  'youtube', 'pinterest') NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_username VARCHAR(255) NULL,
    account_avatar VARCHAR(500) NULL,
    access_token TEXT NULL,
    refresh_token TEXT NULL,
    token_expires_at DATETIME NULL,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSON NULL,
    connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_platform_account (user_id, platform, account_id),
    INDEX idx_user_platform (user_id, platform),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- ============================================
-- POSTS
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    content_type ENUM('text', 'image', 'video', 'carousel') DEFAULT 'text',
    status ENUM('draft', 'scheduled', 'publishing', 'published', 'failed') DEFAULT 'draft',
    scheduled_at DATETIME NULL,
    published_at DATETIME NULL,
    campaign_id INT NULL,
    metadata JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_scheduled (scheduled_at),
    INDEX idx_campaign (campaign_id)
) ENGINE=InnoDB;

-- ============================================
-- POST MEDIA (Images, Videos, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS post_media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    media_type ENUM('image', 'video', 'gif') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NULL,
    mime_type VARCHAR(100) NULL,
    alt_text VARCHAR(500) NULL,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post (post_id)
) ENGINE=InnoDB;

-- ============================================
-- POST PLATFORMS (Which platforms to post to)
-- ============================================
CREATE TABLE IF NOT EXISTS post_platforms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    social_account_id INT NOT NULL,
    platform_post_id VARCHAR(255) NULL,
    status ENUM('pending', 'publishing', 'published', 'failed') DEFAULT 'pending',
    error_message TEXT NULL,
    published_at DATETIME NULL,
    
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (social_account_id) REFERENCES social_accounts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_account (post_id, social_account_id)
) ENGINE=InnoDB;

-- ============================================
-- CAMPAIGNS
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    color VARCHAR(7) DEFAULT '#6366F1',
    start_date DATE NULL,
    end_date DATE NULL,
    status ENUM('draft', 'active', 'paused', 'completed') DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB;

-- Add foreign key for posts campaign_id
ALTER TABLE posts 
ADD CONSTRAINT fk_post_campaign 
FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;

-- ============================================
-- CONTENT CATEGORIES/LABELS
-- ============================================
CREATE TABLE IF NOT EXISTS content_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#8B5CF6',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category (user_id, name)
) ENGINE=InnoDB;

-- ============================================
-- POST CATEGORIES (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS post_categories (
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    
    PRIMARY KEY (post_id, category_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES content_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- CONTENT TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS content_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category_id INT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    use_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES content_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- POST ANALYTICS
-- ============================================
CREATE TABLE IF NOT EXISTS post_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_platform_id INT NOT NULL,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    saves INT DEFAULT 0,
    impressions INT DEFAULT 0,
    reach INT DEFAULT 0,
    clicks INT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_platform_id) REFERENCES post_platforms(id) ON DELETE CASCADE,
    INDEX idx_post_platform (post_platform_id),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB;

-- ============================================
-- ACCOUNT ANALYTICS (Daily snapshots)
-- ============================================
CREATE TABLE IF NOT EXISTS account_analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    social_account_id INT NOT NULL,
    followers INT DEFAULT 0,
    following INT DEFAULT 0,
    posts_count INT DEFAULT 0,
    recorded_date DATE NOT NULL,
    
    FOREIGN KEY (social_account_id) REFERENCES social_accounts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_account_date (social_account_id, recorded_date),
    INDEX idx_recorded_date (recorded_date)
) ENGINE=InnoDB;

-- ============================================
-- ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id INT NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_action (user_id, action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================
-- SUCCESS! Print confirmation
-- ============================================
SELECT 'SocialMRT Database Schema Created Successfully!' AS Status;
