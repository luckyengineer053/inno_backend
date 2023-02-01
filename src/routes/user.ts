import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/users'

router.post('/', ctrl.getData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)
router.get('/getUser', ctrl.getUser)
router.post('/buyTicket', ctrl.buyTicket)

export default router