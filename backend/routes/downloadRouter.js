const express = require('express');
const router = express.Router();
const YTDlpWrap = require("yt-dlp-wrap").default;
const ytDlpWrap = new YTDlpWrap();

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

const clients = new Map();


wss.on('connection',(ws,req)=>{
    const ip = req.headers['sec-websocket-protocol']
    clients.set(ip,ws)

    ws.on("close", () => {
        clients.delete(ip);
    });
})

router.post('/download/video',(req, res) => {
    const userID = req.body.userID
    const ws = clients.get(userID)

    const videoUrl = req.body.url;

    if (!videoUrl){
        return res.status(400).send({
            status:"exception",
            msg:'Video URL Required'
        });
    }

    try {
        const process = ytDlpWrap.execStream(["-f", "best", videoUrl]);
        
        process.pipe(res)

        process.on('ytDlpEvent', (eventType, eventData) =>{
            if(ws) ws.send(eventData)
        })
        process.on('error',(error)=>{
            res.status(400).send({
                status:"exception",
                msg: "Failed To Download Video"
            });
        })
        
    } catch (error) {
        res.status(400).send({
            status:"exception",
            msg: "Failed To Download Video"
        });
    }
});





module.exports = router;