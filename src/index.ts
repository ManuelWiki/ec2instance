// 'https://simconnectivity.qasar.app/api/v1/connectivity/sms'
// Send a POST request to this API and see the response
// imei: 860369051489829
// ICCID: 8988303000010767999
// source address: 'Manuel\'s repo'
// my instance's DNS:
// the command to be sent: 

// My instance must listen for an http request to signal it should connect the device
// Then try to establish the connection and inform if it was successfull

import net from 'net';
import http from 'http';

const TCP_PORT = 2000;
const HTTP_PORT = 3000;
let tcpConnections = 0;

const tcpServer = net.createServer((socket) => {
    tcpConnections++;
});

tcpServer.on('close', () => {
    tcpConnections--;
});

tcpServer.listen(TCP_PORT, () => {
    console.log(`TCP server listening on port ${TCP_PORT}`);
});

const req = http.request({
    hostname: 'https://simconnectivity.qasar.app/api/v1/connectivity/sms',
    port: 2000,
    path: '/',
    method: 'POST', 
    },
    (res) => { console.log('Connectivity API has responded: ', res); }
);
req.write(JSON.stringify({
    message: `pass connect 3.137.78.143,${TCP_PORT},TCP`,
    iccid: '8988303000010767999',
    sourceAddress: 'Manuel\'s repo',
}));
req.end();

const httpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Current TCP connections ${tcpConnections}`);
});

httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP server listening on port ${HTTP_PORT}`);
});

