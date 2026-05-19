const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()

const uri = process.env.MONGODB_URI

const app = express()
app.use(cors())
app.use(express.json())
const PORT = process.env.PORT

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db("Arenaslot")
    const facilitiesCollection = db.collection("facilities")

    app.get('/facilities',async (req,res) => {
        const result = await facilitiesCollection.find().toArray()
        res.json(result)

    })

    app.post('/facilities',async (req,res) => {
        const facilitiesData = req.body
        console.log(facilitiesData)
        const result = await facilitiesCollection.insertOne(facilitiesData)

        res.json(result)
    })

    app.get('/facilities/:id',async (req,res) => {
        const {id} = req.params
        const result = await facilitiesCollection.findOne({_id : new ObjectId(id)})
        res.json(result)

    })
    




    await client.db("admin").command({ ping: 1 });
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

//Mongo Pass --  zxFuaDTkiNeRKFCt