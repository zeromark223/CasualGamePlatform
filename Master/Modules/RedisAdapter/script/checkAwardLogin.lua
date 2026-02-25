local result = redis.call('lrange',KEYS[1],KEYS[2],KEYS[3])
redis.call('ltrim',KEYS[1],KEYS[3],-1)
return result