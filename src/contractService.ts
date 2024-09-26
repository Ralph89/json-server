import { getContract, http, createWalletClient, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getDefaultProvider, Contract, Wallet } from 'ethers' // ethers v5
import { TransactionResponse } from '@ethersproject/providers' // ethers v5
import { ImmutableERC721MintByIdAbi } from '@imtbl/contracts'
import * as dotenv from 'dotenv'
import { config as immutableConfig, blockchainData } from '@imtbl/sdk'
import { FindNextTokenId, NftMetadata, CreateMetadata } from './metadataService'
import { Response } from 'express';
dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY
if (!PRIVATE_KEY) {
  throw new Error('Missing environment variable: PRIVATE_KEY')
}

export async function DoesTokenExistOnChain(contractAddress: string, tokenId: number) : Promise<boolean>
{
  let exist = false;
  await fetch('https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/collections/'+contractAddress+'/nfts' + tokenId)
  .then((response) => 
    {
      exist = response.status === 200;
    }); 
    return exist;
}


export const listNFTs = async (accountAddress: string, collectionAddress: string) => {

  const config: blockchainData.BlockchainDataModuleConfiguration = {
    baseConfig: {
      environment: immutableConfig.Environment.SANDBOX,
    },
  }

  const client = new blockchainData.BlockchainData(config)

  try {
    const response = await client.listNFTsByAccountAddress({
      chainName: 'imtbl-zkevm-testnet',
      contractAddress: collectionAddress,
      accountAddress: accountAddress,
    })
    return response
  } catch (error) {
    console.error(error)
  }
}

export async function MintItem(to:string, nextTokenID: number, p_collectionAddress: string) : Promise<string>
{  
  const provider = getDefaultProvider('https://rpc.testnet.immutable.com')
  try {
    if (PRIVATE_KEY) {
      // Connect to wallet with minter role
      const signer = new Wallet(PRIVATE_KEY).connect(provider);
      // Specify the function to call
      const abi = ['function safeMint(address to, uint256 nextTokenID)'];
      // Connect contract to the signer
      const contract = new Contract(p_collectionAddress, abi, signer);
      // contract call to mint the nft
      const tx = await contract.safeMint(to, nextTokenID, gasOverrides);
      await tx.wait();

      //promise callback should go here
      return "succesfully minted nft with id: " + nextTokenID;
    } else {
      return "Failed to mint nft";
    }

  } catch (error) {
    return 'Failed to mint to user';
  }
}

const gasOverrides = {
  // Use parameter to set tip for EIP1559 transaction (gas fee)
  maxPriorityFeePerGas: 10e9, // 10 Gwei. This must exceed minimum gas fee expectation from the chain
  maxFeePerGas: 15e9, // 15 Gwei
};