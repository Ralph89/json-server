import express from 'express'
import { ethers } from 'ethers'
import { readState, writeState } from '../stateManager'
import { listNFTs, MintItem } from '../contractService'
import * as fs from 'fs';
import { CreateMetadata, NftMetadata, ReadMetadata } from '../metadataService';
/**
 * @swagger
 * tags:
 *   name: Mints
 *   description: API operations related to minting NFTs
 */

const router = express.Router()

router.post('/mint', async (req, res) => {
  const recipientAddress  = req.body.to;
  const collectionAddress = req.body.collectionAddress;
  if (
    typeof recipientAddress !== 'string' ||
    !ethers.utils.isAddress(recipientAddress)
  ) {
    return res.status(400).json({
      error: `${recipientAddress} is not a valid "recipientAddress".`,
    })
  }

  try {
    const initialState = readState()
    const tokenId = initialState.latestTokenID;
    const metaData = new NftMetadata(tokenId, req.body.name, req.body.image, req.body.attributes);
    let mintResult = "";
    await Promise.all([
      await CreateMetadata(metaData),
      mintResult = await MintItem(recipientAddress, tokenId, collectionAddress),
    ]);

    const updatedState = { ...initialState, latestTokenID: tokenId + 1 }
    writeState(updatedState)
    if (mintResult.includes("Failed"))
      res.status(404).json(mintResult);
    else
      res.status(200).json(mintResult)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error.' })
  }
})

router.get('/item/:id', async (req, res) => {
    //need to get the file
    const data = await ReadMetadata(parseInt(req.params.id));
    res.writeHead(200);
    res.end(data);
    console.log("get id " + data);
  });


router.get('/nfts/:accountAddress/:collectionAddress', async (req, res) => {
  const accountAddress  = req.params.accountAddress;
  const collectionAddress  = req.params.collectionAddress;

  if (!ethers.utils.isAddress(accountAddress)) {
    return res.status(400).json({ error: 'Invalid Ethereum account address' })
  }

  const nfts = await listNFTs(accountAddress, collectionAddress)
  res.status(200).json(nfts?.result)
})

export default router
