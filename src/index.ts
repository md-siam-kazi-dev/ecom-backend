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

const jwksUrl = process.env.NEXT_PUBLIC_URL
  ? `${process.env.NEXT_PUBLIC_URL.replace(/\/$/, "")}/api/auth/jwks`
  : 'http://projects-two-gules.vercel.app/api/auth/jwks';

const JWKS = jwksUrl
  ? jose.createRemoteJWKSet(new URL(jwksUrl), {
      cooldownDuration: 30000,
      timeoutDuration: 5000,
    })
  : null;

const clientOptions: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

const client = new MongoClient(uri, clientOptions);

// Cache database connections across serverless invocations
let cachedDb: any = null;

async function getDatabase() {
  if (cachedDb) return cachedDb;
  
  // MongoClient automatically handles internal connection pooling
  await client.connect();
  cachedDb = client.db('aesthete');
  return cachedDb;
}

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

    if (!JWKS) {
      res.status(500).json({ message: "Auth is not configured (NEXT_PUBLIC_URL missing)" });
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

// --- TOP-LEVEL SYNCHRONOUS ROUTE REGISTRATIONS ---

app.get('/', (req, res) => {
  res.send({ msg: 'run' });
});

app.get('/api/admin/customer', async (req, res) => {
  try {
    const storeDB = await getDatabase();
    const customer = await storeDB.collection('user').find({ role: 'user' }).toArray();
    res.send(customer);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch customers" });
  }
});

app.post('/api/user/addCart', verifyToken, async (req, res) => {
  try {
    console.log(req.body);
    console.log(typeof req.body.quantity);
    
    const storeDB = await getDatabase();
    await storeDB.collection('cart').updateOne(
      {
        productId: req.body.productId,
        userEmail: req.body.userEmail,
      },
      {
        $inc: { quantity: req.body.quantity },
        $set: {
          name: req.body.name,
          price: req.body.price,
          img: req.body.img,
        }
      },
      { upsert: true }
    );
    res.send({});
  } catch (error) {
    res.status(500).send({ error: "Failed to update cart" });
  }
});

app.get('/api/user/cart/:email', verifyToken, async (req, res) => {
  try {
    const storeDB = await getDatabase();
    const data = await storeDB.collection('cart').find({
      userEmail: req.params.email
    }).toArray();
    res.send(data);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch cart data" });
  }
});

// --- CONDITIONAL LOCAL RUNNER ---
// Only runs the persistent listener if you run this locally, avoiding Vercel blocking.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Local server running on port ${PORT}`);
  });
}

// CRITICAL FOR VERCEL: Export the application instance
export default app;