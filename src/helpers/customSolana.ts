import { Connection, GetProgramAccountsFilter, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { CLUSTER_API } from "../config";
const rpcEndpoint = CLUSTER_API;
const solanaConnection = new Connection(rpcEndpoint);

const walletToQuery = '8JvZKrTxrjLNNXxQnLWPUgAMaWUgFNVh6jwcRN5zZnJp'; //example: vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg

export async function getTokenAccounts() {
  try {
    const wallet = walletToQuery
    const filters: GetProgramAccountsFilter[] = [
      {
        dataSize: 165,    //size of account (bytes)
      },
      {
        memcmp: {
          offset: 32,     //location of our query in the account (bytes)
          bytes: wallet,  //our search criteria, a base58 encoded string
        },
      }];
    const temp = await solanaConnection.getParsedTokenAccountsByOwner(
      new PublicKey(wallet), {
      programId: TOKEN_PROGRAM_ID
    }
    )
    console.log('length: ', temp.value.length)
    temp.value.map((item) => {
      console.log(item.account.data.parsed.info)
    })
    // const accounts = await solanaConnection.getParsedProgramAccounts(
    //   TOKEN_PROGRAM_ID, //new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    //   { filters: filters }
    // );
    // console.log('accounts: ', accounts)
    // console.log(`Found ${accounts.length} token account(s) for wallet ${wallet}.`);
    // accounts.forEach((account, i) => {
    //   //Parse the account data
    //   const parsedAccountInfo: any = account.account.data;
    //   // const mintAddress: string = parsedAccountInfo["parsed"]["info"]["mint"];
    //   // const tokenBalance: number = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
    //   // //Log results
    //   // console.log(`Token Account No. ${i + 1}: ${account.pubkey.toString()}`);
    //   // console.log(`--Token Mint: ${mintAddress}`);
    //   // console.log(`--Token Balance: ${tokenBalance}`);
    //   console.log('account data: ', parsedAccountInfo)
    // });
  } catch (error) {
    console.log(error)
  }

}
// getTokenAccounts(walletToQuery, solanaConnection);