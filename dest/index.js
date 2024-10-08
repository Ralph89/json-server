"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const ethers_1 = require("ethers");
dotenv_1.default.config(); //env file
const app = (0, express_1.default)();
//app.use(morgan('dev')); // Logging
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express_1.default.json()); // parse application/json
const router = express_1.default.Router();
const privateKey = process.env.PRIVATE_KEY;
const zkEvmProvider = new ethers_1.providers.JsonRpcBatchProvider('https://rpc.testnet.immutable.com');
const gasOverrides = {
    // Use parameter to set tip for EIP1559 transaction (gas fee)
    maxPriorityFeePerGas: 10e9, // 10 Gwei. This must exceed minimum gas fee expectation from the chain
    maxFeePerGas: 15e9, // 15 Gwei
};
//router
router.post('/mint/NFT', (req, res) => {
    console.log("asd");
    MintItem(req.body.to, req.body.name, req.body.image, req.body.attributes);
});
router.get('/item/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //need to get the file
    fs.readFile('metadata/' + req.params.id + ".json", 'utf8', function (err, data) {
        if (err)
            return;
        res.writeHead(200);
        res.end(data);
    });
}));
app.use('/', router);
http_1.default.createServer(app).listen(3000, () => console.log('Listening on port 3000'));
class NftMetadata {
    constructor(p_id, p_name, p_image, p_attributes) {
        this.id = p_id;
        this.name = p_name + " " + p_id;
        this.image = p_image;
        this.attributes = p_attributes;
    }
}
function MintItem(to, p_name, p_imageUri, p_attributes) {
    return __awaiter(this, void 0, void 0, function* () {
        let nextTokenID = yield FindNextTokenId('0xe690da5e67df083fe198d2af0d17aad420ac1973');
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
    });
}
function mint1155() {
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
function CreateMetadata(metaData) {
    console.log("CreateMetadata");
    fs.writeFile('metadata/' + metaData.id + '.json', JSON.stringify(metaData), function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("File created!");
    });
}
function FindNextTokenId(contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let lastTokenId = 0;
        yield fetch('https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/collections/' + contractAddress + '/nfts')
            .then((response) => response.text())
            .then((body) => {
            const obj = JSON.parse(body);
            //do we have a next page?
            let nextPage = obj.page.next_cursor !== null;
            if (nextPage === true) {
                //we need to get the next page
            }
            else {
                //the next up minting id is going to be the last item + 1
                const lastItem = obj.result[obj.result.length - 1];
                console.log(lastItem);
                lastTokenId = parseInt(lastItem.token_id);
            }
        });
        console.log("done total");
        return lastTokenId + 1;
    });
}
;
