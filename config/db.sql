CREATE DATABASE IF NOT EXISTS `blog` /*!40100 DEFAULT CHARACTER SET utf8 */;

use `blog`;

CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    profile_image VARCHAR(255)
);


CREATE TABLE followers (
    follower_id VARCHAR(255),
    following_id VARCHAR(255),
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE posts (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    userId VARCHAR(255),
    image_path VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE likes (
    id VARCHAR(255) PRIMARY KEY,
    postId VARCHAR(255),
    userId VARCHAR(255),
    emoji VARCHAR(10) NOT NULL,  -- Column to store emoji reaction
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE comments (
    id VARCHAR(255) PRIMARY KEY,
    postId VARCHAR(255),
    userId VARCHAR(255),
    content TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);











-- Insert data into the users table
INSERT INTO `users` (`id`, `name`, `email`, `profile_image`) VALUES
('user_001', 'Alice Johnson', 'alice.johnson@example.com', '/uploads/54390579c3dba91b736ba31cbd9b6dab'),
('user_002', 'Bob Smith', 'bob.smith@example.com', '/uploads/70fc8925d908381cf135c00d1f839c7b'),
('user_003', 'Carol Williams', 'carol.williams@example.com', '/uploads/55ee87149b87c5403aa640e0ffd29808'),
('user_004', 'David Brown', 'david.brown@example.com', '/uploads/03c4b81d14180bd6f2bcacb499e52cbc'),
('user_005', 'Eva Green', 'eva.green@example.com', '/uploads/43e844cfb4ec3e80ae5f8809fa9d3c3d'),
('user_006', 'Frank Wilson', 'frank.wilson@example.com', '/uploads/c3253ed6053dbab20fd27389792b5fb5'),
('user_007', 'Grace Lee', 'grace.lee@example.com', '/uploads/c4970fe3e06ca73a661c360e66b8925c'),
('user_008', 'Henry Taylor', 'henry.taylor@example.com', '/uploads/9e0cbabda7c091f42c762893d39246d8'),
('user_009', 'Irene Martinez', 'irene.martinez@example.com', '/uploads/78cd42f99f8c16848b9ac23e313e00fe'),
('user_010', 'Jack Anderson', 'jack.anderson@example.com', '/uploads/eff088793c8afae4ac56af0203de1b33'),
('user_011', 'Karen Thomas', 'karen.thomas@example.com', '/uploads/fb28c8b3845e795c6feddf9e3ca8273e'),
('user_012', 'Liam Jackson', 'liam.jackson@example.com', '/uploads/b8b154c6a3d44a26c6c37f6e02eb3781'),
('user_013', 'Mia White', 'mia.white@example.com', '/uploads/9008953e4d3d6c4b73b81d5e75ae730c'),
('user_014', 'Noah Harris', 'noah.harris@example.com', '/uploads/26c04e447b42169e6b74f9f4b3e6ad5a'),
('user_015', 'Olivia Clark', 'olivia.clark@example.com', '/uploads/e000790dfe75e5d7c8945074dc70ecf9');