var express = require("express")
var { graphqlHTTP } = require("express-graphql")
var { buildSchema } = require("graphql")
const bodyParser = require("body-parser")
const path = require('path');
const requestIp = require('request-ip')

var clients = {};
process.env.NODE_ENV = 'production';

// Construct a schema, using GraphQL schema language
const middleware_rate_limit = (req,res,next) => {
  if(req.originalUrl === "/graphql")
  {
    var query = "";
    try{
      req.body.map(function(item){query += item['query'].toString();})
    }catch(err)
    {
      query = req.body.query
    }
    if(query.includes("increaseClickSchool"))
    {
      if(!clients.hasOwnProperty(req.socket.remoteAddress))
      {
        clients[req.socket.remoteAddress] = -1
      }
        if(parseInt((Date.now() - clients[req.socket.remoteAddress])/1000) > 60 )
        {
          clients[req.socket.remoteAddress] = Date.now();
          next()
        }
        else
        {
          res.status(429).json({"code":429,"error":"You're going too fast !"})
        }
    }
    else
    {
      next();
    }
  }
  else
  {
    next();
  }
}

var schema = buildSchema(`
  type School {
    schoolId: Int!
    schoolName: String
    nbClick: Int!
  } 

  type Query {
    getNbClickSchool(schoolName: String): School
  }

  type Mutation {
    increaseClickSchool(schoolName: String): School
  }
`)

var schoolData = [
    {
        schoolId: 1,
        schoolName: "Cyber Super School",
        nbClick: 158
    },
    {
        schoolId: 2,
        schoolName: "University Of Cybersecurity",
        nbClick: 199
    },
    {
        schoolId: 3,
        schoolName: "Flag CyberSecurity School",
        nbClick: 0
    },
    {
        schoolId: 4,
        schoolName: "The Best Best CyberSecurity School",
        nbClick: 1337
    }
]

var increaseClickSchool = function({schoolName}) {
    schoolData.map(school => {
        if(school.schoolName == schoolName) {
            school.nbClick += 1
        }
    })
    return schoolData.filter(school => school.schoolName === schoolName)[0];
}

var getNbClickSchool = function({schoolName}) {
    let school = [];
    for(var i=0; i<schoolData.length; i++)
    {
        if(schoolData[i].schoolName == schoolName)
        {
            school = schoolData[i];       
        }
    }
    return school;
}

// The root provides a resolver function for each API endpoint
var root = {
  getNbClickSchool: getNbClickSchool,
  increaseClickSchool: increaseClickSchool
}

var app = express()
app.use(bodyParser())

app.use(middleware_rate_limit)

const runGraphql = graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: false,
})

app.use(
  "/graphql", async (req, res, next) => {

    if(req.body instanceof Array) {
      res.origSend = res.send
      const origReqBody = req.body
      const responseBodies = []
      for(let graphqlQuery of origReqBody) {
        await new Promise(resolve => {
          res.send = body => {
            responseBodies.push(body)
            resolve()
          }
          req.body = graphqlQuery
          runGraphql(req, res, next)
        })
      }
      res.origSend(`[${responseBodies.join(',')}]`)
      return
    }
  
    runGraphql(req, res, next)  
})

app.use('/static', express.static('public'))

app.get("/", (req,res) => {
  if(!clients.hasOwnProperty(req.socket.remoteAddress))
  {
    clients[req.socket.remoteAddress] = -1
  }
  res.sendFile(path.join(__dirname, 'html/index.html'))
})

app.get("/flag", (req,res) => {
  if(schoolData[2].nbClick >= 1337)
  {
    res.status(200).json({"data":"Hero{gr4phql_b4tch1ng_t0_byp4ss_r4t3_l1m1t_!!}"})
  }
  else
  {
    res.status(200).json({"data":"'Flag CyberSecurity School' is not the best, no flag for you"})
  }
})

app.listen(3000)
console.log("API listen on port 3000")