const { json } = require('express');
const express = require('express');
const app = express();
let session = require('express-session');
let crypto = require('crypto');
let fs = require('fs');
let bp = bodyParser = require('body-parser');
let cors = require('cors')
let session_secret = crypto.randomBytes(32).toString('hex');
app.use(session({
    secret: session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));
app.use(bp.json()); //app use json
app.use(cors({
    origin:"*",
    credentials: true
}))
const port = 3000;

//function used to sanitize user inputs
function sanitize(dirty)
{
    return dirty.replaceAll("..","")
}

// Get Endpoints
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({"code":200,"data":"This is a simple API to store your file. No GUI no bullshit. See /endpoints to list available endpoints."});
})

app.get('/endpoints', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({"code":200,"data":[
        {
            "route":"/",
            "method":"GET",
            "params":{},
            "description":"Entry point for api"
        },
        {
            "route":"/endpoints",
            "method":"GET",
            "params":{},
            "description":"List all accessible endpoints"
        },
        {
            "route":"/login",
            "method":"POST",
            "params":{"username":"username of user","password":"password of user"},
            "description":"Endpoint to login"
        },
        {
            "route":"/upload",
            "method":"POST",
            "params":{"file":"content of the file base64 encoded","filename":"name of the file","folder":"*OPTIONAL* Subfolder where to upload the file"},
            "description":"Endpoint to upload file"
        },
        {
            "route":"/file/:workspace/:file",
            "method":"GET",
            "params":{"file":"name of the file to retrieve"},
            "description":"Endpoint to recover a file"
        },
        {
            "route":"/:workspace/new",
            "method":"POST",
            "params":{"folder":"name of the new folder"},
            "description":"Endpoint to create a new folder in your workspace"
        }
    ]});
})

app.get("/file/:workspace/:file", (req, res) => {
    if(req.session.username) //user is authent
    {
        if(req.params.workspace === req.session.workspace)
        {
            if(req.params.file.length > 0)
            {
                try
                {
                    let sanitized_filename = sanitize(req.params.file)
                    let data = fs.readFileSync(`data/${req.session.workspace}/${sanitized_filename}`);
                    return res.status(200).json({"code":200,"data":data.toString()});
                }
                catch(err)
                {
                    res.status(404).json({"code":404,"data":"File not found"});
                }
            }
            else
            {
                res.status(400).json({"code":400,"data":"Missing file parameter"});
            }
        }
        else
        {
            res.status(403).json({"code":403,"data":"You can't access file that didn't belong to you"});
        }
    }
    else
    {
        res.status(401).json({"code":401,"data":"Authentification required"});
    }
})

app.get("/file/:workspace/:subfolder/:file", (req, res) => {
    if(req.session.username) //user is authent
    {
        if(req.params.workspace === req.session.workspace)
        {
            if(req.params.file.length > 0 && req.params.subfolder.length > 0)
            {
                try
                {
                    let sanitized_filename = sanitize(req.params.file)
                    let sanitized_folder = sanitize(req.params.subfolder)
                    let data = fs.readFileSync(`data/${req.session.workspace}/${sanitized_folder}/${sanitized_filename}`);
                    return res.status(200).json({"code":200,"data":data.toString()});
                }
                catch(err)
                {
                    res.status(404).json({"code":404,"data":"File not found"});
                }
            }
            else
            {
                res.status(400).json({"code":400,"data":"Missing file or subfolder parameter"});
            }
        }
        else
        {
            res.status(403).json({"code":403,"data":"You can't access file that didn't belong to you"});
        }
    }
    else
    {
        res.status(401).json({"code":401,"data":"Authentification required"});
    }
})

//Post endpoints
app.post('/login', (req, res) => {
    let data_from_user = req.body;
    if(data_from_user["username"] !== undefined)
    {
        try
        {
            let rand_folder = crypto.randomBytes(8).toString('hex');
            fs.mkdirSync(`data/${rand_folder}`,()=>{});
            req.session.username = data_from_user["username"];
            req.session.workspace = rand_folder;
            res.status(200).json({"code":200,"data":`User connected ! You can upload your file now to your workspace : ${rand_folder}`})
        }
        catch(err)
        {
            res.status(500).json({"code":500,"data":"Unexcepted error, please try again"})
        }
    }
    return "a";
})

app.post('/upload', (req, res) => {
    if(req.session.username)
    {
        var data_from_user = req.body;
        if(data_from_user["file"] && data_from_user["filename"])
        {
            if(data_from_user["file"].length <= 1000)
            {
                if(data_from_user["filename"].length <= 30)
                {
                    let path = `data/${req.session.workspace}/`;
                    if(data_from_user["folder"] && data_from_user["folder"].length <= 30)
                    {
                        path += sanitize(data_from_user["folder"]);
                    }
                    path += "/"+sanitize(data_from_user["filename"]);
                    try
                    {
                        let file_content = Buffer.from(data_from_user["file"], "base64").toString()
                        fs.writeFileSync(path, file_content, ()=>{})
                        res.status(200).json({"code":200,"data":`Your file has been uploaded to ${path.replace("data","")}`})
                    }
                    catch(err)
                    {
                        res.status(500).json({"code":500,"data":"Error while uploading your file, please try again"})
                    }
                }
                else
                {
                    res.status(400).json({"code":400,"data":"Filename is too long"})
                }
            }
            else
            {
                res.status(400).json({"code":400,"data":"File is too big"})
            }
        }
        else
        {
            res.status(400).json({"code":400,"data":"Missing parameter(s)"})
        }
    }
    else
    {
        res.status(401).json({"code":401,"data":"Authentification required"});
    }
})

app.post("/:workspace/new", (req, res) => {
    if(req.session.username)
    {
        if(req.session.workspace === req.params.workspace)
        {
            let data_from_user = req.body;
            if(data_from_user["folder"] && data_from_user["folder"].length <= 30)
            {
                try
                {
                    let sanitized_folder = sanitize(data_from_user["folder"])
                    fs.mkdirSync(`data/${req.session.workspace}/${sanitized_folder}/`, ()=>{})
                    res.status(200).json({"code":200,"data":`Subfolder ${sanitized_folder} has been created !`})
                }
                catch(err)
                {
                    res.status(500).json({"code":500,"data":"An error occured while creating subfolder, please try again"})
                }
            }
            else
            {
                res.status(400).json({"code":400,"data":"Missing folder parameter or folder name is too long"})
            }
        }
        else
        {
            res.status(403).json({"code":403,"data":"You can't modify workspace that didn't belong to you"});
        }
    }
    else
    {
        res.status(401).json({"code":401,"data":"Authentification required"});
    }
})

app.listen(port, '0.0.0.0')