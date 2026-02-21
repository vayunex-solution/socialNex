-- ============================================
-- SocialMRT Stored Procedures
-- MySQL 8.0+
-- ============================================

USE socialmrt_db;

DELIMITER //

-- ============================================
-- USER PROCEDURES
-- ============================================

-- Create user
CREATE PROCEDURE sp_create_user(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_full_name VARCHAR(100),
    OUT p_user_id INT
)
BEGIN
    INSERT INTO users (email, password, full_name, is_verified, is_active, role, created_at)
    VALUES (p_email, p_password, p_full_name, FALSE, TRUE, 'user', NOW());
    
    SET p_user_id = LAST_INSERT_ID();
END //

-- Get user by email
CREATE PROCEDURE sp_get_user_by_email(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT id, email, password, full_name, avatar, is_verified, is_active, role, last_login, created_at
    FROM users
    WHERE email = p_email;
END //

-- Get user by ID
CREATE PROCEDURE sp_get_user_by_id(
    IN p_user_id INT
)
BEGIN
    SELECT id, email, full_name, avatar, bio, is_verified, is_active, role, last_login, created_at
    FROM users
    WHERE id = p_user_id AND is_active = TRUE;
END //

-- Update user profile
CREATE PROCEDURE sp_update_user_profile(
    IN p_user_id INT,
    IN p_full_name VARCHAR(100),
    IN p_bio TEXT,
    IN p_avatar VARCHAR(500)
)
BEGIN
    UPDATE users
    SET full_name = COALESCE(p_full_name, full_name),
        bio = COALESCE(p_bio, bio),
        avatar = COALESCE(p_avatar, avatar),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    SELECT id, email, full_name, avatar, bio, is_verified, role
    FROM users WHERE id = p_user_id;
END //

-- Update last login
CREATE PROCEDURE sp_update_last_login(
    IN p_user_id INT
)
BEGIN
    UPDATE users SET last_login = NOW() WHERE id = p_user_id;
END //

-- ============================================
-- EMAIL VERIFICATION PROCEDURES
-- ============================================

-- Save verification token
CREATE PROCEDURE sp_save_verification_token(
    IN p_user_id INT,
    IN p_token VARCHAR(64),
    IN p_otp_code VARCHAR(6),
    IN p_expires_minutes INT
)
BEGIN
    -- Invalidate existing tokens
    UPDATE email_verification_tokens 
    SET is_used = TRUE 
    WHERE user_id = p_user_id AND is_used = FALSE;
    
    -- Insert new token
    INSERT INTO email_verification_tokens (user_id, token, otp_code, expires_at, created_at)
    VALUES (p_user_id, p_token, p_otp_code, DATE_ADD(NOW(), INTERVAL p_expires_minutes MINUTE), NOW());
END //

-- Verify email token
CREATE PROCEDURE sp_verify_email_token(
    IN p_token VARCHAR(64),
    OUT p_is_valid BOOLEAN,
    OUT p_user_id INT
)
BEGIN
    -- Find valid token
    SELECT user_id INTO p_user_id
    FROM email_verification_tokens
    WHERE (token = p_token OR otp_code = p_token)
      AND expires_at > NOW()
      AND is_used = FALSE
    LIMIT 1;
    
    IF p_user_id IS NOT NULL THEN
        SET p_is_valid = TRUE;
        
        -- Mark token as used
        UPDATE email_verification_tokens 
        SET is_used = TRUE 
        WHERE (token = p_token OR otp_code = p_token);
        
        -- Mark user as verified
        UPDATE users 
        SET is_verified = TRUE, verified_at = NOW() 
        WHERE id = p_user_id;
    ELSE
        SET p_is_valid = FALSE;
    END IF;
END //

-- ============================================
-- PASSWORD RESET PROCEDURES
-- ============================================

-- Save password reset token
CREATE PROCEDURE sp_save_password_reset_token(
    IN p_user_id INT,
    IN p_token VARCHAR(64)
)
BEGIN
    -- Invalidate existing tokens
    UPDATE password_reset_tokens 
    SET is_used = TRUE 
    WHERE user_id = p_user_id AND is_used = FALSE;
    
    -- Insert new token (expires in 1 hour)
    INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
    VALUES (p_user_id, p_token, DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW());
END //

-- Verify and use password reset token
CREATE PROCEDURE sp_verify_password_reset_token(
    IN p_token VARCHAR(64),
    OUT p_is_valid BOOLEAN,
    OUT p_user_id INT
)
BEGIN
    SELECT user_id INTO p_user_id
    FROM password_reset_tokens
    WHERE token = p_token
      AND expires_at > NOW()
      AND is_used = FALSE
    LIMIT 1;
    
    IF p_user_id IS NOT NULL THEN
        SET p_is_valid = TRUE;
        UPDATE password_reset_tokens SET is_used = TRUE WHERE token = p_token;
    ELSE
        SET p_is_valid = FALSE;
    END IF;
END //

-- Update password
CREATE PROCEDURE sp_update_password(
    IN p_user_id INT,
    IN p_new_password VARCHAR(255)
)
BEGIN
    UPDATE users SET password = p_new_password, updated_at = NOW() WHERE id = p_user_id;
END //

-- ============================================
-- SOCIAL ACCOUNT PROCEDURES
-- ============================================

-- Add social account
CREATE PROCEDURE sp_add_social_account(
    IN p_user_id INT,
    IN p_platform VARCHAR(50),
    IN p_account_id VARCHAR(255),
    IN p_account_name VARCHAR(255),
    IN p_account_username VARCHAR(255),
    IN p_account_avatar VARCHAR(500),
    IN p_access_token TEXT,
    IN p_refresh_token TEXT,
    IN p_token_expires_at DATETIME,
    IN p_metadata JSON,
    OUT p_id INT
)
BEGIN
    INSERT INTO social_accounts (
        user_id, platform, account_id, account_name, account_username,
        account_avatar, access_token, refresh_token, token_expires_at,
        metadata, is_active, connected_at
    )
    VALUES (
        p_user_id, p_platform, p_account_id, p_account_name, p_account_username,
        p_account_avatar, p_access_token, p_refresh_token, p_token_expires_at,
        p_metadata, TRUE, NOW()
    )
    ON DUPLICATE KEY UPDATE
        account_name = p_account_name,
        account_username = p_account_username,
        account_avatar = p_account_avatar,
        access_token = p_access_token,
        refresh_token = COALESCE(p_refresh_token, refresh_token),
        token_expires_at = p_token_expires_at,
        metadata = p_metadata,
        is_active = TRUE,
        updated_at = NOW();
    
    SET p_id = LAST_INSERT_ID();
END //

-- Get user's social accounts
CREATE PROCEDURE sp_get_user_social_accounts(
    IN p_user_id INT
)
BEGIN
    SELECT id, platform, account_id, account_name, account_username, 
           account_avatar, is_active, connected_at
    FROM social_accounts
    WHERE user_id = p_user_id AND is_active = TRUE
    ORDER BY connected_at DESC;
END //

-- Get social account with tokens (for posting)
CREATE PROCEDURE sp_get_social_account_with_tokens(
    IN p_account_id INT,
    IN p_user_id INT
)
BEGIN
    SELECT id, platform, account_id, account_name, account_username,
           access_token, refresh_token, token_expires_at, metadata
    FROM social_accounts
    WHERE id = p_account_id AND user_id = p_user_id AND is_active = TRUE;
END //

-- Update social account tokens
CREATE PROCEDURE sp_update_social_account_tokens(
    IN p_account_id INT,
    IN p_access_token TEXT,
    IN p_refresh_token TEXT,
    IN p_token_expires_at DATETIME
)
BEGIN
    UPDATE social_accounts
    SET access_token = p_access_token,
        refresh_token = COALESCE(p_refresh_token, refresh_token),
        token_expires_at = p_token_expires_at,
        updated_at = NOW()
    WHERE id = p_account_id;
END //

-- Disconnect social account
CREATE PROCEDURE sp_disconnect_social_account(
    IN p_account_id INT,
    IN p_user_id INT
)
BEGIN
    UPDATE social_accounts
    SET is_active = FALSE, updated_at = NOW()
    WHERE id = p_account_id AND user_id = p_user_id;
END //

-- ============================================
-- POST PROCEDURES
-- ============================================

-- Create post
CREATE PROCEDURE sp_create_post(
    IN p_user_id INT,
    IN p_content TEXT,
    IN p_content_type VARCHAR(20),
    IN p_scheduled_at DATETIME,
    IN p_campaign_id INT,
    IN p_metadata JSON,
    OUT p_post_id INT
)
BEGIN
    DECLARE v_status VARCHAR(20);
    
    IF p_scheduled_at IS NOT NULL THEN
        SET v_status = 'scheduled';
    ELSE
        SET v_status = 'draft';
    END IF;
    
    INSERT INTO posts (user_id, content, content_type, status, scheduled_at, campaign_id, metadata, created_at)
    VALUES (p_user_id, p_content, p_content_type, v_status, p_scheduled_at, p_campaign_id, p_metadata, NOW());
    
    SET p_post_id = LAST_INSERT_ID();
END //

-- Get user posts
CREATE PROCEDURE sp_get_user_posts(
    IN p_user_id INT,
    IN p_status VARCHAR(20),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT p.id, p.content, p.content_type, p.status, p.scheduled_at, 
           p.published_at, p.campaign_id, p.created_at,
           c.name AS campaign_name, c.color AS campaign_color
    FROM posts p
    LEFT JOIN campaigns c ON p.campaign_id = c.id
    WHERE p.user_id = p_user_id
      AND (p_status IS NULL OR p.status = p_status)
    ORDER BY 
        CASE WHEN p.status = 'scheduled' THEN p.scheduled_at 
             ELSE p.created_at END DESC
    LIMIT p_limit OFFSET p_offset;
END //

-- Get post by ID with platforms
CREATE PROCEDURE sp_get_post_by_id(
    IN p_post_id INT,
    IN p_user_id INT
)
BEGIN
    SELECT p.*, 
           GROUP_CONCAT(
               JSON_OBJECT(
                   'id', pp.id,
                   'socialAccountId', pp.social_account_id,
                   'platform', sa.platform,
                   'accountName', sa.account_name,
                   'status', pp.status,
                   'publishedAt', pp.published_at
               )
           ) AS platforms
    FROM posts p
    LEFT JOIN post_platforms pp ON p.id = pp.post_id
    LEFT JOIN social_accounts sa ON pp.social_account_id = sa.id
    WHERE p.id = p_post_id AND p.user_id = p_user_id
    GROUP BY p.id;
END //

-- Get scheduled posts for publishing
CREATE PROCEDURE sp_get_due_scheduled_posts()
BEGIN
    SELECT p.id, p.user_id, p.content, p.content_type, p.metadata,
           pp.id AS platform_id, pp.social_account_id,
           sa.platform, sa.access_token, sa.refresh_token, sa.token_expires_at
    FROM posts p
    JOIN post_platforms pp ON p.id = pp.post_id
    JOIN social_accounts sa ON pp.social_account_id = sa.id
    WHERE p.status = 'scheduled'
      AND p.scheduled_at <= NOW()
      AND pp.status = 'pending'
      AND sa.is_active = TRUE
    ORDER BY p.scheduled_at ASC;
END //

-- Update post status
CREATE PROCEDURE sp_update_post_status(
    IN p_post_id INT,
    IN p_status VARCHAR(20),
    IN p_published_at DATETIME
)
BEGIN
    UPDATE posts 
    SET status = p_status, 
        published_at = COALESCE(p_published_at, published_at),
        updated_at = NOW()
    WHERE id = p_post_id;
END //

-- Update post platform status
CREATE PROCEDURE sp_update_post_platform_status(
    IN p_platform_id INT,
    IN p_status VARCHAR(20),
    IN p_platform_post_id VARCHAR(255),
    IN p_error_message TEXT
)
BEGIN
    UPDATE post_platforms
    SET status = p_status,
        platform_post_id = COALESCE(p_platform_post_id, platform_post_id),
        error_message = p_error_message,
        published_at = CASE WHEN p_status = 'published' THEN NOW() ELSE NULL END
    WHERE id = p_platform_id;
END //

-- ============================================
-- CAMPAIGN PROCEDURES
-- ============================================

-- Create campaign
CREATE PROCEDURE sp_create_campaign(
    IN p_user_id INT,
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_color VARCHAR(7),
    IN p_start_date DATE,
    IN p_end_date DATE,
    OUT p_campaign_id INT
)
BEGIN
    INSERT INTO campaigns (user_id, name, description, color, start_date, end_date, status, created_at)
    VALUES (p_user_id, p_name, p_description, p_color, p_start_date, p_end_date, 'draft', NOW());
    
    SET p_campaign_id = LAST_INSERT_ID();
END //

-- Get user campaigns
CREATE PROCEDURE sp_get_user_campaigns(
    IN p_user_id INT
)
BEGIN
    SELECT c.*, 
           COUNT(p.id) AS post_count,
           SUM(CASE WHEN p.status = 'published' THEN 1 ELSE 0 END) AS published_count
    FROM campaigns c
    LEFT JOIN posts p ON c.id = p.campaign_id
    WHERE c.user_id = p_user_id
    GROUP BY c.id
    ORDER BY c.created_at DESC;
END //

-- ============================================
-- ANALYTICS PROCEDURES
-- ============================================

-- Record post analytics
CREATE PROCEDURE sp_record_post_analytics(
    IN p_post_platform_id INT,
    IN p_likes INT,
    IN p_comments INT,
    IN p_shares INT,
    IN p_saves INT,
    IN p_impressions INT,
    IN p_reach INT,
    IN p_clicks INT
)
BEGIN
    DECLARE v_engagement_rate DECIMAL(5,2);
    
    IF p_impressions > 0 THEN
        SET v_engagement_rate = ((p_likes + p_comments + p_shares + p_saves) / p_impressions) * 100;
    ELSE
        SET v_engagement_rate = 0;
    END IF;
    
    INSERT INTO post_analytics (
        post_platform_id, likes, comments, shares, saves, 
        impressions, reach, clicks, engagement_rate, recorded_at
    )
    VALUES (
        p_post_platform_id, p_likes, p_comments, p_shares, p_saves,
        p_impressions, p_reach, p_clicks, v_engagement_rate, NOW()
    );
END //

-- Get user analytics summary
CREATE PROCEDURE sp_get_user_analytics_summary(
    IN p_user_id INT,
    IN p_days INT
)
BEGIN
    SELECT 
        COUNT(DISTINCT p.id) AS total_posts,
        SUM(CASE WHEN p.status = 'published' THEN 1 ELSE 0 END) AS published_posts,
        SUM(pa.likes) AS total_likes,
        SUM(pa.comments) AS total_comments,
        SUM(pa.shares) AS total_shares,
        SUM(pa.impressions) AS total_impressions,
        AVG(pa.engagement_rate) AS avg_engagement_rate
    FROM posts p
    LEFT JOIN post_platforms pp ON p.id = pp.post_id
    LEFT JOIN post_analytics pa ON pp.id = pa.post_platform_id
    WHERE p.user_id = p_user_id
      AND p.created_at >= DATE_SUB(NOW(), INTERVAL p_days DAY);
END //

-- Get account growth
CREATE PROCEDURE sp_get_account_growth(
    IN p_social_account_id INT,
    IN p_days INT
)
BEGIN
    SELECT recorded_date, followers, following, posts_count
    FROM account_analytics
    WHERE social_account_id = p_social_account_id
      AND recorded_date >= DATE_SUB(CURDATE(), INTERVAL p_days DAY)
    ORDER BY recorded_date ASC;
END //

-- ============================================
-- ACTIVITY LOG PROCEDURES
-- ============================================

-- Log activity
CREATE PROCEDURE sp_log_activity(
    IN p_user_id INT,
    IN p_action VARCHAR(100),
    IN p_entity_type VARCHAR(50),
    IN p_entity_id INT,
    IN p_details JSON,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent VARCHAR(500)
)
BEGIN
    INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details, p_ip_address, p_user_agent, NOW());
END //

-- Get user activity log
CREATE PROCEDURE sp_get_user_activity(
    IN p_user_id INT,
    IN p_limit INT
)
BEGIN
    SELECT action, entity_type, entity_id, details, created_at
    FROM activity_log
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT p_limit;
END //

DELIMITER ;

-- ============================================
-- SUCCESS! Print confirmation
-- ============================================
SELECT 'SocialMRT Stored Procedures Created Successfully!' AS Status;
