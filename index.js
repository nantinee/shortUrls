const express = require("express")
var { initializeApp } = require("firebase/app")
var { getDatabase, ref, set, onValue, child, get } = require("firebase/database")

const firebaseConfig = {
    databaseURL: "https://short-url-829b6-default-rtdb.firebaseio.com"
};
const db = initializeApp(firebaseConfig);
const database = getDatabase(db);
const app = express();
const db_api = getDatabase()


app.use(express.static("public"));
app.use(express.json());

app.get('/', async (req, res) => {
    response.sendFile(__dirname + "/public/index.html");
})

app.get('/shortUrls', async (req, res) => {
    const linkTable = ref(database, 'links/');
    await onValue(linkTable, (snapshot) => {
        const data = snapshot.val()
        res.status(200).json({
            status: "ok",
            data: data
        });
    })

})
app.post('/shortUrls', async (req, res) => {
    let uniqueID = Math.random().toString(36).replace(/[^a-z0-9]/gi, '').substring(2, 10);
    
    if (req.body.fullUrl.length == 0) {
        res.status(404).json({
            message: "Enter valid url"
        });
    } else if (!(req.body.fullUrl.startsWith("http://") || req.body.fullUrl.startsWith("https://"))) {
        res.status(500).json({
            message: "Enter valid url"
        });
    }else{
        get(child(ref(db_api), `links/`)).then((snapshot) => {
            if (snapshot.exists()) {
                const data = Object.values(snapshot.val())
                const result = data.findIndex((data) => data.full == req.body.fullUrl)
                if (result == -1) {
                    // Create
                    set(ref(db_api, 'links/' + uniqueID), {
                        full: req.body.fullUrl,
                        short: uniqueID,
                        count: 0
                    }).then((result) => {
                        result != undefined ? res.status(500).json({
                            message: "Something went wrong"
                        }) : res.status(200).json({
                            status: "ok",
                            short: uniqueID
                        });
                    })
                }else{
                    res.status(200).json({
                        status: "ok",
                        short: data[result].short
                    });
                }
            } else {
                res.status(500).json({
                    status: error.status,
                    message: "Something went wrong"
                })
            }
        }).catch((error) => {
            res.status(500).json({
                status: error.status,
                message: "Something went wrong"
            })
        });
    }
   
})
app.get("/:shortUrls",async (req, res) =>{
	let shorturlid = req.params.shortUrls;
    
    get(child(ref(db_api), `links/`)).then((snapshot) => {
        if (snapshot.exists()) {
            const data = Object.values(snapshot.val())
            const result = data.findIndex((data) => data.short == shorturlid)
            res.redirect(data[result].full);
            
        }else{
            res.status(404).json({
                message:"Not found URL"
            });
        }
	})
});

app.listen(5555)