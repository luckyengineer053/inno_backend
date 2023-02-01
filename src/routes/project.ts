import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/project'

router.post('/', ctrl.getData)
router.get('/getOneData', ctrl.getOneData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)
router.post('/getDataByDiscordId', ctrl.getDataByDiscordId)
router.get('/getAllData', ctrl.getAll)
router.post('/upvote', ctrl.upvote)
router.get('/getDataByKeyValue', ctrl.getDataByKeyValue)
router.get('/getProjectName', ctrl.getProjectName)
router.get('/getProjectBySubscribeStatus', ctrl.getProjectBySubscribeStatus)
router.get('/getCalendarData', ctrl.getCalendarData)
router.get('/getDateItems', ctrl.getDateItems)
router.post('/claimRole', ctrl.claimRole)

export default router