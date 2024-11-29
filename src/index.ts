import { createServer, Socket } from 'net';
import express from 'express';
import { encodeGprsSetcfg, SetcfgPacket } from './parser/commands/gprs_setcfg';
import { decodePacket } from './parser/factory';
import { ExtendedRecordsPacket, encodeAcknowledgement } from './parser/commands/extended_records';

let connections: Socket[] = [];

const deviceManager = createServer((socket: Socket) => {
  console.log('New conection established. IP: ', socket.remoteAddress);

  setInterval(() => {
    const packet = Buffer.from([0x00, 0x0A, 0x6C, 0x73, 0x65, 0x74, 0x69, 0x6F, 0x20, 0x32, 0x2C, 0x31, 0x71, 0xDE]);
    socket.write(packet);
    console.log('Sent SETIO to ', socket.remoteAddress);
}, 60000);

  socket.on('close', () => {
    console.log('Conection terminated');
    connections = connections.filter((s) => { return s !== socket });
  })

  socket.on('data', (data) => {
    console.log('Received data from ', socket.remoteAddress, '\n', data);
    const packet = decodePacket(data);
    console.log(packet);

    if (packet instanceof ExtendedRecordsPacket) {
      // Handle extended records packet
      const ack = encodeAcknowledgement(1); // Command 100 with ACK
      socket.write(ack);
    } else if (packet instanceof SetcfgPacket) {
      // Handle setcfg response packet
      console.log('Received setcfg response:', packet.getResponse());
    }
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
      return;
    }
    const targetSocket = connections[0];
    if(!targetSocket) {
      res.status(500).json({ message: 'No TCP connections!' });
      return;
    }

    // Attempt to encode a packet, send it to the only device we have, and get a response from the device

    const packet = encodeGprsSetcfg(req.body);
    if (!targetSocket.write(packet)) {
      res.status(500).json({ message: 'Failed to send configuration to device!' });
      return;
    }

    res.status(200).json({ message: 'Configuration attempted. See messages received\nSent to: ' + targetSocket.remoteAddress });
});

app.post('/getio', (req, res) => {

  if(connections.length === 0) {
    res.status(500).json({ message: 'No TCP connections!' });
    return;
  }
  const targetSocket = connections[0];
  if(!targetSocket) {
    res.status(500).json({ message: 'No TCP connections!' });
    return;
  }

  // Attempt to encode a packet, send it to the only device we have, and get a response from the device
//   const packet = Buffer.from([0x00, 0x0A, 0x6C, 0x73, 0x65, 0x74, 0x69, 0x6F, 0x20, 0x32, 0x2C, 0x31, 0x71, 0xDE]);
    const packet = Buffer.from([0x00, 0x01, 0x67, 0x17, 0xB9]);
    if (!targetSocket.write(packet)) {
    res.status(500).json({ message: 'Failed to send GETIO to device!' });
    return;
  }

  res.status(200).json({ message: 'GETIO attempted. See messages received\nSent to: ' + targetSocket.remoteAddress });
});

deviceManager.listen(tcpPort, () => {
  console.log('Device Manager is running on port 2000');
})
// setconnection em,,,TCP,3.137.78.143,2000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
