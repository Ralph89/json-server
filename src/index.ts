import express, {
    Express,
    Router,
    Request,
    Response,
  } from 'express';
import { config, x } from '@imtbl/sdk';
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
  console.log("asd");
    MintItem(req.body.to, req.body.name, req.body.image, req.body.attributes);
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
    () => console.log('Listening on port 3000'),
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

async function MintItem(to:string, p_name: string, p_imageUri: string, p_attributes: string)//, p_collectionAddress: string
{  
  let nextTokenID = await FindNextTokenId('0xe690da5e67df083fe198d2af0d17aad420ac1973');
  console.log("nextTokenID" + nextTokenID);
  let metadata = new NftMetadata(nextTokenID, p_name, p_imageUri, p_attributes);
  CreateMetadata(metadata);
  /*
  try {
    
    if (privateKey) {
      // Get the address to mint to
      //let to: string = req.body.to ?? null;
      // Get the quantity to mint if specified, default is one
      

      // Connect to wallet with minter role
      const signer = new Wallet(privateKey).connect(zkEvmProvider);

      // Specify the function to call
      const abi = ['function safeMint(address to, uint256 nextTokenID)'];
      // Connect contract to the signer
      const contract = new Contract("0xe690da5e67df083fe198d2af0d17aad420ac1973", abi, signer);

      // Mints the number of tokens specified contract.mintByQuantity(to, 1, gasOverrides);
      const tx = await contract.safeMint(to, nextTokenID, gasOverrides);
      await tx.wait();
      console.log("succes");
      //return res.status(200).json({});
    } else {
      console.log("failed");
      //return res.status(500).json({});
    }

  } catch (error) {
    //check if we have the metadata created ifso remove it....
    console.log(error);
    //return res.status(400).json({ message: 'Failed to mint to user' });
  }*/
}


function mint1155()
{
  /*
  try {
    
    if (privateKey) {
      // Get the address to mint to
      //let to: string = req.body.to ?? null;
      // Get the quantity to mint if specified, default is one
      

      // Connect to wallet with minter role
      const signer = new Wallet(privateKey).connect(zkEvmProvider);

      // Specify the function to call
      const abi = ['function safeMint(address to, uint256 nextTokenID, uint256 amount, bytes memory data)'];
      // Connect contract to the signer
      const contract = new Contract("0xe690da5e67df083fe198d2af0d17aad420ac1973", abi, signer);

      // Mints the number of tokens specified contract.mintByQuantity(to, 1, gasOverrides);
      const tx = await contract.safeMint(to, nextTokenID, 1, [], gasOverrides);
      await tx.wait();
      console.log("succes");
      //return res.status(200).json({});
    } else {
      console.log("failed");
      //return res.status(500).json({});
    }

  } catch (error) {
    //check if we have the metadata created ifso remove it....
    console.log(error);
    //return res.status(400).json({ message: 'Failed to mint to user' });
  }*/
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

async function FindNextTokenId(contractAddress: string) : Promise<number>
{
   let lastTokenId = 0;
    await fetch('https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/collections/'+contractAddress+'/nfts')
    .then((response) => response.text())
    .then((body) => {
      const obj = JSON.parse(body);
      //do we have a next page?
      let nextPage = obj.page.next_cursor !== null;
      if (nextPage === true)
      {
        //we need to get the next page
      }
      else{
        //the next up minting id is going to be the last item + 1
        const lastItem = obj.result[obj.result.length -1];
        console.log(lastItem);
        lastTokenId = parseInt(lastItem.token_id);
      }
    }); 
    console.log("done total");
    return lastTokenId + 1;
};
