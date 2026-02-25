--1:globalBossHash,2:globalBossHpHash,3:globalBossWinHash
--4:UserID,5:HPValue,6:TotalHP
local val = redis.call("hincrby", KEYS[1], KEYS[2], KEYS[5])--globalBossHash,globalBossHpHash,HPValue
local result = 0
local res = {result = 0, val = 0}
if val <= tonumber(KEYS[6]) then--TotalHP
result = 0--Chưa chết
else -- đã chết
val = redis.call("hsetnx", KEYS[1], KEYS[3], KEYS[4])--globalBossHash,globalBossWinHash,UserID
    if val == 1 then
        result = 1 -- user đầu tiên giết
    else
        result = 2
    end
end
res[1] = result
return res
