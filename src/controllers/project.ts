import { Request, Response } from 'express'
import projectService from '../services/project'
import adminService from '../services/admin';
import wlRaffleService from '../services/wlRaffle';

import { IProject } from '../models/project'
import { IAdmin } from '../models/admin';
import fs from 'fs';
import { UploadedFile } from 'express-fileupload';

import { BAD_REQUEST, BACKEND_ERROR } from '../config'

import {
    checkIncludeMember,
    checkUserHasRole,
    addMemberToRole,
    checkServerID,
    checkServeHasRole
} from '../helpers/customHelper';
import axios from 'axios';
import { IWlRaffle } from '../models/wlRaffle';
import { BOT_ID } from '../config';

// Admin Panel
const getData = async (req: Request, res: Response) => {
    try {
        const params = req.body.params

        if (params === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const result = await projectService.findByFilter(params)

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

        const result = await projectService.findOneByID(id)

        return res.json({ success: true, message: "Success", data: result })
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: "False" })
    }
}

const addEvent = async (req: Request, res: Response) => {
    try {
        let { data } = req.body

        if (data === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }
        data = JSON.parse(data)

        // check exist subscriber
        const subscriberRes = await adminService.findOne({ discordName: data.subscriber })
        if (subscriberRes.success === false || subscriberRes.data === null) {
            return res.json({ success: false, message: 'No exist subscriber' })
        }

        // check subscriber created project
        const projectRes = await projectService.findOneByCondition({ subscriber: data.subscriber })
        if (projectRes) {
            return res.json({ success: false, message: 'Subscriber already created project' })
        }

        // const subscriber: IAdmin = subscriberRes.data

        if (req.files !== null) {
            const file = req.files.file as UploadedFile
            const index = file['name'].lastIndexOf('.')
            const format = file['name'].substring(index, file['name'].length)
            const name = new Date().getTime().toString() + format
            // console.log('image name: ', name)
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
        delete data._id
        data.upvote = []

        let temp = data.name.toLowerCase()
        temp = temp.replaceAll(' ', '_')
        data.keyValue = temp
        data.whitelists = []

        const result = await projectService.createOne(data)

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

        // update discordName in subscriber
        const orginProject = await projectService.findOneByID(data._id)
        const subscriberResult = await adminService.findOne({ discordName: orginProject.subscriber })
        const subscriber: IAdmin = subscriberResult.data
        subscriber.discordName = data.discordName
        const subscriberUpdateResult = await adminService.updateOne(subscriber)
        if (subscriberUpdateResult.success === false) {
            return res.json({ success: false, message: 'Error' })
        }

        // update project
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

            const currentData: IProject = await projectService.findOneByID(data._id)
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

        let temp = data.name.toLowerCase()
        temp = temp.replaceAll(' ', '_')
        data['keyValue'] = temp

        const result = await projectService.updateOne(data)

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

        const currentData: IProject = await projectService.findOneByID(id)
        const image = currentData.image
        if (fs.existsSync(`${__dirname}/../build/${image}`)) {
            fs.unlink(`${__dirname}/../build/${image}`, (err) => {
                if (err) throw err
                console.log('Image file deleted')
            })
        }
        const result = await projectService.deleteOne(id)

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        return res.status(500).json(BACKEND_ERROR)
    }
}
// Admin Panel

const getDataByDiscordId = async (req: Request, res: Response) => {
    try {
        const { discordId } = req.body
        if (discordId === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const userResult = await adminService.findOne({ discordId: discordId })
        const discordName = userResult.data.discordName

        const result = await projectService.findByCondition({ subscriber: discordName })
        return res.json({ success: true, message: 'Success', data: result[0] })
    } catch (error) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getAll = async (req: Request, res: Response) => {
    try {
        const result = await projectService.findByCondition({ subscribeStatus: 1 })

        return res.json({ success: true, message: 'Success', data: result })
    } catch (err) {
        console.log(err)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const upvote = async (req: Request, res: Response) => {
    try {
        const { projectId, discordId } = req.body

        const project = await projectService.findOneByID(projectId)

        if (project.upvote.includes(discordId)) {
            const tempUpvote = project.upvote.filter((item: string) => {
                if (item !== discordId) {
                    return true
                } else {
                    return false
                }
            })
            project.upvote = tempUpvote
        } else {
            project.upvote.push(discordId)
        }

        const result = await projectService.updateOne(project)

        return res.json({ success: true, message: 'Success', data: result.upvote })
    } catch (err) {
        console.log(err)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getDataByKeyValue = async (req: Request, res: Response) => {
    try {
        const { keyValue } = req.query
        if (keyValue === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const result = await projectService.findByCondition({ keyValue: keyValue })
        return res.json({ success: true, message: 'Success', data: result })

    } catch (error) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getProjectName = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.query
        if (projectId === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const project: IProject = await projectService.findOneByID(projectId)
        if (project) {
            return res.json({ success: true, message: 'Success', data: project.name })
        } else {
            return res.json({ success: false, message: 'no exist' })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getProjectBySubscribeStatus = async (req: Request, res: Response) => {
    try {
        const { subscribeStatus, tokenType, accessToken, discordId } = req.query
        if (subscribeStatus === undefined || tokenType === undefined || accessToken === undefined || discordId === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        let resultProjects = []
        if (subscribeStatus === '0') { // all
            const allProjects = await projectService.findByCondition({ status: 0 })
            await Promise.all(allProjects.map(async (project: IProject) => {
                // const whitelistStatus: boolean = (project.serverId && project.whitelistRoleIDs) ? await checkUserHasRole(project.serverId, project.whitelistRoleIDs, tokenType as string, accessToken as string) : false
                // const whitelistStatus: boolean = (project.serverId && project.whitelistRoleIDs) ? await checkUserHasRole(project.serverId, discordId as string, project.whitelistRoleIDs) : false
                // let whitelistStatus: boolean = false
                const temp = { project }
                resultProjects.push(temp)
            }))
        } else if (subscribeStatus === '1') { // subscribed
            const allProjects = await projectService.findByCondition({ subscribeStatus: true, status: 0 })
            await Promise.all(allProjects.map(async (project: IProject) => {
                // const whitelistStatus: boolean = (project.serverId && project.whitelistRoleIDs) ? await checkUserHasRole(project.serverId, discordId as string, project.whitelistRoleIDs) : false
                // let whitelistStatus: boolean = false
                const temp = { project }
                resultProjects.push(temp)
            }))
        } else {
            const allProjects = await projectService.findByCondition({ status: 0 })

            const response = await axios.get(`https://discord.com/api/users/@me/guilds`, {
                headers: {
                    'Authorization': `${tokenType} ${accessToken}`
                }
            })
            console.log('guilds: ', response)
            const guildIds = response.data // Edit here

            allProjects.map((project: IProject) => {
                let flag: boolean = project.serverId ? checkIncludeMember(guildIds, project.serverId) : false
                if (flag) {
                    // let temp: any = project
                    // const whitelistStatus: boolean = (project.serverId && project.whitelistRoleIDs) ? await checkUserHasRole(project.serverId, discordId as string, project.whitelistRoleIDs) : false
                    // let whitelistStatus: boolean = false

                    const temp = { project }
                    resultProjects.push(temp)
                }
            })
        }

        return res.json({ success: true, message: 'Success', data: resultProjects })
    } catch (error) {
        console.log(error)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getCalendarData = async (req: Request, res: Response) => {
    try {
        const { discordId, tokenType, accessToken } = req.query
        if (discordId === undefined || tokenType === undefined || accessToken === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }
        let resultProjects = []
        const allProjects: IProject[] = await projectService.findAll()
        allProjects.map((project: IProject) => {
            // const whitelisted = await checkUserHasRole(project.severId, project.whitelistRoleIDs, tokenType as string, accessToken as string)
            // let whitelistStatus: boolean = false
            // project.whitelists.map((whitelist: any) => {
            //     if (whitelist.discordId === discordId) {
            //         whitelistStatus = true
            //     }
            // })
            if (project.mintDate) {
                resultProjects.push({
                    title: project.name,
                    start: project.mintDate,
                    mintPrice: project.mintPrice,
                    url: project.twitter,
                    // color: project.whitelistRoleIDs ? whitelisted ? '#00FF00' : '#FF0000' : '#FF0000'
                    color: project.whitelistActive ? '#00FF00' : '#FF0000'
                })
            }
        })

        return res.json({ success: true, message: 'Success', data: resultProjects })
    } catch (error) {
        console.log(error)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getDateItems = async (req: Request, res: Response) => {
    try {
        const { discordId, selectedDate, tokenType, accessToken } = req.query
        if (discordId === undefined || selectedDate === undefined || tokenType === undefined || accessToken === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }
        let resultProjects = []
        let allProjects: IProject[] = await projectService.findAll()

        const y1: number = new Date(selectedDate.toString()).getFullYear()
        const m1: number = new Date(selectedDate.toString()).getMonth()
        const d1: number = new Date(selectedDate.toString()).getDate()

        allProjects.map((project: IProject) => {
            const y2: number = new Date(project.mintDate).getFullYear()
            const m2: number = new Date(project.mintDate).getMonth()
            const d2: number = new Date(project.mintDate).getDate()

            if ((y1 === y2) && (m1 === m2) && (d1 === d2)) {
                // let whitelistStatus: boolean = checkIncludeMember()
                // project.whitelists.map((whitelist: any) => {
                //     if (whitelist.discordId === discordId) {
                //         whitelistStatus = true
                //     }
                // })
                resultProjects.push({
                    name: project.name,
                    image: project.image,
                    mintPrice: project.mintPrice,
                    totalSupply: project.totalSupply,
                    twitter: project.twitter,
                    discord: project.discord,
                    mintDate: project.mintDate,
                    // whitelistStatus: project.whitelistRoleIDs ? await checkUserHasRole(project.serverId, project.whitelistRoleIDs, tokenType as string, accessToken as string) : false
                    whitelistStatus: project.whitelistActive
                })
            }
        })

        return res.json({ success: true, message: 'Success', data: resultProjects })
    } catch (error) {
        console.log(error)
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
        // check that user is giving wl spots to this project
        const userResult = await adminService.findOne({ discordId: discordId })
        const discordName = userResult.data.discordName
        const resultProject: IProject = await projectService.findOneByCondition({ subscriber: discordName })
        const resultRaffles: IWlRaffle[] = await wlRaffleService.findByCondition({ hostedProjectId: resultProject._id })
        const tempResult: IWlRaffle[] = resultRaffles.filter((resultRaffle: IWlRaffle) => resultRaffle.hostedProjectId === projectId)
        if (tempResult.length === 0) {
            return res.json({ success: false, message: 'You have to give away whitelist spots to this project.' })
        }

        const originProject: IProject = await projectService.findOneByID(projectId)
        let whitelistStatus: boolean = false
        originProject.whitelists.map((whitelist: any) => {
            if (whitelist.discordId === discordId) {
                whitelistStatus = true
            }
        })
        if (whitelistStatus) {
            return res.json({ success: true, message: 'Already obtained role', data: true })
        }

        const checkBot: boolean = await checkDiscordBot(originProject.serverId, originProject.whitelistRoleIDs[0])
        if (checkBot === false) {
            return res.json({ success: false, message: 'Wrong bot' })
        }

        const isSuccess: boolean = await addMemberToRole(originProject.serverId, discordId, originProject.whitelistRoleIDs[0])
        if (!isSuccess) {
            return res.json({ success: false, message: 'Failed to get the role' })
        }

        originProject.whitelists.push({ discordId, roleId: originProject.whitelistRoleIDs[0] })
        await projectService.updateOne(originProject)

        return res.json({ success: true, message: 'Success', data: true })
    } catch (error) {
        console.log(error)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const checkDiscordBot = async (serverId: string, roleId: string) => {
    try {
        const isInvited = await checkServerID(serverId, BOT_ID)
        if (!isInvited) {
            console.log('You did not invite bot')
            return false
        }

        const hasRole = await checkServeHasRole(serverId, roleId)
        if (!hasRole) {
            console.log('Server has no role')
            return false
        }

        const hasPermission = await addMemberToRole(serverId, BOT_ID, roleId)
        if (!hasPermission) {
            console.log('Bot cannot give role')
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
    getDataByDiscordId,
    getDataByKeyValue,
    getAll,
    upvote,
    getProjectName,
    getProjectBySubscribeStatus,
    getCalendarData,
    getDateItems,
    claimRole
}