const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);


const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
dotenv.config()

const uri = process.env.MONGODB_URI

const app = express()
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "authorization"]
}));
app.use(express.json())
const PORT = process.env.PORT

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

async function run() {
  try {
    // await client.connect();

    const db = client.db("Arenaslot")
    const facilitiesCollection = db.collection("facilities")
    const bookingCollection = db.collection('bookings')

//     app.get("/facilities", async (req, res) => {
//   const result = await facilitiesCollection.find().toArray();
//   res.json(result);
// });


  // BACKEND API
// localhost:8080/facilities

app.get("/facilities",async (req, res) => {
  try {
    const { ownerEmail, search, type } = req.query;

    const query = {};

    // ✅ FILTER BY OWNER EMAIL (your real field)
    if (ownerEmail) {
      query.ownerEmail = ownerEmail;
    }

    // ✅ SEARCH BY NAME
    if (search) {
      query.facilityName = {
        $regex: search,
        $options: "i",
      };
    }

    // ✅ FILTER BY TYPE
    if (type) {
      query.facilityType = {
        $in: type.split(",").map((t) => t.trim()),
      };
    }

    const result = await facilitiesCollection.find(query).toArray();

    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to fetch facilities" });
  }
});

 app.get('/facilities/:id',verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await facilitiesCollection.findOne({
    _id: new ObjectId(id)
  });

  res.json(result);
});
    app.post('/bookings',async(req,res) => {
      const bookingdata = req.body
      const result = await bookingCollection.insertOne(bookingdata)
       res.json(result)
    })
    
app.post("/facilities", async (req, res) => {
  try {
    const facility = req.body;

    // basic validation (optional but recommended)
    if (!facility.ownerEmail || !facility.facilityName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await facilitiesCollection.insertOne(facility);

    res.status(201).json({
      insertedId: result.insertedId,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create facility" });
  }
});

    app.get('/bookings/:userId', async(req,res) => {
      const {userId} = req.params
      const result = await bookingCollection.find({userId:userId}).toArray()
      res.json(result)
    })

     app.delete("/booking/:bookingId", async (req, res) => {
      const { bookingId } = req.params;
      const result = await bookingCollection.deleteOne({
        _id: new ObjectId(bookingId),
      });

      res.json(result);
    });
    

     app.patch('/facilities/:id',async (req,res) => {
        const {id} = req.params
        const updateData = req.body
        const result = await facilitiesCollection.updateOne({_id : new ObjectId(id)
        },
        {$set:updateData}
      )
        res.json(result)

    })

    app.delete('/facilities/:id',async (req,res) => {
        const {id} = req.params
        const result = await facilitiesCollection.deleteOne({_id : new ObjectId(id)
        }
      )
        res.json(result)

    })
    

    // app.get('/facilities/:userEmail',async(req,res) => {
    //   const {userEmail} = req.params
    //   const result = await bookingCollection.find({userName:userEmail}).toArray()
    //   res.json(result)
    // })


    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res) =>{
    res.send("Server is running")
})

app.listen(PORT, () =>{
    console.log(`Server running on PORT ${PORT}`)
})