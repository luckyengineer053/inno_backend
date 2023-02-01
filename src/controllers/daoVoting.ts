import { Request, Response } from 'express'
import daoVotingService from '../services/daoVoting'
import projectService from '../services/project';
import { IDaoVoting } from '../models/daoVoting';
import { BAD_REQUEST, BACKEND_ERROR } from '../config'

import { SolanaClient } from '../helpers/solana';

import { Connection } from "@solana/web3.js"
import { CLUSTER_API } from '../config';
import { getStatus } from '../helpers/customHelper';

// Admin Panel
const getData = async (req: Request, res: Response) => {
  try {
    const params = req.body.params

    if (params === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }
    const result = []
    const tempResult = await daoVotingService.findByFilter(params)

    return res.json({ success: true, message: 'Success', data: tempResult })
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

    const result = await daoVotingService.findOneByID(id)

    return res.json({ success: true, message: "Success", data: result })
  } catch (error) {

  }
}

// subscriber
const addEvent = async (req: Request, res: Response) => {
  try {
    let { data } = req.body

    if (data === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }
    data = JSON.parse(data)

    if (data.option0 === '' || data.option1 === '') {
      return res.json(400).json(BAD_REQUEST)
    }

    let temp = []
    temp.push({ option: data.option0, voteNumber: [] })
    temp.push({ option: data.option1, voteNumber: [] })
    if (data.option2) {
      temp.push({ option: data.option2, voteNumber: [] })
    }
    if (data.option3) {
      temp.push({ option: data.option3, voteNumber: [] })
    }

    const hostedProject = await projectService.findOneByCondition({ subscriber: data.submittedUser })

    if (hostedProject._id === undefined) {
      return res.json(400).json(BAD_REQUEST)
    }

    const agendaData = {
      agenda: data.agenda,
      submittedUser: data.submittedUser,
      options: temp,
      startDate: data.startDate,
      endDate: data.endDate,
      hostedProjectId: hostedProject._id,
      isEnded: false
    }

    delete data._id

    const result = await daoVotingService.createOne(agendaData)
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

    const result = await daoVotingService.updateOne(data)

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

    const result = await daoVotingService.deleteOne(id)

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}

const getAllData = async (req: Request, res: Response) => {
  try {
    const result = await daoVotingService.findAll()

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}
// Admin Panel
const vote = async (req: Request, res: Response) => {
  try {
    let { projectId, discordId, walletAddress, creators, optionIndex, voteNumber } = req.body
    if (projectId === undefined || discordId === undefined
      || walletAddress === undefined || creators === undefined
      || optionIndex === undefined || voteNumber === undefined || voteNumber <= 0) {
      return res.status(400).json(BAD_REQUEST)
    }

    const data = await daoVotingService.findOneByID(projectId)
    const verified: boolean = await verifyVote(walletAddress, discordId, data, creators, voteNumber)

    if (verified) {
      const temp = data
      for (let i = 0; i < voteNumber; i++) {
        temp.options[optionIndex].voteNumber.push(discordId)
      }

      const result = await daoVotingService.updateOne(temp)
      return res.json({ success: true, message: 'Success', data: result })
    } else {
      return res.json({ success: false, message: 'Vote number is over nft number' })
    }

  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}

const verifyVote = async (walletAddress: string, discordId: string, voteData: any, creators: string[], voteNumber: number) => {

  const solanaClient = new SolanaClient({ rpcEndpoint: CLUSTER_API })
  const ownedNfts = await solanaClient.getAllCollectiblesWithCreator([walletAddress], creators)
  const fetchedNftNumber = ownedNfts[walletAddress].length
  let total = voteNumber
  voteData.options.map((option: any) => {
    let temp = option.voteNumber.filter((id: any) => id === discordId).length
    total += temp
  })

  if (total > fetchedNftNumber) {
    return false
  } else {
    return true
  }
}

// frontend

const addEventByUser = async (req: Request, res: Response) => {
  try {
    let { data } = req.body

    if (data === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }
    data = JSON.parse(data)

    if (data.option0 === '' || data.option1 === '') {
      return res.json(400).json(BAD_REQUEST)
    }

    let temp = []
    temp.push({ option: data.option0, voteNumber: [] })
    temp.push({ option: data.option1, voteNumber: [] })
    if (data.option2) {
      temp.push({ option: data.option2, voteNumber: [] })
    }
    if (data.option3) {
      temp.push({ option: data.option3, voteNumber: [] })
    }

    const agendaData = {
      agenda: data.agenda,
      submittedUser: data.submittedUser,
      options: temp,
      startDate: data.startDate,
      endDate: data.endDate,
      hostedProjectId: data.hostedProjectId,
      isEnded: false
    }

    delete data._id

    const result = await daoVotingService.createOne(agendaData)
    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}

const getDataByProjectId = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query
    const votings = await daoVotingService.findByCondition({ hostedProjectId: projectId })
    let filterRes = []
    votings.map(async (voting: IDaoVoting) => {
      if (getStatus(voting.startDate, voting.endDate) === 'Ongoing') {
        filterRes.push(voting)
      }

      if (getStatus(voting.startDate, voting.endDate) === 'Ended' && !voting.isEnded) {
        voting.isEnded = true
        await daoVotingService.updateOne(voting)
      }
      if (getStatus(voting.startDate, voting.endDate) === 'Ended') {
        filterRes.push(voting)
      }
    })

    return res.json({ success: true, message: 'Success', data: filterRes })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}

// Admin Panel
const getDataByDiscordName = async (req: Request, res: Response) => {
  try {
    const params = req.body.params
    const discordName = req.body.discordName

    if (params === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    const project = await projectService.findOneByCondition({ subscriber: discordName })

    const filter = { ...params, hostedProjectId: project._id }

    const result = await daoVotingService.findByFilter(filter)

    return res.json({ success: true, message: 'Success', data: result })
  } catch (e) {
    return res.status(500).json(BACKEND_ERROR)
  }
}

export default {
  getData,
  getOneData,
  addEvent,
  updateEvent,
  deleteEvent,
  getAllData,
  vote,
  getDataByProjectId,
  getDataByDiscordName,
  addEventByUser
}

   // temp

    // try {
    //   // const address = "3EqUrFrjgABCWAnqMYjZ36GcktiwDtFdkNYwY6C6cDzy;
    //   // or use Solana Domain
    //   // const address = "NftEyez.sol";

    //   const publicAddress = await resolveToWalletAddress({
    //     text: '3EqUrFrjgABCWAnqMYjZ36GcktiwDtFdkNYwY6C6cDzy'
    //   });
    //   // var connection = new web3.Connection(
    //   //   web3.clusterApiUrl("mainnet-beta"),
    //   //   "confirmed"
    //   // );

    //   const nftArray = await getParsedNftAccountsByOwner({
    //     publicAddress,
    //     connection
    //   });

    //   const nftNumber = nftArray.length
    //   console.log('nft number: ', nftNumber)
    // } catch (error) {
    //   console.log("Error thrown, while fetching NFTs", error.message);
    // }