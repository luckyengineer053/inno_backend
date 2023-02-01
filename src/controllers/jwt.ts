import { Request, Response } from 'express'
import adminService from '../services/admin';

import { BAD_REQUEST, BACKEND_ERROR } from '../config'

import jwt from 'jsonwebtoken';
import { jwtConfig } from "../config";

const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (username === undefined || password === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    let error = {
      username: ['Something went wrong']
    }

    const defaultAdmin = await adminService.findOne({ username: 'admin' })
    if (defaultAdmin.data === null) {
      await adminService.createOne({
        username: "admin",
        password: "admin",
        avatar: "",
        role: 'admin', // admin
        discordId: '01010101',
        discordName: 'Admin#0101'
      })
    }

    const user = await adminService.findOne({ username: username, password: password })
    if (user.data !== null) {
      const admin = user.data.toJSON()
      try {
        const accessToken = jwt.sign({ id: admin._id }, jwtConfig.secret, { expiresIn: jwtConfig.expireTime })
        const refreshToken = jwt.sign({ id: admin._id }, jwtConfig.refreshTokenSecret, {
          expiresIn: jwtConfig.refreshTokenExpireTime
        })

        const userData = { ...admin }

        delete userData.password

        const response = {
          userData,
          accessToken,
          refreshToken
        }

        return res.json(response)
      } catch (e) {
        error = e
      }
    } else {
      error = {
        username: ['Username or Password is Invalid']
      }
    }

    return res.status(400).json({ success: false, message: error, data: null })
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Backend Server Failed!', data: null })
  }
}

const changeAccount = async (req: Request, res: Response) => {
  const { userData } = req.body

  if (userData === undefined) {
    return res.json({ success: false, data: null, message: 'Paramater is required!' })
  }

  const user = await adminService.findOne({ _id: userData._id })

  if (user.data === null) {
    return res.json(user);
  }

  if (userData.cPassword !== '') {
    if (userData.nPassword !== userData.mPassword) {
      return res.json({ success: false, data: null, message: 'New passwords do not match!' })
    }

    if (userData.cPassword !== user.data.password) {
      return res.json({ success: false, data: null, message: 'Current Password is not correct!' })
    }
    user.data.password = userData.nPassword
  }

  user.data.fullName = userData.fullName
  user.data.username = userData.username
  user.data.username = userData.username
  user.data.save()

  return res.json({ success: true, data: null, message: 'Account successfully changed.' })
}

// const register = async (req: Request, res: Response) => {
//   if (!!req.body.username) {
//     const { username, password, username } = req.body
//     const isusernameAlreadyInUse = data.users.find(user => user.username === username)
//     const isUsernameAlreadyInUse = data.users.find(user => user.username === username)
//     const error = {
//       username: isusernameAlreadyInUse ? 'This username is already in use.' : null,
//       username: isUsernameAlreadyInUse ? 'This username is already in use.' : null
//     }

//     if (!error.username && !error.username) {
//       const userData = {
//         username,
//         password,
//         username,
//         fullName: '',
//         avatar: null,
//         role: 'admin',
//         ability: [
//           {
//             action: 'manage',
//             subject: 'all'
//           }
//         ]
//       }

//       // Add user id
//       const length = data.users.length
//       let lastIndex = 0
//       if (length) {
//         lastIndex = data.users[length - 1].id
//       }
//       userData.id = lastIndex + 1

//       data.users.push(userData)

//       const accessToken = jwt.sign({ id: userData.id }, jwtConfig.secret, { expiresIn: jwtConfig.expireTime })

//       const user = Object.assign({}, userData)
//       delete user['password']
//       const response = { user, accessToken }

//       return res.json(response)
//     } else {
//       return res.json(error)
//     }
//   }
// }

// const refreshToken = async (req: Request, res: Response) => {
//   const { refreshToken } = req.body

//   try {
//     const { id } = jwt.verify(refreshToken, jwtConfig.refreshTokenSecret)

//     const userData = { ...data.users.find(user => user.id === id) }

//     const newAccessToken = jwt.sign({ id: userData.id }, jwtConfig.secret, { expiresIn: jwtConfig.expireTime })
//     const newRefreshToken = jwt.sign({ id: userData.id }, jwtConfig.refreshTokenSecret, {
//       expiresIn: jwtConfig.refreshTokenExpireTime
//     })

//     delete userData.password
//     const response = {
//       userData,
//       accessToken: newAccessToken,
//       refreshToken: newRefreshToken
//     }

//     return res.json(response)
//   } catch (e) {
//     const error = 'Invalid refresh token'
//     return res.status(401).json(error)
//   }
// }


export default {
  login,
  // register,
  // refreshToken,
  changeAccount
}