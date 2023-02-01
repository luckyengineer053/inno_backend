import { Request, Response } from 'express'
import userService from '../services/admin'
import projectService from '../services/project';
import wlRaffleService from '../services/wlRaffle';
import daoVotingService from '../services/daoVoting';
import { IAdmin } from '../models/admin';

import { BAD_REQUEST, BACKEND_ERROR } from '../config'
import { UploadedFile } from 'express-fileupload';
import fs from 'fs';

import { getStatus } from '../helpers/customHelper';

const getData = async (req: Request, res: Response) => {
    try {
        const params = req.body.params

        if (params === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const result = await userService.findByFilter(params)

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
            data['avatar'] = '/uploads/' + name
        }

        delete data._id

        const result = await userService.createOne(data)

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

            const currentData: IAdmin = (await userService.findOne({ _id: data._id })).data
            const image = currentData.avatar

            if (fs.existsSync(`${__dirname}/../build/${image}`)) {
                fs.unlink(`${__dirname}/../build/${image}`, (err) => {
                    if (err) throw err
                    console.log('Image file deleted')
                })
            }

            await file.mv(`${dir}/${name}`);
            data['avatar'] = '/uploads/' + name
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

        if (id === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const currentData: IAdmin = (await userService.findOne({ _id: id })).data
        const image = currentData.avatar

        if (fs.existsSync(`${__dirname}/../build/${image}`)) {
            fs.unlink(`${__dirname}/../build/${image}`, (err) => {
                if (err) throw err
                console.log('Image file deleted')
            })
        }
        const result = await userService.deleteOne({ _id: id })

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getOverview = async (req: Request, res: Response) => {
    try {
        const { username } = req.body

        if (username === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const subscriberData = await userService.findOne({ username: username })
        const discordName = subscriberData.data.discordName

        const projectData = await projectService.findOneByCondition({ subscriber: discordName })
        const raffles = await wlRaffleService.findByCondition({ hostedProjectId: projectData._id })
        let ongoingRaffleNumber = 0
        let endedRaffleNumber = 0

        raffles.map((raffle: any) => {
            if (getStatus(raffle.startDate, raffle.endDate) === 'Ongoing') {
                ongoingRaffleNumber += 1
            } else if (getStatus(raffle.startDate, raffle.endDate) === 'Ended') {
                endedRaffleNumber += 1
            }
        })

        const daoVotings = await daoVotingService.findByCondition({ hostedProjectId: projectData._id })
        let ongoingVotingNumber = 0
        let endedVotingNumber = 0

        daoVotings.map((voting: any) => {
            if (getStatus(voting.startDate, voting.endDate) === 'Ongoing') {
                ongoingVotingNumber += 1
            } else if (getStatus(voting.startDate, voting.endDate) === 'Ended') {
                endedVotingNumber += 1
            }
        })

        const result = {
            username: username,
            password: subscriberData.data.password,
            discordName: discordName,
            image: projectData.image,
            projectId: projectData._id,
            projectName: projectData.name,
            billingCycle: projectData.billingCycle,
            ongoingRaffleNumber: ongoingRaffleNumber,
            endedRaffleNumber: endedRaffleNumber,
            ongoingVotingNumber: ongoingVotingNumber,
            endedVotingNumber: endedVotingNumber
        }

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getAdminOverview = async (req: Request, res: Response) => {
    try {
        const { username } = req.body

        if (username === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const adminData = await userService.findOne({ username: username })

        const projects = await projectService.findAll()
        let projectNumber = 0
        let projectReferrals = 0

        const result = {
            username: username,
            password: adminData.data.password,
            discordName: adminData.data.discordName,
        }

        return res.json({ success: true, message: 'Success', data: result })
    } catch (error) {
        console.log(error)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const updatePassword = async (req: Request, res: Response) => {
    try {
        const { data } = req.body
        if (data === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const temp = await userService.findOne({ discordId: data.discordId })
        const originialData = temp.data
        originialData.password = data.newPassword
        const result = await userService.updateOne(originialData)
        if (result.success) {
            return res.json({ success: true, message: 'Success', data: result.data })
        } else {
            return res.json({ success: false, message: 'Error' })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const updateImage = async (req: Request, res: Response) => {
    try {
        const { data } = req.body
        if (data === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const project = await projectService.findOneByID(data)

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

            const currentData: IAdmin = (await userService.findOne({ _id: data._id })).data
            const image = currentData.avatar
            fs.unlink(`${__dirname}/../build/${image}`, (err) => {
                if (err) throw err
                console.log('Image file deleted')
            })

            await file.mv(`${dir}/${name}`);
            project['image'] = '/uploads/' + name
        }

        const result = await projectService.updateOne(project)
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
    getOverview,
    getAdminOverview,
    updatePassword,
    updateImage
}