import { createServer, Socket } from 'net';
import express from 'express';
import { encodeGprsSetcfg } from './parser/commands/gprs_setcfg';
import { decodePacket } from './parser/factory';

let connections: Socket[] = [];

const deviceManager = createServer((socket: Socket) => {
  console.log('New conection established');

  socket.on('close', () => {
    console.log('Conection terminated');
    connections.filter((s) => { return s === socket });
  })

  socket.on('data', (data) => {
    const packet = decodePacket(data);
    console.log(packet);
  });

  connections.push(socket);
});

const app = express();
const port = process.env.PORT || 8080;
const tcpPort = 2000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'The API is up' });
});

app.post('/config', (req, res) => {
    
    if(connections.length === 0) {
      res.status(500).json({ message: 'No TCP connections!' });
    }

    // Attempt to encode a packet, send it to the only device we have, and get a response from the device
    const packet = encodeGprsSetcfg(req.body);
    connections[0].write(packet);

    res.status(200).json({ message: 'Configuration attempted. See messages received' });
});

deviceManager.listen(tcpPort, () => {
  console.log('Device Manager is running on port 2000');
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
