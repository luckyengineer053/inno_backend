import axios from 'axios'
import crypto from 'crypto'
const OAuth = require('oauth-1.0a')
import qs from 'querystring'
import { CONSUMER_KEY, CONSUMER_SECRET, TWITTER_BEARER_TOKEN } from '../../config'

// The code below sets the consumer key and consumer secret from your environment variables
// To set environment variables on macOS or Linux, run the export commands below from the terminal:

// const consumer_key = process.env.CONSUMER_KEY
// const consumer_secret = process.env.CONSUMER_SECRET
// const consumer_key = 'iDstsciPU9Bh6LPybGcNDxdAM'
// const consumer_secret = '902xOLKsOr9HEsfJE6zDGmleV0ugSzxdjkmdHSXstDPhLaRp9u'

// Be sure to add replace the text of the with the text you wish to Tweet.
// You can also add parameters to post polls, quote Tweets, Tweet with reply settings, and Tweet to Super Followers in addition to other features.

const endpointURL = `https://api.twitter.com/2/tweets`

// this example uses PIN-based OAuth to authorize the user
const requestTokenURL = "https://api.twitter.com/oauth/request_token?oauth_callback=oob&x_auth_access_type=write"
const authorizeURL = new URL("https://api.twitter.com/oauth/authorize")
const accessTokenURL = "https://api.twitter.com/oauth/access_token"
const oauth = OAuth({
    consumer: {
        key: CONSUMER_KEY,
        secret: CONSUMER_SECRET
    },
    signature_method: "HMAC-SHA1",
    hash_function: (baseString, key) => crypto.createHmac("sha1", key).update(baseString).digest("base64")
})

export async function requestToken() {
    const authHeader = oauth.toHeader(
        oauth.authorize({
            url: requestTokenURL,
            method: "POST"
        })
    )

    const req = await axios.post(requestTokenURL, {}, {
        headers: {
            Authorization: authHeader["Authorization"]
        }
    })
    if (req.data) {
        return qs.parse(req.data)
    } else {
        throw new Error("Cannot get an OAuth request token")
    }
}

export async function accessToken({ oauth_token, oauth_token_secret }, verifier) {
    const authHeader = oauth.toHeader(
        oauth.authorize({
            url: accessTokenURL,
            method: "POST"
        })
    )
    const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`
    const req = await axios.post(path, {}, {
        headers: {
            Authorization: authHeader["Authorization"]
        }
    })
    if (req.data) {
        return qs.parse(req.data)
    } else {
        throw new Error("Cannot get an OAuth request token")
    }
}

export async function getAccessToken(oauth_token: string, oauth_verifier: string) {
    const authHeader = oauth.toHeader(
        oauth.authorize({
            url: accessTokenURL,
            method: "POST"
        })
    )
    const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${oauth_verifier}&oauth_token=${oauth_token}`
    const req = await axios.post(path, {}, {
        headers: {
            Authorization: authHeader["Authorization"]
        }
    })
    if (req.data) {
        return qs.parse(req.data)
    } else {
        throw new Error("Cannot get an OAuth request token")
    }
}

export async function getFollowers(source_name: string, target_name: string) {
    const authHeader = oauth.toHeader(
        oauth.authorize({
            url: accessTokenURL,
            method: "POST"
        })
    )
    // const path = `https://api.twitter.com/1.1/friendships/show.json?source_screen_name=isos_nft&target_screen_name=emmie_ken`
    const path = `https://api.twitter.com/1.1/friendships/show.json?source_screen_name=${source_name}&target_screen_name=${target_name}`
    const req = await axios.get(path, {
        headers: {
            // Authorization: "Bearer AAAAAAAAAAAAAAAAAAAAAOlpfwEAAAAA2Wh5h7lbfHu0LHa%2B6U3SgYhY7HY%3DCI2MjmKnHuddzl18XyG9snj0MxhQzj2NI8vkuw9sQc1c2caiuJ"
            Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`
        }
    })
    if (req.data) {
        return req.data
    } else {
        throw new Error("Cannot get an OAuth request token")
    }
}

export async function getRequest({ oauth_token, oauth_token_secret }) {
    const token = {
        key: oauth_token,
        secret: oauth_token_secret
    }

    const authHeader = oauth.toHeader(
        oauth.authorize(
            {
                url: endpointURL,
                method: "POST"
            },
            token
        )
    )
    const data = {
        text: "Testing",
    };

    const req = await axios.post(endpointURL, data, {
        headers: {
            Authorization: authHeader["Authorization"],
            "user-agent": "v2CreateTweetJS",
            "content-type": "application/json",
            accept: "application/json"
        }
    })
    if (req.data) {
        return req.data
    } else {
        throw new Error("Unsuccessful request")
    }
}

