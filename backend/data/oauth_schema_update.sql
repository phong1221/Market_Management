-- Add OAuth columns to useraccount table
ALTER TABLE `useraccount` 
ADD COLUMN `email` VARCHAR(255) NULL AFTER `passWord`,
ADD COLUMN `google_id` VARCHAR(255) NULL AFTER `email`,
ADD COLUMN `facebook_id` VARCHAR(255) NULL AFTER `google_id`,
ADD COLUMN `oauth_provider` ENUM('google', 'facebook') NULL AFTER `facebook_id`,
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER `oauth_provider`;

-- Add indexes for better performance
ALTER TABLE `useraccount` 
ADD INDEX `idx_email` (`email`),
ADD INDEX `idx_google_id` (`google_id`),
ADD INDEX `idx_facebook_id` (`facebook_id`),
ADD INDEX `idx_oauth_provider` (`oauth_provider`); 