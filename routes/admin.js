
/**
 * Created by auffr on 06/11/2016.
 */
var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var moment = require('moment');




router.get('/addScore', function(req,res) {
    // Mysql connection
    var con = mysql.createConnection({
        host: process.env.FCS2_DBHOST,
        user: process.env.FCS2_USER,
        password: process.env.FCS2_DBPASS,
        database: process.env.FCS2_DB
    });

    var songs;
    var players;

    con.query("SELECT PlayerID, Name FROM user", [], function(err,rows) {
        if (err) throw err;


        players = rows;
        con.query("SELECT SongID, Name FROM songs WHERE SongID < 11", [], function(err,rows) {
            if (err) throw err;

            songs = rows;

            res.render('add_score',{
                players: players,
                songs: songs
            });
        });
    });
});

router.post('/addScore', function(req,res) {

    // Mysql connection
    var con = mysql.createConnection({
        host: process.env.FCS2_DBHOST,
        user: process.env.FCS2_USER,
        password: process.env.FCS2_DBPASS,
        database: process.env.FCS2_DB
    });

    con.connect(function (err) {
        if(err){
            console.log('Error connecting to DB');
            return;
        }
        console.log('Connected to DB');
    });

    req.body.IDSong = parseInt(req.body.IDSong);
    req.body.IDDifficulty = parseInt(req.body.IDDifficulty);
    req.body.IDPlayer = parseInt(req.body.IDPlayer);

    var FCSPoints = FCSPointsCalc(req.body.IDSong, req.body.IDDifficulty, req.body.Score);

    var score_high_histo = { PlayerID : req.body.IDPlayer,
                        SongID : req.body.IDSong,
                        DifficultyID: req.body.IDDifficulty,
                        Score: req.body.Score,
                        scoredOn: moment().format('YYYY-MM-DD HH:mm:ss'),
                        FCSPoints : FCSPoints };

    console.log(score_high_histo);

    var insertedID = 0;

    con.query('INSERT INTO score_high_histo SET ? ', score_high_histo , function(err,res){
        if(err) throw err;

        console.log('Last insert ID:', res.insertId);
        insertedID = res.insertId;
        });

    con.query("SELECT SHID, FCSPoints FROM scores_high " +
        "INNER JOIN score_high_histo on score_high_histo.ScoreID = scores_high.ScoreID " +
        "WHERE scores_high.PlayerID = ? AND scores_high.SongID = ?", [req.body.IDPlayer, req.body.IDSong], function(err,res){
        if(err) throw err;

        if (res.length == 0)
        {
            for (var i = 1; i <= 10; i++)
            {
                var newRecord = { PlayerID : req.body.IDPlayer, SongID: i, ScoreID: 1}; // Null score hardcoded in base
                con.query("INSERT INTO scores_high SET ? ", newRecord, function(err,res){
                    if(err) throw err;
                });
            }

            console.log("Created score histo for player");

            con.query("UPDATE scores_high SET ScoreID = ? " +
                "WHERE PlayerID = ? AND SongID  = ? ", [insertedID, req.body.IDPlayer, req.body.IDSong], function(err,res){
                if(err) throw err;

                console.log("New record !");
            });
        }
        else {
            data = res[0];
            if(data.FCSPoints < FCSPoints)
            {
                con.query("UPDATE scores_high SET ScoreID = ? " +
                          "WHERE PlayerID = ? AND SongID  = ? ", [insertedID, req.body.IDPlayer, req.body.IDSong], function(err,res){
                    if(err) throw err;

                    console.log("New record update !");
                });
            }
        }
    });

    res.redirect('/admin/addScore');

});

/!* Used to calculate FCS Points *!/
var FCSPointsCalc = function(songID, difficultyID, score) {

    var difficultyFactor = 0, bpm = 0;

    switch (difficultyID)
    {
        case 1:
            difficultyFactor = 0.4;
            break;
        case 2:
            difficultyFactor = 0.5;
            break;
        case 3:
            difficultyFactor = 0.65;
            break;
        case 4:
            difficultyFactor = 0.8;
            break;
        case 5:
            difficultyFactor = 1.0;
            break;
        default:
            console.log("Wrong difficulty ID");
            break;
    }

    switch (songID)
    {
        case 1:
            bpm = 150;
            break;
        case 2:
            bpm = 160;
            break;
        case 3:
            bpm = 170;
            break;
        case 4:
            bpm = 174;
            break;
        case 5:
            bpm = 180;
            break;
        case 6:
            bpm = 190;
            break;
        case 7:
            bpm = 195;
            break;
        case 8:
            bpm = 200;
            break;
        case 9:
            bpm = 210;
            break;
        case 10:
            bpm = 220;
            break;
        default :
            console.log("Wrong SongID");
            break;
    }

    var FCSPoints = (difficultyFactor * (1000 / 110) * ((parseFloat(score) + parseFloat((bpm - 100) / 5)))).toFixed(2);

    return FCSPoints;
}

