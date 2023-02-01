import { Request, Response } from 'express'
import userService from '../services/users'

import { BAD_REQUEST, BACKEND_ERROR } from '../config'

import { getAccessToken } from '../helpers/twitter/twitter'
import { Data } from '../helpers/schema'

const getData = async (req: Request, res: Response) => {
  try {
    const params = req.body.params

    if (params === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    const result = await userService.findByFilter(params)

    console.log('get data: ', result)

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}

const addEvent = async (req: Request, res: Response) => {
  try {
    let { data } = req.body
    if (data === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    const temp = {
      discordId: data.discordId,
      discordName: data.discordName,
      twitterId: data.twitterId,
      twitterUserName: data.twitterUserName,
      nftTickets: 0,
      wlTickets: 0
    }

    const result = await userService.createOrUpdate(temp)

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    console.log(e)
    return res.status(500).json(BACKEND_ERROR)
  }
}

const updateEvent = async (req: Request, res: Response) => {
  try {
    const { data } = req.body

    if (data === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    const result = await userService.updateOne(data)

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}

const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.body
    console.log('delete id: ', id)

    if (id === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    const result = await userService.deleteOne({ _id: id })

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}

const buyTicket = async (req: Request, res: Response) => {
  try {
    const { discordId, discordName, ticketType, ticketNumber } = req.body.data
    if (discordId === undefined || discordName === undefined || ticketType === undefined || ticketNumber === undefined || !(ticketNumber > 0)) {
      return res.status(400).json(BAD_REQUEST)
    }

    const tempUser = await userService.findOneByCondition({ discordId: discordId })
    if (tempUser) {
      // tempUser.nftTickets = ticketType === 0 ? ticketNumber : 0
      // tempUser.wlTickets = ticketType === 0 ? 0 : ticketNumber
      if (tempUser.nftTickets === undefined || tempUser.wlTickets === undefined) {
        tempUser.nftTickets = 0
        tempUser.wlTickets = 0
      }
      ticketType === 0 ? tempUser.nftTickets = tempUser.nftTickets + ticketNumber : tempUser.wlTickets = tempUser.wlTickets + ticketNumber

      await userService.updateOne(tempUser)
    } else {
      const data = {
        discordId: discordId,
        discordName: discordName,
        nftTickets: ticketType === 0 ? ticketNumber : 0,
        wlTickets: ticketType === 0 ? 0 : ticketNumber,
        twitterId: '',
        twitterUserName: ''
      }
      await userService.createOne(data)
    }

    const result = await userService.findOneByCondition({ discordId: discordId })

    return res.json({ success: true, message: 'Success', data: result })
  } catch (error) {
    console.log(error)
    return res.status(500).json(BACKEND_ERROR)
  }
}

const getUser = async (req: Request, res: Response) => {
  try {
    const { discordId } = req.query
    if (discordId === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    const result = await userService.findOneByCondition({ discordId: discordId })

    return res.json({ success: true, message: 'Success', data: result })
  } catch (error) {
    console.log(error)
    return res.status(500).json(BACKEND_ERROR)
  }
}

export default {
  getData,
  addEvent,
  updateEvent,
  deleteEvent,
  buyTicket,
  getUser
}