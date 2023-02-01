import { Router, Request, Response } from 'express';

const router = Router()

import jwtRoutes from './jwt'
import settingRoutes from './setting'
import nftRoutes from './nft'
import projectRoutes from './project'
import wlRaffleRoutes from './wlRaffle'
import subscriberRoutes from './subscriber'
import daoVoting from './daoVoting'
import userRoutes from './user'
import rafflesRoutes from './raffles'
import applicationsRoutes from './applications'

// Backend Test
// router.get('/test', (req: Request, res: Response) =>
//   res.send('OK')
// )

router.use('/jwt', jwtRoutes);
router.use('/setting', settingRoutes);
router.use('/nft', nftRoutes);
router.use('/project', projectRoutes);
router.use('/wlRaffle', wlRaffleRoutes);
router.use('/user', subscriberRoutes);
router.use('/daoVoting', daoVoting);
router.use('/follower', userRoutes)
router.use('/raffles', rafflesRoutes)
router.use('/applications', applicationsRoutes)

export default router;