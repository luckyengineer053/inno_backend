import { Request, Response } from 'express'
import nftService from '../services/nft'

import { BAD_REQUEST, BACKEND_ERROR } from '../config'

const getData = async (req: Request, res: Response) => {
    try {
        const params = req.body.params

        if (params === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const result = await nftService.findByFilter(params)

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const addEvent = async (req: Request, res: Response) => {
    try {
        const { data } = req.body

        if (data === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        delete data._id

        const result = await nftService.createOne(data)

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

        const result = await nftService.updateOne(data)
        delete data.id
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

        const result = await nftService.deleteOne(id)

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

export default {
    getData,
    addEvent,
    updateEvent,
    deleteEvent,
}