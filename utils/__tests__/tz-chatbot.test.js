require('dotenv-flow').config()
const axios = require('axios')
const { parseMessage, getCurrentTime } = require('../tz-chatbot')
const { logger } = require('../logger')

jest.mock('axios')


describe('chat service', () => {
  describe('## parseMessage', () => {
    it('should parse a user text message correctly', () => {
      const userMessage = 'john: this is a simple text message'
      const { username, message, isCommand } = parseMessage(userMessage)

      expect(username).toBe('john')
      expect(message).toBe('this is a simple text message')
      expect(isCommand).toBeFalsy()
    });

    it('should parse a timepopularity command message correctly', () => {
      const userMessage = 'anna: !timepopularity America/New_York'
      const { username, message, isCommand, command, tz } = parseMessage(userMessage)

      expect(username).toBe('anna')
      expect(message).toBe('!timepopularity America/New_York')
      expect(command).toBe('!timepopularity')
      expect(tz).toBe('America/New_York')
      expect(isCommand).toBeTruthy()
    });

    it('should parse a timeat command message correctly', () => {
      const userMessage = 'anna: !timeat America/Argentina/Buenos_Aires'
      const { username, message, isCommand, command, tz } = parseMessage(userMessage)

      expect(username).toBe('anna')
      expect(message).toBe('!timeat America/Argentina/Buenos_Aires')
      expect(command).toBe('!timeat')
      expect(tz).toBe('America/Argentina/Buenos_Aires')
      expect(isCommand).toBeTruthy()
    });

    it('should ignore command if the message does not start with !', () => {
      const userMessage = 'john:        !timeat America/Chicago'
      const { message, isCommand, command } = parseMessage(userMessage)

      expect(message).toBe('       !timeat America/Chicago')
      expect(command).toBe(null)
      expect(isCommand).toBeFalsy()
    });

    it('should filter tz correctly', () => {
      const { tz: tz1 } = parseMessage('anna: !timeat America/Argentina/Buenos_Aires')
      const { tz: tz2 } = parseMessage('anna: !timeat PST8PDT')
      const { tz: tz3 } = parseMessage('anna: !timeat Etc/GMT+10')
      const { tz: tz4 } = parseMessage('anna: !timeat Etc/GMT-7')
      const { tz: tz5 } = parseMessage('anna: !timeat Europe/Amsterdam')
      const { tz: tz6 } = parseMessage('anna: !timeat HST')
      const { tz: tz7 } = parseMessage('anna: !timeat Pacific/Port_Moresby')
      const { tz: tz8 } = parseMessage('anna: !timeat Etc/UTC')
      const { tz: tz9 } = parseMessage('anna: !timeat America/Port-au-Prince')

      expect(tz1).toBe('America/Argentina/Buenos_Aires')
      expect(tz2).toBe('PST8PDT')
      expect(tz3).toBe('Etc/GMT+10')
      expect(tz4).toBe('Etc/GMT-7')
      expect(tz5).toBe('Europe/Amsterdam')
      expect(tz6).toBe('HST')
      expect(tz7).toBe('Pacific/Port_Moresby')
      expect(tz8).toBe('Etc/UTC')
      expect(tz9).toBe('America/Port-au-Prince')
    });

    it('should throw an error if the message is not in the correct format', () => {
      const userMessage = 'john:format is not correct'

      expect(() => {
        parseMessage(userMessage)
      }).toThrow()
    });

    it('should throw an error if no message is passed', () => {
      expect(() => {
        parseMessage()
      }).toThrow()
    });
  })

  describe('## getCurrentTime', () => {

    it('should return the current time correctly', async () => {
      const tz = 'America/Argentina/Buenos_Aires'
      logger.debug = jest.fn()
      axios.get.mockResolvedValue({
        data: {
          abbreviation: '-03',
          datetime: '2021-06-20T19:20:55.207577-03:00',
          timezone: 'America/Argentina/Buenos_Aires',
          utc_datetime: '2021-06-20T22:20:55.207577+00:00',
          utc_offset: '-03:00'
        },
        status: 200
      })
      const { err, time } = await getCurrentTime(tz)
      expect(axios.get).toBeCalledWith(`${process.env.TIME_API}/timezone/${tz}`)
      expect(logger.debug).toHaveBeenCalledTimes(3)
      expect(err).toBe(null)
      expect(time).toBe('20 Jun 2021 19:20')
    })

    it('should return an error if tz is incorrect', async () => {
      const tz = 'Nowhere'
      logger.debug = jest.fn()
      axios.get.mockResolvedValue({
        data: {
          error: 'unknown location'
        },
        status: 404
      })
      const { err, time } = await getCurrentTime(tz)
      expect(axios.get).toBeCalledWith(`${process.env.TIME_API}/timezone/${tz}`)
      expect(err).toBe('unknown timezone')
      expect(time).toBe(undefined)
    })

    it('should return an error if tz is just a prefix', async () => {
      const tz = 'America'
      logger.debug = jest.fn()
      axios.get.mockResolvedValue({
        data: [
          'America/Adak',
          'America/Anchorage',
          'America/Araguaina',
          'America/Argentina/Buenos_Aires',
          'America/Argentina/Catamarca',
          'America/Argentina/Cordoba',
          'America/Argentina/Jujuy',
          'America/Argentina/La_Rioja',
          'America/Argentina/Mendoza'
        ],
        status: 404
      })
      const { err, time } = await getCurrentTime(tz)
      expect(axios.get).toBeCalledWith(`${process.env.TIME_API}/timezone/${tz}`)
      expect(err).toBe('unknown timezone')
      expect(time).toBe(undefined)
    })
  })
})
