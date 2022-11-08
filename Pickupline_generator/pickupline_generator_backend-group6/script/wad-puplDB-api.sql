USE [WAD-MMD-CSD-S21_10407756]
GO


-- DROPPING


-- puplPickUpLineTheme
ALTER TABLE dbo.puplPickUpLineTheme
DROP CONSTRAINT IF EXISTS puplFK_PickUpLineTheme_Theme
GO
ALTER TABLE dbo.puplPickUpLineTheme
DROP CONSTRAINT IF EXISTS puplFK_PickUpLineTheme_PickUpLine
GO
DROP TABLE IF EXISTS dbo.puplPickUpLineTheme
GO


-- puplTheme
DROP TABLE IF EXISTS dbo.puplTheme
GO


-- puplPickUpLine
DROP TABLE IF EXISTS dbo.puplPickUpLine
GO

-- puplPassword
ALTER TABLE dbo.puplPassword
DROP CONSTRAINT IF EXISTS puplFK_Password_Account
GO
DROP TABLE IF EXISTS dbo.puplPassword
GO


-- puplAccount
ALTER TABLE dbo.puplAccount
DROP CONSTRAINT IF EXISTS puplFK_Account_Role
GO
DROP TABLE dbo.puplAccount
GO


-- puplRole
DROP TABLE IF EXISTS dbo.puplRole 
GO

-- puplProfile
DROP TABLE IF EXISTS dbo.puplProfile
GO


-- CREATING THE TABLES

-- puplProfile
CREATE TABLE dbo.puplProfile
(
    profileid INT NOT NULL IDENTITY PRIMARY KEY,
    username NVARCHAR(50) NOT NULL,
);
GO

-- puplRole
CREATE TABLE dbo.puplRole
(
    roleid INT NOT NULL IDENTITY PRIMARY KEY,
    rolename NVARCHAR(50) NOT NULL,
    roledescr NVARCHAR(255)
);
GO


-- puplAccount
CREATE TABLE dbo.puplAccount
(
    accountid INT NOT NULL IDENTITY PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    FK_roleid INT NOT NULL,
    FK_profileid INT UNIQUE,

    CONSTRAINT puplFK_Account_Role FOREIGN KEY (FK_roleid) REFERENCES puplRole (roleid),
    CONSTRAINT puplFK_Account_Profile FOREIGN KEY (FK_profileid) REFERENCES puplProfile (profileid)
);
GO 


-- puplPassword
CREATE TABLE dbo.puplPassword
(
    FK_accountid INT NOT NULL UNIQUE,
    hashedpassword NVARCHAR(255) NOT NULL,

    CONSTRAINT puplFK_Password_Account FOREIGN KEY (FK_accountid) REFERENCES puplAccount (accountid)
);
GO

-- puplPickUpLine
CREATE TABLE dbo.puplPickUpLine
(
    pickuplineid INT NOT NULL IDENTITY PRIMARY KEY,
    pickuplinequote NVARCHAR(255) NOT NULL,
    FK_accountid INT,

    CONSTRAINT puplFK_PickUpLine_Account FOREIGN KEY (FK_accountid) REFERENCES puplAccount (accountid)
);
GO


-- puplTheme
CREATE TABLE dbo.puplTheme
(
    themeid INT NOT NULL IDENTITY PRIMARY KEY,
    themename NVARCHAR(50) NOT NULL,
    themedescr NVARCHAR(255) 
);
GO


-- puplPickUpLineTheme
CREATE TABLE dbo.puplPickUpLineTheme
(   
    FK_pickuplineid INT NOT NULL,
    FK_themeid INT NOT NULL,

    CONSTRAINT puplFK_PickUpLineTheme_PickUpLine FOREIGN KEY (FK_pickuplineid) REFERENCES puplPickUpLine (pickuplineid),
    CONSTRAINT puplFK_PickUpLineTheme_Theme FOREIGN KEY (FK_themeid) REFERENCES puplTheme (themeid)
);
GO


-- POPULATING THE DATA INTO TABLES


-- puplRole
INSERT INTO dbo.puplRole
    ([rolename], [roledescr])
VALUES
    ('admin', 'can do whatever'),
    ('member', 'can do stuff they have allowed')
GO



-- -- puplProfile
INSERT INTO dbo.puplProfile
    ([username])
VALUES
    ('Frog'),
    ('Lexa12')
GO


-- puplAccount
INSERT INTO dbo.puplAccount
    ([email], [FK_roleid], [FK_profileid])
