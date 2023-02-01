import { SolanaClient } from "./solana"
import { CLUSTER_API, DISCORD_BOT_TOKEN } from "../config"
import axios from "axios"

export const getLeftTime = (end: string) => {
  const a = new Date().getTime()
  const b = new Date(end).getTime()
  const c = (b - a) / 1000
  const hours = Math.floor(c / 3600)
  const mins = Math.floor((c % 3600) / 60)
  const sec = Math.floor(c % 60)

  return `${hours}:${mins}:${sec}`
}

export const getStatus = (start: string, end: string) => {
  const currentTime = new Date().getTime()
  if (currentTime >= new Date(start).getTime() && currentTime < new Date(end).getTime()) {
    return 'Ongoing'
  } else if (currentTime > new Date(end).getTime()) {
    return 'Ended'
  } else {
    return 'NotStarted'
  }
}

export const getTimeStatus = (start: string, end: string) => {
  const currentTime = new Date().getTime()
  if (currentTime >= new Date(start).getTime() && currentTime < new Date(end).getTime()) {
    return 1
  } else if (currentTime > new Date(end).getTime()) {
    return 2
  } else {
    return 0
  }
}

export const randomItemFromArray = (myArray: string[]) => {
  return myArray[Math.floor(Math.random() * myArray.length)]
}

// calculate current total raffle entries
export const getCurrentEntries = (rafflers: any) => {
  let current = 0
  rafflers.map((value: any) => {
    current += value.entries
  })
  return current
}

// check twitter followed
export const checkTwitterFollowed = (rafflers: any, discordId: string) => {
  let isFollowed = false
  rafflers.map((raffler: any) => {
    if (raffler.discordId === discordId) {
      isFollowed = true
    }
  })

  return isFollowed
}

// check entered raffle
export const checkRaffleJoined = (rafflers: any, discordId: string) => {
  let isJoined = false
  rafflers.map((value: any) => {
    if (value.discordId === discordId && value.entries > 0) {
      isJoined = true
    }
  })
  return isJoined
}

// verify enter raffle
export const getOwnedNftsNumber = async (walletAddress: string, creators: string[]) => {
  try {
    if (creators) {
      const solanaClient = new SolanaClient({ rpcEndpoint: CLUSTER_API })
      const ownedNfts = await solanaClient.getAllCollectiblesWithCreator([walletAddress], creators)
      const fetchedNftNumber = ownedNfts[walletAddress].length

      return fetchedNftNumber
    } else {
      return 0
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

export const getWinner = (discordId: string, rafflers: any[]) => {
  let temp: any = { name: '', value: '' }
  rafflers.map((raffler: any) => {
    if (raffler.discordId === discordId) {
      temp.name = `@${raffler.discordName}-${raffler.walletAddress}` as string
      temp.value = ''
    }
  })
  return temp
}

export const getWinnerName = (discordId: string, rafflers: any[]) => {
  let temp: string
  rafflers.map((raffler: any) => {
    if (raffler.discordId === discordId) {
      temp = raffler.discordName
      return
    }
  })
  return temp
}

export const getWinnerWallet = (discordId: string, rafflers: any[]) => {
  let temp: string
  rafflers.map((raffler: any) => {
    if (raffler.discordId === discordId) {
      temp = raffler.walletAddress
      return
    }
  })
  return temp
}

export const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array
}

export const checkIsObtainedRole = (roles: any[], discordId: string) => {
  if (roles.length === 0) {
    let isObtained: boolean = false
    isObtained = roles.includes(discordId)
    return isObtained
  } else {
    return false
  }
}

export const addMemberToRole = async (guildId: string, userId: string, roleId: string) => {
  try {
    const res = await axios(`http://discord.com/api/v9/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      }
    })
    if (res.status == 204) { return true }
    else { return false }
  }
  catch (error) {
    console.log("server-error", error)
    return false;
  }
}
// export const addMemberToRole = async (guildId: string, userId: string, roleId: string) => {
//   try {
//     const res = await axios.get(`http://discord.com/api/v9/guilds/${guildId}/members/${userId}/roles/${roleId}`)
//     if (res.status == 204) { return true }
//     else { return false }
//   }
//   catch (error) {
//     console.log("server-error", error)
//     return false;
//   }
// }

export const checkServeHasRole = async (guildId: string, roleId: string) => {
  try {
    const result = await axios(`http://discord.com/api/v9/guilds/${guildId}/roles`, {
      method: "GET",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      }
    })
    const whitelistRole = result.data.filter((role: any) => role.id === roleId)
    if (whitelistRole.length === 1) { return true }
    else { return false }

  } catch (error) {
    return false
  }
}

export const checkServerID = async (guildId: string, botId: string) => {
  try {
    const result = await axios(`http://discord.com/api/v9/guilds/${guildId}/members/${botId}`, {
      method: "GET",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      }
    })
    if (result.data !== null) { return true }
    else { return false }
  } catch (error) {
    return false
  }
}

export const checkIncludeMember = (guilds: any[], serverId: string) => {
  try {
    let temp = false
    guilds.map((guild) => {
      if (guild.id === serverId) {
        return temp = true
      }
    })

    return temp
  } catch (error) {
    return false
  }
}


export const checkUserHasRole = async (guildId: string, userId: string, roleIds: string[]) => {
  try {
    const member: any = await axios.get(`http://discord.com/api/v9/guilds/${guildId}/members/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      }
    })
    if (member) {
      let status = false
      member.data.roles.map((memberRole: any) => {
        roleIds.map((role: string) => {
          if (role === memberRole) {
            return status = true
          }
        })
      })

      return status
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export const checkUserHasRoleOpp = async (guildId: string, userId: string, roleId: string) => {
  try {
    const member: any = await axios.get(`http://discord.com/api/v9/guilds/${guildId}/members/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      }
    })
    if (member) {
      let status = false
      member.data.roles.map((memberRole: any) => {
        if (memberRole === roleId) {
          return status = true
        }
      })

      return status
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

// export const checkUserHasRole = async (guildId: string, roleIDs: string[], tokenType: string, accessToken: string) => {
//   try {
//     await axios.get(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
//       headers: {
//         'Authorization': `${tokenType} ${accessToken}`,
//       },
//     }).then((res: any) => {
//       const result = res.data
//       console.log('user res: ', result)
//       if (result) {
//         let temp: boolean = false
//         result.roles.map((role: string) => {
//           roleIDs.map((roleId: string) => {
//             if (role === roleId) {
//               temp === true
//               return temp
//             }
//           })
//         })
//         return temp
//       } else {
//         return false
//       }
//     })

//   } catch (error) {
//     console.log(error)
//     return false
//   }
// }