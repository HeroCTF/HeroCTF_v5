DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS videos;

CREATE TABLE `users` (
    `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `pseudo` varchar(20) NOT NULL UNIQUE,
    `email` varchar(60) NOT NULL UNIQUE,
    `password` varchar(64) NOT NULL
);

CREATE TABLE `chats` (
    `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(36) NOT NULL UNIQUE,
    `nbMessages` INT
);

CREATE TABLE `videos`(
    `id` VARCHAR(36) PRIMARY KEY NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `userId` INT REFERENCES users(`id`),
    `chatId` VARCHAR(36) REFERENCES chats(`publicId`) ON UPDATE CASCADE,
    `isPrivate` INT NOT NULL,
    `pathVideo` VARCHAR(200) NOT NULL UNIQUE
);

CREATE TABLE `messages`(
    `id` VARCHAR(36) PRIMARY KEY NOT NULL,
    `content` VARCHAR(10000) NOT NULL,
    `userId` INT REFERENCES users(`id`),
    `chatId` VARCHAR(36) REFERENCES chats(`publicId`) ON UPDATE CASCADE
);

INSERT INTO users VALUES(1,"admin","admin@youwatch.fr","179f37e72a3b58c423421c5078d0064af9016d873fa2832b9ed92099065b2dce");
INSERT INTO chats VALUES(1,"68d399ca-9c47-4092-a610-6e725c6f6599",0);
INSERT INTO videos VALUES("46634e1e-2738-4898-934d-7f044eb2a364","[ADMIN] Very Secret Video",1,"68d399ca-9c47-4092-a610-6e725c6f6599",1,"admin_video_that_contains_flag_and_some_kuddos.mp4");