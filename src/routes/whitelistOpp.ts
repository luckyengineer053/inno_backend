import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/wlRaffle'

router.post('/', ctrl.getData)
router.get('/getOneData', ctrl.getOneData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)

export default router