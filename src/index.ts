import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion, type MongoClientOptions } from "mongodb";
import * as jose from "jose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const uri: string | undefined = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in the environment");
}

const JWKS = jose.createRemoteJWKSet(
  new URL("http://projects-two-gules.vercel.app/api/auth/jwks"),
);

const clientOptions: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

const client = new MongoClient(uri, clientOptions);

declare module "express-serve-static-core" {
  interface Request {
    user?: jose.JWTPayload;
  }
}

// Middleware to verify JWT token authenticity
const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized: missing or invalid token" });
      return;
    }

    const token = authHeader.slice("Bearer ".length);
    const { payload } = await jose.jwtVerify(token, JWKS);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: token verification failed" });
  }
};

async function run(){
  try{
    const storeDB = await client.db('aesthete');

    app.get('/api/admin/customer', async (req, res) => {
      const customer = await storeDB.collection('user').find({
        role: 'user'
      }).toArray()
      res.send(customer)
    })

    app.post('/api/user/addCart',verifyToken,async(req,res) => {
       console.log(req.body)
       console.log(typeof(req.body.quantity))
       const msg =await storeDB.collection('cart').updateOne(
        {
          productId:req.body.productId,
          userEmail :req.body.userEmail,
        },{
          $inc:{
            quantity:req.body.quantity,
          },
          $set:{
            name:req.body.name,
            price: req.body.price,
            
            img: req.body.img,
            
          }
        },{
          upsert:true,
        }
       )
       res.send({})
    })

    app.get('/api/user/cart/:email',verifyToken,async( req ,res) => {
      const data = await storeDB.collection('cart').find({
        userEmail:req.params.email
      }).toArray();
      res.send(data)
    })

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}
app.get('/',(req,res)=>{
  res.send({
    msg:'run'
  })
})

run();