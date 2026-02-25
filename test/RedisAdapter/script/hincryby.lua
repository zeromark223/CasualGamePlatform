local val = redis.call("hincrby", KEYS[1], KEYS[2], KEYS[3])
local result = 0
local res = {result = 0, val = 0}
if val <= tonumber(KEYS[4]) then
result = 1
else
val = redis.call("hincrby", KEYS[1], KEYS[2], KEYS[3]*-1)
end
res[1] = result
res[2] = val
return res
