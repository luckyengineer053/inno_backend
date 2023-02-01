import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/subscriber'

router.post('/', ctrl.getData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)
router.post('/getOverview', ctrl.getOverview)
router.post('/getAdminOverview', ctrl.getAdminOverview)
router.post('/updatePassword', ctrl.updatePassword)
router.post('/updateImage', ctrl.updateImage)

export default router