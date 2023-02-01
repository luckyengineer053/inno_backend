import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/raffles'

router.post('/', ctrl.getData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)
router.post('/getDataByStatus', ctrl.getDataByStatus)
router.post('/enterRaffle', ctrl.enterRaffle)
router.get('/getMyRaffles', ctrl.getMyRaffles)

export default router