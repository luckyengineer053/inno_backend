import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/daoVoting'

router.post('/', ctrl.getData)
router.get('/getOneData', ctrl.getOneData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)
router.get('/getAll', ctrl.getAllData)
router.post('/vote', ctrl.vote)
router.get('/getDataByProjectId', ctrl.getDataByProjectId)
router.post('/getDataByDiscordName', ctrl.getDataByDiscordName)
router.post('/addEventByUser', ctrl.addEventByUser)

export default router