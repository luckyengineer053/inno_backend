import axios from 'axios';

export const getDiscordAccountInfo = async (tokenType, accessToken) => {
    const result = await axios.get("https://discord.com/api/users/@me", {
        headers: {
            'Authorization': `${tokenType} ${accessToken}`
        }
    })
    return result
}

