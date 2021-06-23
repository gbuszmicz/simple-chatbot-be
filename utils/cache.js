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
  const get = async (key) => {
    const getAsync = promisify(client.get).bind(client);
    return getAsync(key)
  }
  const incr = async (key) => {
    const incrAsync = promisify(client.incr).bind(client);
    return incrAsync(key)
  }
  return {
    connect,
    disconnect,
    get,
    incr
  }
}

module.exports = {
  cacheManager,
}
