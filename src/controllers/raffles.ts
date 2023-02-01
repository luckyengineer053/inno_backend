import { Request, Response } from 'express'
import rafflesService from '../services/raffles'
import userService from '../services/users'
import fs from 'fs';
import { UploadedFile } from 'express-fileupload';
import { BAD_REQUEST, BACKEND_ERROR, RAFFLE_WEBHOOK_URL } from '../config'
import { IRaffles } from '../models/raffles';
import {
  getCurrentEntries,
  checkRaffleJoined,
  getLeftTime,
  getStatus,
  shuffleArray,
  randomItemFromArray,
  getWinnerName,
  getWinnerWallet,
} from '../helpers/customHelper';
import axios from 'axios';

const getData = async (req: Request, res: Response) => {
  try {
    const params = req.body.params

    if (params === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    const result = await rafflesService.findByFilter(params)

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    console.log(e)
    return res.status(500).json(BACKEND_ERROR)
  }
}

const addEvent = async (req: Request, res: Response) => {
  try {
    let { data } = req.body

    if (data === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }
    data = JSON.parse(data)
    if (req.files !== null) {
      const file = req.files.file as UploadedFile
      const index = file['name'].lastIndexOf('.')
      const format = file['name'].substring(index, file['name'].length)
      const name = new Date().getTime().toString() + format
      const dir = `${__dirname}/../build/uploads`

      if (!fs.existsSync(`${__dirname}/../build`)) {
        fs.mkdirSync(`${__dirname}/../build`);
      }

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      await file.mv(`${dir}/${name}`);
      data['image'] = '/uploads/' + name
    }

    data.rafflers = []
    data.currentTickets = []
    data.winners = []
    data.isEnded = false

    delete data._id

    const result = await rafflesService.createOne(data)

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    console.log(e)
    return res.status(500).json(BACKEND_ERROR)
  }
}

const updateEvent = async (req: Request, res: Response) => {
  try {
    let { data } = req.body

    if (data === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }
    data = JSON.parse(data)

    if (req.files !== null) {
      const file = req.files.file as UploadedFile
      const index = file['name'].lastIndexOf('.')
      const format = file['name'].substring(index, file['name'].length)
      const name = new Date().getTime().toString() + format
      const dir = `${__dirname}/../build/uploads`

      if (!fs.existsSync(`${__dirname}/../build`)) {
        fs.mkdirSync(`${__dirname}/../build`);
      }

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      const currentData: IRaffles = await rafflesService.findOneByID(data._id)
      const image = currentData.image

      if (fs.existsSync(`${__dirname}/../build/${image}`)) {
        fs.unlink(`${__dirname}/../build/${image}`, (err) => {
          if (err) throw err
          console.log('Image file deleted')
        })
      }
      await file.mv(`${dir}/${name}`);
      data['image'] = '/uploads/' + name
    }

    const result = await rafflesService.updateOne(data)
    // delete data.id
    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}

const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.body

    if (id === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    const currentData: IRaffles = await rafflesService.findOneByID(id)
    const image = currentData.image

    if (fs.existsSync(`${__dirname}/../build/${image}`)) {
      fs.unlink(`${__dirname}/../build/${image}`, (err) => {
        if (err) throw err
        console.log('Image file deleted')
      })
    }
    const result = await rafflesService.deleteOne(id)

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}

const getRafflesDataByCondition = async (condition: number) => {
  let tempRaffles = []
  switch (condition) {
    case 3: // all
      tempRaffles = await rafflesService.findAll()
      break;
    case 2: // holders only
      tempRaffles = await rafflesService.findByCondition({ availability: 0 })
      break;
    case 1: // whitelist raffles
      tempRaffles = await rafflesService.findByCondition({ type: 1 })
      break;
    case 0: // NFT raffles
      tempRaffles = await rafflesService.findByCondition({ type: 0 })
      break;
    default: // all
      tempRaffles = await rafflesService.findAll()
      break;
  }

  return tempRaffles
}

const getDataByStatus = async (req: Request, res: Response) => {
  try {
    const { discordId, filters } = req.body

    if (discordId === undefined || filters === undefined || filters.length === 0) {
      return res.status(400).json(BAD_REQUEST)
    }

    let result = []
    let tempRaffles = await getRafflesDataByCondition(filters[0])

    await Promise.all(tempRaffles.map(async (raffle: IRaffles) => {
      if ((getStatus(raffle.startDate, raffle.endDate) === 'Ended') && !raffle.isEnded) {
        await decideWinners(raffle._id)
      }
    }))

    tempRaffles = await getRafflesDataByCondition(filters[0])

    if (filters[1] === 'All') {
      tempRaffles.map((raffle: IRaffles) => {
        result.push({
          raffle: raffle,
          timeStatus: filters[1],
          entries: getCurrentEntries(raffle.rafflers),
          leftTime: getLeftTime(raffle.endDate),
          isRaffleJoined: checkRaffleJoined(raffle.rafflers, discordId),
        })
      })
    }

    if (filters[1] === 'Ongoing') {
      tempRaffles.map((raffle: IRaffles) => {
        if (getStatus(raffle.startDate, raffle.endDate) === 'Ongoing') {
          result.push({
            raffle: raffle,
            timeStatus: filters[1],
            entries: getCurrentEntries(raffle.rafflers),
            leftTime: getLeftTime(raffle.endDate),
            isRaffleJoined: checkRaffleJoined(raffle.rafflers, discordId),
          })
        }
      })
    }

    if (filters[1] === 'Ended') {
      tempRaffles.map((raffle: IRaffles) => {
        if ((getStatus(raffle.startDate, raffle.endDate) === 'Ended') && raffle.isEnded) {
          result.push({
            raffle: raffle,
            timeStatus: filters[1],
            entries: 0,
            leftTime: getLeftTime(raffle.endDate)
          })
        }
      })
    }

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    console.log(e)
    return res.status(500).json(BACKEND_ERROR)
  }
}

const decideWinners = async (raffleId: string) => {
  try {
    const data: IRaffles = await rafflesService.findOneByID(raffleId)

    // check raffle is ended
    if (getStatus(data.startDate, data.endDate) !== 'Ended') {
      console.log('Not ended yet')
      return false
    }

    if (data.isEnded) {
      return false
    }

    // generate discordId array
    let nameArray: string[] = []
    data.rafflers.map((raffler: any) => {
      for (let i = 0; i < raffler.entries; i++) {
        nameArray.push(raffler.discordId)
      }
    })

    if (nameArray.length === 0) {
      console.log("No any enters")
      data.isEnded = true
      await rafflesService.updateOne(data)
      return true
    }

    const shuffledNameArray = shuffleArray(nameArray)
    if (data.type === 0) { // NFT
      // select only one from array
      const winner: string = randomItemFromArray(shuffledNameArray)
      data.winners.push(winner)
    } else { // Whitelist
      let index = 0
      while ((data.winners.length <= data.winnerNumber) && (index < nameArray.length)) {
        if (!data.winners.includes(shuffledNameArray[index])) {
          data.winners.push(shuffledNameArray[index])
        }
        index++
      }
    }
    data.isEnded = true
    await rafflesService.updateOne(data)

    // web hook url
    const fields: any[] = []
    data.winners.map((discordId: string) => {
      let discordName: string = getWinnerName(discordId, data.rafflers)
      let walletAddress: string = getWinnerWallet(discordId, data.rafflers)
      fields.push({
        name: `@${discordName}`,
        value: walletAddress
      })
    })

    const params = {
      username: "Inoooo Bot",
      avatar_url: "",
      content: "Winners of ISOS Raffle",
      embeds: [
        {
          "title": `Winners of ${data.raffleName}`,
          "color": 15258703,
          "thumbnail": {
            "url": "",
          },
          "fields": fields
        }
      ]
    }

    try {
      console.log('start to winners to ISOS raffle channel')
      await axios.post(RAFFLE_WEBHOOK_URL,
        params,
        {
          headers: { 'Content-type': 'application/json' },
        },
      )
      console.log('ended')
    } catch (error) {
      console.log(error)
    }

    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

const enterRaffle = async (req: Request, res: Response) => {
  try {
    const { discordId, discordName, walletAddress, raffleId, ticketNumber } = req.body.data

    if (discordId === undefined || discordName === undefined || walletAddress === undefined || raffleId === undefined || ticketNumber === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    // check user has already joined raffle
    const tempRaffle: IRaffles = await rafflesService.findOneByID(raffleId)

    // check number of tickets
    const user = await userService.findOneByCondition({ discordId: discordId })
    if (tempRaffle.type === 0) { // NFT
      if (ticketNumber > user.nftTickets) {
        return res.json({ success: false, message: 'Wrong ticket number' })
      } else {
        user.nftTickets -= ticketNumber
      }
    } else {
      if (ticketNumber > user.wlTickets) {
        return res.json({ success: false, message: 'Wrong ticket number' })
      } else {
        user.wlTickets -= ticketNumber
      }
    }

    // enter raffle
    tempRaffle.rafflers.push({
      discordId,
      discordName,
      walletAddress,
      entries: ticketNumber
    })

    const updatedRaffle = await rafflesService.updateOne(tempRaffle)
    const updatedUser = await userService.updateOne(user)

    const result = {
      raffle: updatedRaffle,
      entries: getCurrentEntries(updatedRaffle.rafflers),
      isRaffleJoined: checkRaffleJoined(updatedRaffle.rafflers, discordId),
      leftTime: getLeftTime(updatedRaffle.endDate)
    }

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    console.log(e)
    return res.status(500).json(BACKEND_ERROR)
  }
}

const getMyRaffles = async (req: Request, res: Response) => {
  try {
    const { discordId } = req.query
    if (discordId === undefined) {
      return res.status(400).json(BACKEND_ERROR)
    }

    const result: any[] = []
    const raffles: IRaffles[] = await rafflesService.findAll()
    raffles.map((raffle: any) => {
      let isEntered: boolean = false
      raffle.rafflers.map((item: any) => {
        if (item.discordId === discordId) {
          isEntered = true
        }
      })
      if (isEntered) {
        result.push({ name: raffle.raffleName, type: raffle.type })
      }
    })

    return res.json({ success: true, message: 'Success', data: result })
  } catch (error) {
    console.log(error)
  }
}

export default {
  getData,
  addEvent,
  updateEvent,
  deleteEvent,
  getDataByStatus,
  enterRaffle,
  getMyRaffles
}