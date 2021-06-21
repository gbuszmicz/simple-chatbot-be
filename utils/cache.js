const redis = require('redis')
const { promisify } = require('util')

/**
 * Simple cache manager
 * TODO. Move connectionOptions out of the function and
 * leave that as an implementation detail to be passed as
 * params when calling the function
 */
const cacheManager = () => {
  const connectionOptions = {
    host: process.env.REDIS_URI,
    password: process.env.REDIS_PASS,
    port: process.env.REDIS_PORT
  }
  let client

  const connect = () => {
    client = redis.createClient(connectionOptions)
  }
  const disconnect = () => {
    client.quit();
  }
  const set = async (key, value) => {
    const setAsync = promisify(client.set).bind(client);
    return setAsync(key, value)
  }
  const get = async (key) => {
    const getAsync = promisify(client.get).bind(client);
    return getAsync(key)
  }
  const del = async (key) => {
    const delAsync = promisify(client.del).bind(client);
    return delAsync(key)
  }
  const incr = async (key) => {
    const incrAsync = promisify(client.incr).bind(client);
    return incrAsync(key)
  }
  return {
    connect,
    disconnect,
    set,
    get,
    del,
    incr
  }
}

module.exports = {
  cacheManager,
}
