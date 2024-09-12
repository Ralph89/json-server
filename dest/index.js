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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const foxImageUrl = 'https://rose-ministerial-termite-701.mypinata.cloud/ipfs/Qmd3oT99HypRHaPfiY6JWokxADR5TzR1stgonFy1rMZAUy';
const skinImageUrl = 'https://rose-ministerial-termite-701.mypinata.cloud/ipfs/QmNZeG8wkW3mFw4PrqEj34NPA88impcvemYjhAkJAM4YcK';
var bodyParser = require('body-parser');
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
const router = express_1.default.Router();
router.post("/createmetadata/:id", async (req, res) => {
    let nftID = req.params.id;
    const json = {
        id: nftID,
        name: req.body.name,
        image: req.body.image,
        attributes: req.body.attributes
    };
    fs.writeFile('metadata/' + nftID + '.json', JSON.stringify(json), function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("File created!");
    });
});
router.get('/item/:id', async (req, res) => {
    //need to get the file
    await fs.readFile('metadata/' + req.params.id + ".json", 'utf8', function (err, data) {
        if (err)
            return;
        res.writeHead(200);
        res.end(JSON.stringify(data));
    });
});
app.use('/', router);
http_1.default.createServer(app).listen(3000, () => console.log('Listening on port 3000'));