VALUES
    ('sisterinchrist@google.com', 1, NULL),
    ('frogmaster@gmail.com', 2, 1),
    ('lexa12@brave.com', 2, 2)
GO


--puplPassword
INSERT INTO dbo.puplPassword
    ([FK_accountid], [hashedpassword])
VALUES
    (1, '$2y$13$HHGJMc3T9BM5Bg9VUguyxe0izqsFFOBbOnDrQMhFjXamkonvwNHqe'),
    (2, '$2y$13$V9N/ClT1yIHshzucg07kXuUh1VgDgeoOfhqDl32ghJBcHwD5hQPYe'),
    (3, '$2y$13$CQ79BeXCQVbGYMP4qtfEeuE0U0yIiWXW47zHh5yYsUT/14rbmpY5S')
GO

-- {
--    "words": [
--        "skydaddy",
--        "thecutest",
--        "BloodMustHaveBlood"
--    ],
--    "hash": [
--        "$2y$13$HHGJMc3T9BM5Bg9VUguyxe0izqsFFOBbOnDrQMhFjXamkonvwNHqe"
--        "$2y$13$V9N/ClT1yIHshzucg07kXuUh1VgDgeoOfhqDl32ghJBcHwD5hQPYe",
--        "$2y$13$CQ79BeXCQVbGYMP4qtfEeuE0U0yIiWXW47zHh5yYsUT/14rbmpY5S",
--        
--    ]
-- }

-- puplPickUpLine
INSERT INTO dbo.puplPickUpLine
    ([pickuplinequote], [FK_accountid])
VALUES
    ('You must be the cure for Alzheimer because you are unforgettable.', NULL),
    ('Are you a dictionary? Because you are adding mining to my life.', NULL),
    ('You must be tired because you have been running through my mind all night.', NULL),
    ('Are you a magician? It is the strangest thing, but every time I look at you, everyone else disappears.', 3),
    ('I am no photographer, but I can picture us together.', NULL),
    ('I would say, "God bless you", but it looks like he already did.', 3),
    ('Something is wrong with my eyes because I can not take them off you.', NULL),
    ('Are you a time traveller? Cause I see you in my future!', NULL),
    ('Are you a toaster? Because a bath with you would send me straight to heaven.', NULL),
    ('There is a big sale at my bedroom, clothes are 100% off.', 2),
    ('If you were a Transformer…you would be Optimus Fine.', NULL),
    ('There is something wrong with my cell phone. It does not have your number in it.', 2),
    ('I am learning about important dates in history. Wanna be one of them?', 3),
    ('Can I take a picture of you, so I can show Santa exactly what I want for Christmas.', 3),
    ('Are you Christmas, because I want to Merry you.', NULL),
    ('Hi, Santa said you wished for me. Good choice.', NULL),
    ('Are you a ghost? Because I think that you could be my boo.', 2),
    ('Is your name a wi-fi? Because I can feel a connection.', NULL),
    ('Are you a http? Because without you I am just ://', NULL),
    ('Are you a computer keyboard? Because you are my type.', NULL),
    ('Our love is like dividing by zero . . . you cannot define it.', 2),
    ('Hey, my name is Microsoft. Can I crash at your place tonight?', NULL),
    ('Is your name Google? Because you have everything I have been searching for.', NULL)
GO

-- puplTheme
INSERT INTO dbo.puplTheme
    ([themename], [themedescr])
VALUES
    ('Wholesome', 'Ones that warm up your and your loves heart'),
    ('Dark Humor', 'For the lords of darkness flavoured with spicyness and humor'),
    ('Cringy', 'Ones that can be said only by a right person to be efficient'),
    ('Christmas', 'When you wanna try your luck with the first snow'),
    ('Halloween', 'Spooky ones'),
    ('IT', 'For the true IT masters')
GO


-- puplPickUpLineTheme
INSERT INTO  dbo.puplPickUpLineTheme
    ([FK_pickuplineid], [FK_themeid])
VALUES
    (1, 1),
    (2, 1),
    (3, 1),
    (4, 1),
    (5, 1),
    (6, 1),
    (7, 1),
    (8, 1),
    (9, 2),
    (10, 3),
    (11, 3),
    (12, 3),
    (13, 3),
    (14, 4),
    (15, 4),
    (16, 4),
    (17, 5),
    (18, 6),
    (19, 6),
    (20, 6),
    (21, 6),
    (22, 6),
    (23, 6)
GO


