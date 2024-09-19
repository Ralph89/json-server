import express, {
    Express,
    Router,
    Request,
    Response,
  } from 'express';
import * as fs from 'fs';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import {providers, Wallet, Contract } from 'ethers';
dotenv.config(); //env file

const app: Express = express();
//app.use(morgan('dev')); // Logging
app.use(cors());
app.use(express.urlencoded({ extended: false }))// parse application/x-www-form-urlencoded
app.use(express.json())// parse application/json
const router: Router = express.Router();

const privateKey = process.env.PRIVATE_KEY;
const zkEvmProvider = new providers.JsonRpcBatchProvider('https://rpc.testnet.immutable.com');

const gasOverrides = {
  // Use parameter to set tip for EIP1559 transaction (gas fee)
  maxPriorityFeePerGas: 10e9, // 10 Gwei. This must exceed minimum gas fee expectation from the chain
  maxFeePerGas: 15e9, // 15 Gwei
};
//router
router.post('/mint/NFT', (req: Request, res: Response) => {
    MintItem(req.body.to, req.body.name, req.body.image, req.body.attributes, req.body.collectionAddress, res);
  },
);


router.get( 
  '/item/:id',
  async (req: Request, res: Response) => {
    //need to get the file
    fs.readFile('metadata/' + req.params.id+".json", 'utf8', function (err, data) {
      if (err) return;
      res.writeHead(200);
      res.end(data);
    });
  });

  app.use('/', router);

  http.createServer(app).listen(
    3000,
    () => { console.log('Listening on port 3000')},
  );


class NftMetadata
  { 
    id: number;
    name: string;
    image: string;
    attributes: string;
    public constructor(p_id: number, p_name: string, p_image:string, p_attributes:string)
    {
      this.id = p_id;
      this.name = p_name + " " + p_id;
      this.image = p_image;
      this.attributes = p_attributes;
    }
  }

//Minting the item on the blockchain
//we need to make this function a promise so the game actually knows something has been minted or if we encountered an error
async function MintItem(to:string, p_name: string, p_imageUri: string, p_attributes: string, p_collectionAddress: string, res: Response) : Promise<Response>
{  
  //calculating the next token id we need to mint
  let nextTokenID = await FindNextTokenId(p_collectionAddress);
  //creating the metadata
  let metadata = new NftMetadata(nextTokenID, p_name, p_imageUri, p_attributes);
  //storing the metadata on the server
  CreateMetadata(metadata);
  
  try {
    if (privateKey) {
      // Connect to wallet with minter role
      const signer = new Wallet(privateKey).connect(zkEvmProvider);
      // Specify the function to call
      const abi = ['function safeMint(address to, uint256 nextTokenID)'];
      // Connect contract to the signer
      const contract = new Contract(p_collectionAddress, abi, signer);
      // contract call to mint the nft
      const tx = await contract.safeMint(to, nextTokenID, gasOverrides);
      await tx.wait();
      //promise callback should go here
      console.log("succes");
      return res.status(200).json({});
    } else {

      //promise callback should go here
      console.log("failed");
      RemoveMetaData(metadata, p_collectionAddress);
      return res.status(500).json({});
    }

  } catch (error) {
    //check if we have the metadata created ifso remove it....
    console.log(error);
    RemoveMetaData(metadata, p_collectionAddress);
    //promise callback should go here
    return res.status(400).json({ message: 'Failed to mint to user' });
  }
}


function RemoveMetaData(metaData: NftMetadata, collectionAddress: string)
{
  //find the metadata and remove it with fs
  //we should check if something with that id exist before removing it
  if (!DoesTokenExistOnChain(collectionAddress, metaData.id))
    fs.unlink('metadata/' + metaData.id + '.json', (err) => {
  });
}

function mint1155()
{
  //below is the actual contract code to mint an erc1155 nft
  /*
      // Connect to wallet with minter role
      const signer = new Wallet(privateKey).connect(zkEvmProvider);
      // Specify the function to call
      const abi = ['function safeMint(address to, uint256 nextTokenID, uint256 amount, bytes memory data)'];
      // Connect contract to the signer
      const contract = new Contract("0xe690da5e67df083fe198d2af0d17aad420ac1973", abi, signer);
      // Mints the number of tokens specified contract.mintByQuantity(to, 1, gasOverrides);
      const tx = await contract.safeMint(to, nextTokenID, 1, [], gasOverrides);
  */
}

function MintWithMintingAPI()
{
  //we should look into this, I think this would remove the need of having our private key in the env file
}

function CreateMetadata(metaData: NftMetadata)
{
  console.log("CreateMetadata");
  fs.writeFile('metadata/' + metaData.id + '.json', JSON.stringify(metaData),  function(err) {
    if (err) {
        return console.error(err);
    }
    console.log("File created!");
  });
}


async function DoesTokenExistOnChain(contractAddress: string, tokenId: number) : Promise<boolean>
{
  let exist = false;
  await fetch('https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/collections/'+contractAddress+'/nfts' + tokenId)
  .then((response) => 
    {
      console.log(response.status)
      exist = response.status === 200;
    }); 
    return exist;
}

//Finds the next mintable token id.
async function FindNextTokenId(contractAddress: string) : Promise<number>
{
   let lastTokenId = 0;
   let result = "";
   //calling the web api with our collection contractAddress
   await fetch('https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/collections/'+contractAddress+'/nfts')
    .then((response) => response.text())
    .then((body) => {
      result = body;
  });
  const obj = JSON.parse(result);

  lastTokenId = await GetNextCollectionPage(contractAddress, obj);
  console.log(lastTokenId);
  return lastTokenId + 1;
}


async function GetNextCollectionPage(contractAddress: string, body: any) : Promise<number>
{
  let allMetadata = body.result;
  //while (body.page.next_cursor !== null){
  //  await fetch('https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/collections/'+contractAddress+'/nfts?page_cursor='+ body.page.next_cursor);
  //}
  if (allMetadata.length > 0)
  {
    allMetadata.sort((n1: { token_id: number; },n2: { token_id: number; }) => n2.token_id - n1.token_id );
    return parseInt(allMetadata[0].token_id);
  }
  else return 0;
}

async function TestTokenID()
{
  console.log(await FindNextTokenId("0x1e4701c49c690206f5139eeab3a698a93ff31e64"));
}