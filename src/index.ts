import { createServer, Socket } from 'net';
import express from 'express';
import { encodeGprsSetcfg, SetcfgPacket } from './parser/commands/gprs_setcfg';
import { decodePacket } from './parser/factory';
import { ExtendedRecordsPacket, encodeAcknowledgement } from './parser/commands/extended_records';

let connections: Socket[] = [];

const deviceManager = createServer((socket: Socket) => {
  console.log('New conection established. IP: ', socket.remoteAddress);

  socket.on('close', () => {
    console.log('Conection terminated');
    connections = connections.filter((s) => { return s !== socket });
  })

  socket.on('data', (data) => {
    console.log('Received data from ', socket.remoteAddress);
    const packet = decodePacket(data);

    if (packet instanceof ExtendedRecordsPacket) {
      // Handle extended records packet
      console.log('[Packet with command 68]');
      const ack = encodeAcknowledgement(1); // Command 100 with ACK
      socket.write(ack);
    } else if (packet instanceof SetcfgPacket) {
      // Handle setcfg response packet
      console.log('[Packet with command 07]: ', packet.getResponse());
    }
  });

  connections.push(socket);
});

const app = express();
const port = process.env.PORT || 80;
const tcpPort = 2000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ message: 'The API is up' });
});

app.post('/config', (req, res) => {
    
    if(connections.length === 0) {
      res.status(500).json({ message: 'No TCP connections!' });
      return;
    }
    const targetSocket = connections[0];
    if(!targetSocket) {
      res.status(500).json({ message: 'No TCP connections!' });
      return;
    }

    const packet = encodeGprsSetcfg(req.body);
    if (!targetSocket.write(packet)) {
      res.status(500).json({ message: 'Failed to send configuration to device!' });
      return;
    }

    res.status(200).json({ message: 'Configuration attempted. See messages received\nSent to: ' + targetSocket.remoteAddress });
});

deviceManager.listen(tcpPort, () => {
  console.log('Device Manager is running on port 2000');
});
// setconnection em,,,TCP,3.137.78.143,2000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});