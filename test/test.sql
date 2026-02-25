CREATE PROCEDURE `outgame_log_Insert`()
BEGIN
	#Routine body goes here...
	insert into outgame_log (
    `Id`,
    `DeskId`,
    `KindID`,
    `MoneyChange`,
    `MoneyIn`,
    `MoneyOut`,
    `ServerId`,
    `TimeIn`,
    `TimeOut`,
    `UserID`)
values (
    :Id,
    :DeskId,
    :KindID,
    :MoneyChange,
    :MoneyIn,
    :MoneyOut,
    :ServerId,
    :TimeIn,
    :TimeOut,
    :UserID)
;
END;
;

