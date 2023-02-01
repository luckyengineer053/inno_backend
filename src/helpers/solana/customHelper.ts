import {
  resolveToWalletAddress,
  getParsedNftAccountsByOwner,
  isValidSolanaAddress
} from "@nfteyez/sol-rayz";

// import { clusterApiUrl } from "@solana/web3.js";
// import { createConnectionConfig } from "@nfteyez/sol-rayz";

// const connect = createConnectionConfig(clusterApiUrl("devnet"))

import { Connection } from "@solana/web3.js"
import { CLUSTER_API } from '../../config'
const connection = new Connection(CLUSTER_API, 'confirmed')

export const getNftNumber = async (walletAddress: string, creators: string[]) => {
  const isValidAddress: boolean = isValidSolanaAddress(walletAddress)
  console.log('is solana? ', isValidAddress)
  // if (isValidAddress) {
  const myAddress = '8JvZKrTxrjLNNXxQnLWPUgAMaWUgFNVh6jwcRN5zZnJp'
  try {
    console.log(creators)
    console.log(walletAddress)
    const publicAddress = await resolveToWalletAddress({
      text: myAddress
    });

    const nftArray = await getParsedNftAccountsByOwner({
      publicAddress: publicAddress,
      connection: connection
    });

    console.log('exam nft: ', nftArray[0])

    console.log('total array: ', nftArray.length)
    let nftNumber = 0

    for (let i = 0; i < nftArray.length; i++) {
      let flag = false
      creators.map((creator: string) => {
        if (creator === nftArray[i].data.creators[0].address) {
          console.log('matched')
          flag = true
        }
      })
      if (flag) {
        nftNumber += 1
      }
    }

    // const newNfts = nftArray.filter((nft) => {
    //   creators.length === 0 || creators.map
    // })
    console.log('nftNumber: ', nftNumber)
    // return nftArray.length
    return nftNumber

  } catch (error) {
    console.log("Error thrown, while fetching NFTs", error.message);
    return 0
  }

  // }
}