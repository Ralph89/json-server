import * as fs from 'fs';
import {Response} from 'express';
import { DoesTokenExistOnChain } from './contractService';

export class NftMetadata
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

export async function ReadMetadata(id:number) : Promise<string>
{
    try {
      const data = await fs.promises.readFile('metadata/' + id +".json", 'utf8');
      return data;
    }
    catch { return "No data found"; }
}

//creates the metadata and stores it locally on the server
//implement the database here or use a s3 bucket as the immutable example: 
//https://github.com/ricdikulous/imx-unity-game-lessons/blob/main/lessons/06-Creating-an-S3-Bucket-for-NFT-Metadata/README.md
export function CreateMetadata(metaData: NftMetadata)
{
  fs.writeFile('metadata/' + metaData.id + '.json', JSON.stringify(metaData),  function(err) {
    if (err) {
        return console.error(err);
    }
  });
}

export function RemoveMetaData(metaData: NftMetadata, collectionAddress: string)
{
  //find the metadata and remove it with fs
  //we should check if something with that id exist before removing it
  if (!DoesTokenExistOnChain(collectionAddress, metaData.id))
    fs.unlink('metadata/' + metaData.id + '.json', (err) => {
  });
}

//this goes through the collection to find the next token id, when the collection get's big it will get expensive I think
//In the stateManager we also are keeping track of the lastMintedToken on the server better to move forward using that
export async function FindNextTokenId(contractAddress: string) : Promise<number>
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
  return lastTokenId + 1;
}

//loops through all the item and pages in the collection (200 results are returned max per page)
//is deprecated if the FindNextTokenId is replaced with the stateManager as Immutable uses in their example
//still good to keep the code as backup
async function GetNextCollectionPage(contractAddress: string, body: any) : Promise<number>
{
  let allMetadata = body.result;
  while (body.page.next_cursor !== null){
    await fetch('https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/collections/'+contractAddress+'/nfts?page_cursor='+ body.page.next_cursor)
    .then((response) => response.text())
    .then((newBody) => {
      const obj = JSON.parse(newBody);
      allMetadata.push(obj.result);
      body = obj;
  });
  }
  if (allMetadata.length > 0)
  {
    allMetadata.sort((n1: { token_id: number; },n2: { token_id: number; }) => n2.token_id - n1.token_id );
    return parseInt(allMetadata[0].token_id);
  }
  else return 0;
}