module.exports = router;

router.get('/addScoreLow', function(req,res) {
    // Mysql connection
    var con = mysql.createConnection({
        host: process.env.FCS2_DBHOST,
        user: process.env.FCS2_USER,
        password: process.env.FCS2_DBPASS,
        database: process.env.FCS2_DB
    });

    var songs;
    var players;

    con.query("SELECT PlayerID, Name FROM user", [], function(err,rows) {
        if (err) throw err;


        players = rows;
        con.query("SELECT SongID, Name FROM songs WHERE SongID > 10 AND SongID < 41", [], function(err,rows) {
            if (err) throw err;

            songs = rows;

            res.render('add_score_low',{
                players: players,
                songs: songs
            });
        });
    });
});

router.post(('/addScoreLow'), function(req,res) {

    // Mysql connection
    var con = mysql.createConnection({
        host: process.env.FCS2_DBHOST,
        user: process.env.FCS2_USER,
        password: process.env.FCS2_DBPASS,
        database: process.env.FCS2_DB
    });

    con.connect(function (err) {
        if(err){
            console.log('Error connecting to DB');
            return;
        }
        console.log('Connected to DB');
    });

    req.body.IDPlayer = parseInt(req.body.IDPlayer);
    req.body.IDSong = parseInt(req.body.IDSong);

    var FCSLowPoints = FCSLowPointsCalc(req.body.Fantastics, req.body.Excellents, req.body.Greats);

    var score_low_optional_histo = { PlayerID : req.body.IDPlayer,
        SongID : req.body.IDSong,
        Fantastics: req.body.Fantastics,
        Excellents: req.body.Excellents,
        Greats: req.body.Greats,
        scoredOn: moment().format('YYYY-MM-DD HH:mm:ss'),
        DifficultyID: 5,
        FCSPoints : FCSLowPoints };

    var insertedID = 0;

    con.query('INSERT INTO score_low_optional_histo SET ? ', score_low_optional_histo , function(err,res){
        if(err) throw err;

        console.log('Last insert ID:', res.insertId);
        insertedID = parseInt(res.insertId);
    });

    var tempID = parseInt(req.body.IDSong) - ((parseInt(req.body.IDSong) - 11) % 3); // Used to find the 3 songs in the category
    con.query("SELECT SLID, FCSPoints FROM scores_low " +
        "INNER JOIN score_low_optional_histo on score_low_optional_histo.ScoreID = scores_low.ScoreID " +
        "WHERE scores_low.PlayerID = ? AND (scores_low.SongID = ? OR scores_low.SongID = ? + 1 OR " +
        "scores_low.SongID = ? + 2);", [req.body.IDPlayer, tempID, tempID, tempID], function(err,res){
        if(err) throw err;

        if (res.length == 0)
        {
            for (var i = 0; i < 10; i++)
            {
                var newRecord = { PlayerID : req.body.IDPlayer, SongID: 11 + 3 * i, ScoreID: 1}; // Null score hardcoded in base
                con.query("INSERT INTO scores_low SET ? ", newRecord, function(err,res){
                    if(err) throw err;
                });
            }

            console.log("Created score histo for player");

            con.query("UPDATE scores_low SET ScoreID = ? , SongID = ? " +
                "WHERE PlayerID = ? AND (SongID = ? OR SongID = ? + 1 OR SongID = ? + 2)"
                , [insertedID, req.body.IDSong, req.body.IDPlayer, tempID, tempID, tempID], function(err,res){
                    if(err) throw err;

                console.log("New record !");
            });
        }
        else {
            data = res[0];

            if(data.FCSPoints < FCSLowPoints)
            {
                con.query("UPDATE scores_low SET ScoreID = ? , SongID = ? " +
                    "WHERE PlayerID = ? AND (SongID = ? OR SongID = ? + 1 OR SongID = ? + 2)"
                    , [insertedID, req.body.IDSong, req.body.IDPlayer, tempID, tempID, tempID], function(err,res){
                    if(err) throw err;

                    console.log("New record update !");
                });
            }
        }
    });

    res.redirect('/admin/addScoreLow');
})

function FCSLowPointsCalc(fantastics, excellents, greats)
{
    var points = (3 * parseInt(fantastics))  + (2 * parseInt(excellents)) + parseInt(greats);
    return points;
}