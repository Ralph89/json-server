import express, {
  Express,
  Router,
  Request,
  Response,
} from 'express';

import * as fs from 'fs';
import cors from 'cors';
import http from 'http';


const foxImageUrl = 'https://rose-ministerial-termite-701.mypinata.cloud/ipfs/Qmd3oT99HypRHaPfiY6JWokxADR5TzR1stgonFy1rMZAUy';
const skinImageUrl = 'https://rose-ministerial-termite-701.mypinata.cloud/ipfs/QmNZeG8wkW3mFw4PrqEj34NPA88impcvemYjhAkJAM4YcK';

var bodyParser = require('body-parser')
const app: Express = express();


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))// parse application/x-www-form-urlencoded
app.use(bodyParser.json())// parse application/json
const router: Router = express.Router();



router.post("/createmetadata/:id",
  async (req: Request, res: Response) => {
    let nftID = req.params.id
    const json = {
      id: nftID,
      name: req.body.name,
      image: req.body.image,
      attributes: req.body.attributes
    };

    fs.writeFile('metadata/' + nftID + '.json', JSON.stringify(json),  function(err) {
      if (err) {
          return console.error(err);
      }
      console.log("File created!");
  });
});


router.get( 
  '/item/:id',
  async (req: Request, res: Response) => {
    //need to get the file
  
    await fs.readFile('metadata/' + req.params.id+".json", 'utf8', function (err, data) {
      if (err) return;
      res.writeHead(200);
      res.end(JSON.stringify(data));
    });
  });


app.use('/', router);

http.createServer(app).listen(
  3000,
  () => console.log('Listening on port 3000'),
);