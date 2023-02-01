import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/wlRaffle'

router.post('/', ctrl.getData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)
// router.post('/complete-event', ctrl.completeEvent)
router.post('/getDataByStatus', ctrl.getDataByStatus) // frontend
router.post('/enterRaffle', ctrl.enterRaffle) // frontend
// router.post('/verifyTwitter', ctrl.verifyTwitter) // frontend
router.post('/decideWinners', ctrl.decideWinners) // frontend, subscriber, admin
router.post('/getDataByDiscordName', ctrl.getDataByDiscordName) // subscriber
router.post('/claimRole', ctrl.claimRole)
router.post('/validateDiscordBot', ctrl.validateDiscordBot)

export default router