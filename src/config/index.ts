
import dotenv from 'dotenv'
dotenv.config()

export const MONGO_HOST = process.env.MONGO_HOST
export const jwtConfig = {
    secret: 'dd5f3089-40c3-403d-af14-d0c228b05cb4',
    refreshTokenSecret: '7c4c1c50-3230-45bf-9eae-c9b2e401c767',
    expireTime: '30m',
    refreshTokenExpireTime: '30m'
}

export const BAD_REQUEST = { success: false, message: 'Bad Request', data: null }
export const BACKEND_ERROR = { success: false, message: 'Backend Server Error!', data: null }

export const CLUSTER_API = process.env.CLUSTER_API || 'https://api.metaplex.solana.com'

export const CONSUMER_KEY = process.env.CONSUMER_KEY
export const CONSUMER_SECRET = process.env.CONSUMER_SECRET
export const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN

export const INVITE_BOT_URL = process.env.INVITE_BOT_URL || ''

export const BOT_ID = process.env.BOT_ID || ''
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || ''

export const BACKEND_URL = process.env.BACKEND_URL || ''

export const OPP_WEBHOOK_URL = process.env.OPP_WEBHOOK_URL || ''
export const RAFFLE_WEBHOOK_URL = process.env.RAFFLE_WEBHOOK_URL || ''

export const NFT_TICKET_ADDRESS = ''
export const HUNT_TOKEN_ADDRESS = ''
export const HUNT_TOKEN_RECEIVER_ADDRESS = ''
