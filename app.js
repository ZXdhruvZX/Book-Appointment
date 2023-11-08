var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongodb = require('mongodb').MongoClient; // Added .MongoClient
var dbConn; // Define dbConn variable

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, 'public')));

// Connect to MongoDB
mongodb.connect('mongodb://127.0.0.1:27017', { useUnifiedTopology: true }) // Added options
    .then((client) => {
        dbConn = client.db('first'); // Replace 'your-database-name' with your actual database name
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });

app.post('/post-feedback', function (req, res) {
    if (!dbConn) {
        res.status(500).send("Database connection not established.");
        return;
    }

    delete req.body._id; // for safety reasons
    dbConn.collection('feedbacks').insertOne(req.body)
        .then(() => {
            res.send('Data received:\n' + JSON.stringify(req.body));
        })
        .catch((error) => {
            console.error("Error inserting data to MongoDB:", error);
            res.status(500).send('An error occurred while saving the data.');
        });
});


app.get('/view-feedbacks',  function(req, res) {
    dbConn.then(function(db) {
        db.collection('feedbacks').find({}).toArray().then(function(feedbacks) {
            res.status(200).json(feedbacks);
        });
    });
});

app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', () => {
    console.log('Server is running on port 3000');
});
