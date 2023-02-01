import { Request, Response } from 'express'
import wlRaffleService from '../services/wlRaffle'
import usersService from '../services/users';
import projectService from '../services/project';
import { IWlRaffle } from '../models/wlRaffle';
import { IUsers } from '../models/users';
import { BAD_REQUEST, BACKEND_ERROR, OPP_WEBHOOK_URL } from '../config'
import axios from 'axios';
import fs from 'fs';
import { UploadedFile } from 'express-fileupload';

import { BOT_ID } from '../config'
import { getFollowers } from '../helpers/twitter/twitter'
import {
  getLeftTime,
  getStatus,
  getTimeStatus,
  getCurrentEntries,
  checkRaffleJoined,
  getOwnedNftsNumber,
  shuffleArray,
  checkIsObtainedRole,
  addMemberToRole,
  checkServerID,
  checkServeHasRole,
  checkUserHasRole,
  checkUserHasRoleOpp
} from '../helpers/customHelper';
import { IProject } from '../models/project';

// Admin Panel
const getData = async (req: Request, res: Response) => {
  try {
    const params = req.body.params

    if (params === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    const result = await wlRaffleService.findByFilter(params)

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}

const getOneData = async (req: Request, res: Response) => {
  try {
    const { id } = req.query
    if (id === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    const result = await wlRaffleService.findOneByID(id)

    return res.json({ success: true, message: "Success", data: result })
  } catch (error) {

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
    data.winners = []
    data.rafflers = []
    data.roles = []
    // data.isVerified = false
    // data.isClaimed = false
    data.isEnded = false
    data.isActive = false
    data.verifiedUsers = false
    data.timeStatus = 0

    delete data._id

    const result = await wlRaffleService.createOne(data)

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
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

      const currentData: IWlRaffle = await wlRaffleService.findOneByID(data._id)
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

    const result = await wlRaffleService.updateOne(data)

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

    const currentData: IWlRaffle = await wlRaffleService.findOneByID(id)
    const image = currentData.image

    if (fs.existsSync(`${__dirname}/../build/${image}`)) {
      fs.unlink(`${__dirname}/../build/${image}`, (err) => {
        if (err) throw err
        console.log('Image file deleted')
      })
    }
    const result = await wlRaffleService.deleteOne(id)

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}
// Admin Panel
// subscriber panel
const getDataByDiscordName = async (req: Request, res: Response) => {
  try {
    const { params, discordName } = req.body

    if (params === undefined || discordName === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    const tempResult = await wlRaffleService.findByFilterAndDiscordName(params, discordName)
    // update timeStatus
    await Promise.all(tempResult.rows.map(async (project: IWlRaffle) => {
      if (project.timeStatus !== 2) {
        const currentStatus: number = getTimeStatus(project.startDate, project.endDate)
        if (project.timeStatus !== currentStatus) {
          project.timeStatus = currentStatus
          await wlRaffleService.updateOne(project)
        }
      }
    }))

    const result = await wlRaffleService.findByFilterAndDiscordName(params, discordName)

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}

// frontend 

const checkTwitterAuthorized = async (discordId: string) => {
  try {
    const result = await usersService.findOneByCondition({ discordId: discordId })

    if (result.twitterId && result.twitterUserName) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

const checkTwitterFollowed = async (sourceName: string, targetName: string) => {
  const followers = await getFollowers(sourceName, targetName)
  if (followers.relationship.target.following) {
    return true
  } else {
    return false
  }
}

// for frontend when click drop down
const getDataByStatus = async (req: Request, res: Response) => {
  try {
    const { discordId, hostedProjectId, status } = req.body.data

    if (discordId === undefined || hostedProjectId === undefined || status === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    let raffles = await wlRaffleService.findByCondition({ hostedProjectId: hostedProjectId })

    if (status === 'Ongoing') {
      let filterRes = []
      const targetUser = await usersService.findOneByCondition({ discordId: discordId })
      if (!targetUser) {
        return res.json({ success: true, message: 'Ongoing', data: [], isTwitterAuthorized: false })
      }
      const targetName = targetUser.twitterUserName

      await Promise.all(raffles.map(async (raffle: IWlRaffle) => {
        if (status === getStatus(raffle.startDate, raffle.endDate)) {
          const sourceTwitterUrl = raffle.twitter
          const splitTextArray = sourceTwitterUrl.split('/')
          const sourceName = splitTextArray[splitTextArray.length - 1]

          filterRes.push({
            raffle: raffle,
            leftTime: getLeftTime(raffle.endDate),
            entries: getCurrentEntries(raffle.rafflers),
            // isTwitterFollowed: await checkTwitterFollowed(sourceName, targetName),
            isTwitterFollowed: false,
            isRaffleJoined: checkRaffleJoined(raffle.rafflers, discordId)
          })
        }
      }))
      const isTwitterAuthorized: boolean = await checkTwitterAuthorized(discordId)

      return res.json({ success: true, message: 'Ongoing', data: filterRes, isTwitterAuthorized: isTwitterAuthorized })
    }

    if (status === 'Ended') {
      let filterRes = []

      // decide winners
      await Promise.all(raffles.map(async (raffle: IWlRaffle) => {
        if (status === getStatus(raffle.startDate, raffle.endDate) && raffle.isEnded === false) {
          await decideWinners(raffle._id)
        }
      }))

      // get again data from database after deciding winners
      raffles = await wlRaffleService.findByCondition({ hostedProjectId: hostedProjectId })
      const hostedProject: IProject = await projectService.findOneByID(hostedProjectId)
      await Promise.all(raffles.map(async (raffle: IWlRaffle) => {
        if ((status === getStatus(raffle.startDate, raffle.endDate)) && raffle.isEnded) {
          let winnerNames: string[] = []
          await Promise.all(raffle.winners.map(async (winner: string) => {
            let user: IUsers = await usersService.findOneByCondition({ discordId: winner })
            if (user) {
              winnerNames.push(user.discordName)
            }
          }))

          filterRes.push({
            raffle: raffle,
            isWinner: raffle.winners.includes(discordId),
            entries: getCurrentEntries(raffle.rafflers),
            winnerNames: winnerNames,
            hostedProjectName: hostedProject.name
          })
        }
      }))

      return res.json({ success: true, message: 'Ended', data: filterRes })
    }

    if (status === 'Unclaimed') {
      let filterRes = []
      // decide cliamed tab
      await Promise.all(raffles.map(async (raffle: any) => {
        if (('Ended' === getStatus(raffle.startDate, raffle.endDate)) && raffle.isEnded && (raffle.isActive === false)) {
          await decideClaimedAcitve(raffle._id)
        }
      }))

      await Promise.all(raffles.map(async (raffle: IWlRaffle) => {
        if (('Ended' === getStatus(raffle.startDate, raffle.endDate)) && raffle.isEnded && raffle.isActive) {   /// edit here
          let subscribedStatus: boolean = false
          let isObtained: boolean = false
          const originProject: IProject = await projectService.findOneByCondition({ name: raffle.projectName })
          if (originProject && originProject.subscribeStatus === 1) {
            subscribedStatus = true
            isObtained = checkIsObtainedRole(raffle.roles, discordId)
          } else {
            subscribedStatus = false
            isObtained = checkIsObtainedRole(raffle.roles, discordId)
            if (isObtained === false) {
              // isObtained = (originProject.serverId && raffle.roleId) ? await checkUserHasRoleOpp(originProject.serverId, discordId, raffle.roleId) : false
              isObtained = (originProject && originProject.serverId && raffle.roleId) ? await checkUserHasRoleOpp(originProject.serverId, discordId, raffle.roleId) : false
              if (isObtained) {
                raffle.roles.push(discordId)
                await wlRaffleService.updateOne(raffle)
              }
            }
          }
          const isWinner = raffle.winners.includes(discordId)
          if (isWinner) {
            filterRes.push({
              raffle: raffle,
              isObtained: isObtained,
              isWinner: isWinner,
              entries: getCurrentEntries(raffle.rafflers),
              subscribedStatus: subscribedStatus
            })
          }
        }
      }))

      return res.json({ success: true, message: 'Unclaimed', data: filterRes })
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json(BACKEND_ERROR)
  }
}

// when click button "Enter raffle"
const enterRaffle = async (req: Request, res: Response) => {
  try {
    let { raffleProjectId, creators, walletAddress, discordId } = req.body.data

    if (raffleProjectId === undefined || creators === undefined || walletAddress === undefined || discordId === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    const data: IWlRaffle = await wlRaffleService.findOneByID(raffleProjectId)

    const nftNumber = await getOwnedNftsNumber(walletAddress, creators)
    if (!nftNumber) {
      return res.json({ success: false, message: 'Not nft number' })
    } else {
      const temp = data
      let isAlreadyEnter: boolean = false
      data.rafflers.map((raffler: any) => {
        if (raffler.discordId === discordId) {
          isAlreadyEnter = true
        }
      })

      if (isAlreadyEnter) {
        return res.json({ success: false, message: 'You already entered' })
      }

      // hosted project creatorAddress (upcoming, minted)
      const hostedProject: IProject = await projectService.findOneByID(data.hostedProjectId)

      const tempRaffler = {
        discordId: discordId,
        entries: hostedProject.creatorAddress ? nftNumber : 1,
        // entries: nftNumber,
        // role: ''
      }

      // temp.rafflers[rafflerNumber].entries = nftNumber
      temp.rafflers.push(tempRaffler)

      const updatedRaffle = await wlRaffleService.updateOne(temp)
      const result = {
        raffle: updatedRaffle,
        leftTime: getLeftTime(updatedRaffle.endDate),
        entries: getCurrentEntries(updatedRaffle.rafflers),
        isTwitterFollowed: true,
        isRaffleJoined: true
      }

      return res.json({ success: true, message: 'Success', data: result })
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json(BACKEND_ERROR)
  }
}

// when click claim role
const claimRole = async (req: Request, res: Response) => {
  try {
    const { discordId, projectId } = req.body
    if (discordId === undefined || projectId === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }
    const originRaffle: IWlRaffle = await wlRaffleService.findOneByID(projectId)
    const isAlreadyObtained = checkIsObtainedRole(originRaffle.roles, discordId)
    if (isAlreadyObtained === true) {
      return res.json({ success: false, message: 'Already obtained role' })
    }

    const isSuccess: boolean = await addMemberToRole(originRaffle.serverId, discordId, originRaffle.roleId)
    if (!isSuccess) {
      return res.json({ success: false, message: 'Failed to get the role' })
    }

    originRaffle.roles.push(discordId)
    const updatedRaffle = await wlRaffleService.updateOne(originRaffle)
    const result = {
      raffle: updatedRaffle,
      isObtained: true
    }

    return res.json({ success: true, message: 'Success', data: result })
  } catch (error) {
    console.log(error)
    return res.status(500).json(BACKEND_ERROR)
  }
}

// select winners
const decideWinners = async (raffleProjectId: string) => {
  try {
    const data: IWlRaffle = await wlRaffleService.findOneByID(raffleProjectId)
    // check ended raffle
    const status = getStatus(data.startDate, data.endDate)
    if (status !== 'Ended') {
      console.log('Not ended yet')
      return false
    }

    if (data.isEnded) {
      console.log('Already decided winners')
      return false
    }

    // generate discord name array
    let nameArray = []
    data.rafflers.map((raffler: any) => {
      for (let i = 0; i < raffler.entries; i++) {
        nameArray.push(raffler.discordId)
      }
    })

    if (nameArray.length === 0) {
      console.log("No any enters")
      data.isEnded = true
      await wlRaffleService.updateOne(data)
      return true
    }

    // shuffle name array randomly
    const shuffledNameArray = shuffleArray(nameArray)

    let index = 0

    while ((data.winners.length <= data.wlSpots) && (index < nameArray.length)) {
      if (!data.winners.includes(shuffledNameArray[index])) {
        data.winners.push(shuffledNameArray[index])
      }
      index += 1
    }

    data.isEnded = true
    await wlRaffleService.updateOne(data)

    // web hook url
    // const webhookData: any[] = []

    // await Promise.all(data.winners.map(async (discordId: string) => {
    //   const temp: string = await getWinnerName(discordId)
    //   webhookData.push({
    //     name: `@${temp}`,
    //     value: ''
    //   })
    // }))

    // const params = {
    //   username: 'Inoooo bot',
    //   avatar_url: "",
    //   content: `Winners of Whitelist Opportunity`,
    //   embeds: [
    //     {
    //       "title": `Winners of ${data.projectName}`,
    //       "color": 15258703,
    //       "thumbnail": {
    //         "url": "",
    //       },
    //       "fields": webhookData
    //     }
    //   ]
    // }

    // try {
    //   console.log('start to send winners to opportunity channel')
    //   await axios.post(OPP_WEBHOOK_URL,
    //     params,
    //     {
    //       headers: { 'Content-type': 'application/json' },
    //     },
    //   )
    //   console.log('ended')
    // } catch (error) {
    //   console.log(error)
    // }

    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

const getWinnerName = async (discordId: string) => {
  try {
    const user: IUsers = await usersService.findOneByCondition({ discordId: discordId })
    return user.discordName
  } catch (error) {
    console.log(error)
  }
}

const decideClaimedAcitve = async (raffleProjectId: string) => {
  try {
    const data: IWlRaffle = await wlRaffleService.findOneByID(raffleProjectId)
    if (!(data.serverId && data.roleId && data.role)) {
      return false
    }
    let isActive: boolean = false
    const originProject: IProject = await projectService.findOneByCondition({ name: data.projectName })
    if (originProject && originProject.subscribeStatus === 1) {
      isActive = await checkDiscordBot(data.serverId, data.roleId)
      // isActive = true
    } else {
      isActive = true
    }
    if (isActive) {
      data.isActive = true
      await wlRaffleService.updateOne(data)
      return true
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

const validateDiscordBot = async (req: Request, res: Response) => {
  try {
    const { serverId, roleId } = req.body
    const isInvited = await checkServerID(serverId, BOT_ID)
    if (!isInvited) {
      return res.json({ success: false, message: 'Please invite a bot!' })
    }

    const hasRole = await checkServeHasRole(serverId, roleId)
    if (!hasRole) {
      return res.json({ success: false, message: 'Discord Server doesn\'t have whitelist role' })
    }

    const hasPermission = await addMemberToRole(serverId, BOT_ID, roleId)
    if (!hasPermission) {
      return res.json({ success: false, message: 'Bot doesn\'t have permission to give whitelist role' })
    }

    return res.json({ success: true, message: 'success' })
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: 'error' })
  }
}

const checkDiscordBot = async (serverId: string, roleId: string) => {
  try {
    const isInvited = await checkServerID(serverId, BOT_ID)
    if (!isInvited) {
      return false
    }

    const hasRole = await checkServeHasRole(serverId, roleId)
    if (!hasRole) {
      return false
    }

    const hasPermission = await addMemberToRole(serverId, BOT_ID, roleId)
    if (!hasPermission) {
      return false
    }

    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export default {
  getData,
  getOneData,
  addEvent,
  updateEvent,
  deleteEvent,
  getDataByStatus,
  enterRaffle,
  decideWinners,
  getDataByDiscordName,
  claimRole,
  validateDiscordBot
}