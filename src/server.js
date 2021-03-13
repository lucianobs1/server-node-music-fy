const express = require('express');
const app = require('./')

const server = express();

server.use(express.json());

server.use(app);

server.listen(3333, () => {
    console.log('🚀 server is running ');
})
