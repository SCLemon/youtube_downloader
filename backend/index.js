const express = require('express');
const compression = require('compression');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.set('trust proxy', 'loopback, 192.168.0.1'); 

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 分鐘
    max: 8, // 限制每個 IP 最多 8 次請求
    message: 'Too many requests from this IP, please try again after a minute.',
});

app.use(limiter);


process.on('SIGINT', function() {
    process.exit(0);
});

// download router
const downloadRouter = require('./routes/downloadRouter');
app.use(downloadRouter);


app.listen(3007,()=>{
    console.log('server is running on port 3007')
})

// 避免系統中斷
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});