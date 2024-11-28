import bigInt from 'big-integer';

class recordData {
    timeStamp: number;
    timeStampExt: number;
    priority: number;
    longitude: number;
    latitude: number;
    altitude: number;
    angle: number;
    satellites: number;
    Speed: number;
    hdop: number;
    eventID: number;

    constructor(timeStamp: number, timeStampExt: number, priority: number, longitude: number, latitude: number, altitude: number, angle: number, satellites: number, Speed: number, hdop: number, eventID: number) {
        this.timeStamp = timeStamp;
        this.timeStampExt = timeStampExt;
        this.priority = priority;
        this.longitude = longitude;
        this.latitude = latitude;
        this.altitude = altitude;
        this.angle = angle;
        this.satellites = satellites;
        this.Speed = Speed;
        this.hdop = hdop;
        this.eventID = eventID;
    }
}

class payloadData {
    left: boolean;
    recordsLeft: number;
    records: recordData[];

    constructor(left: boolean, recordsLeft: number, records: recordData[]) {
        this.left = left;
        this.recordsLeft = recordsLeft;
        this.records = records;
    }
}

class packetData {
    length: number;
    IMEI: bigInt.BigInteger;
    cmdID: number;
    payload: payloadData; // Will change this when we add support for more commands
    CRC: number;

    constructor(len: number, imei: bigInt.BigInteger, cmd: number, payload: payloadData, crc: number) {
        this.length = len;
        this.IMEI = imei;
        this.cmdID = cmd;
        this.payload = payload;
        this.CRC = crc;
    }
}

function BigIntFromBufferBE(buffer: Buffer, offset: number): bigInt.BigInteger {
    const high: number = buffer.readUInt32BE(offset);
    const low: number = buffer.readUInt32BE(offset +4);

    return bigInt(high).shiftLeft(32).add(low);
}

function parseRecord(buffer: Buffer): recordData {
    const timeStamp: number = buffer.readUInt32BE(0);
    const timeStampExt: number = buffer.readUInt8(4);
    const priority: number = buffer.readUInt8(5);
    const longitude: number = buffer.readInt32BE(6);
    const latitude: number = buffer.readInt32BE(10);
    const altitude: number = buffer.readInt16BE(14);
    const angle: number = buffer.readUInt16BE(16);
    const satellites: number = buffer.readUInt8(18);
    const speed: number = buffer.readUInt16BE(19);
    const hdop: number = buffer.readUInt8(21);
    const eventID: number = buffer.readUInt8(22);

    return new recordData(timeStamp, timeStampExt, priority, longitude, latitude, altitude, angle, satellites, speed, hdop, eventID);
}

function parsePayload(buffer: Buffer): payloadData {
    const left: boolean = buffer.readUInt8(0) === 1;
    const recordsLeft: number = buffer.readUInt8(1);
    const records: recordData[] = [];

    for (let i = 0; i < recordsLeft; i++) {
        records.push(parseRecord(buffer.subarray(2 + i * 23, 2 + (i + 1) * 23)));
    }

    return new payloadData(left, recordsLeft, records);
}

function parsePacket(packet: Buffer): packetData {
    const length: number = packet.readUInt16BE(0);

    const imeiSrc: Buffer = packet.subarray(2, 10);
    console.log(imeiSrc);
    console.log(BigIntFromBufferBE(imeiSrc, 0).toString());

    const imei: bigInt.BigInteger = BigIntFromBufferBE(packet, 2);
    const cmdID: number = packet.readUInt8(10);
    
    const payload: Buffer = packet.subarray(11, length - 2);
    const parsedPayload: payloadData = parsePayload(payload);

    const crc: number = packet.readUInt16BE(length + 2);

    return new packetData(length, imei, cmdID, parsedPayload, crc);
}

function hexStringToBuffer(hexString: string): Buffer {
    // Remove any non-hex characters (like spaces or colons)
    const cleanHexString = hexString.replace(/[^0-9A-Fa-f]/g, '');

    // Ensure we have an even number of characters
    if (cleanHexString.length % 2 !== 0) {
        throw new Error('Invalid hex string: must have an even number of characters');
    }

    // Create a buffer from the hex string
    const buffer = Buffer.from(cleanHexString, 'hex');

    return buffer;
}

export { parsePacket, hexStringToBuffer, parseRecord };

// FSMs might be a good solution, but there's a problem
// The alphabet can not be 1, 2, 4, or 8 bytes.
// In raw binary, everything can be taken as either of them.
// If packets could be seen as a language, there must be a set 
// of symbols to build the alphabet in the first place.

// packet := <length><IMEI><command_ID><payload><CRC>
// payload := <left><records_left><records>
// records := <time_stamp><time_stamp_ext><priority><longitude><latitude><altitude><angle><satellites><speed><hdop><event_ID>

// OneByte := 'a single byte'
// TwoBytes := 'two bytes'
// FourBytes := 'four bytes'
// EightBytes := 'eight bytes'

