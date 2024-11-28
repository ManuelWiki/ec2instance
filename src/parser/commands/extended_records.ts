// Command 68/100

import { BufferHandler } from "../buffer_handler";
import { DevicePacket } from "../packet_decoder";
import { BigInteger } from "big-integer";
import { fillPacketFields } from "../packet_encoder";

class ExtendedRecord {
    private timeStamp: number;  // FourByteValue;
    private timeStampExt: number; // OneByteValue;
    private recordExtension: number; // OneByteValue;
    private priority: number; // OneByteValue;
    private longitude: number; // FourByteValue;
    private latitude: number; // FourByteValue;
    private altitude: number; // TwoByteValue;
    private angle: number; // TwoByteValue;
    private satellites: number; // OneByteVa.lue;
    private speed: number; // TwoByteValue;
    private hdop: number; // OneByteValue;
    private eventID: number; // TwoByteValue;
    // Body
    [param: string]: number | BigInteger;

    constructor(data: BufferHandler) {
        const start = data.getIndex();

        this.timeStamp = data.read4Bytes();
        this.timeStampExt = data.readByte();
        this.recordExtension = data.readByte();
        this.priority = data.readByte();
        this.longitude = data.read4Bytes();
        this.latitude = data.read4Bytes();
        this.altitude = data.read2Bytes();
        this.angle = data.read2Bytes();
        this.satellites = data.readByte();
        this.speed = data.read2Bytes();
        this.hdop = data.readByte();
        this.eventID = data.read2Bytes();
        
        // read all record parameters
        // 1-Byte parameters
        let how_many = data.readByte();
        console.log(`${how_many} 1-Byte parameters present`);
        for (let i = 0; i < how_many; i++) {
            const io_id = data.read2Bytes();
            this[io_id] = data.readByte();
            // console.log(`${i}th iteration.`)
        }
        // 2-Byte parameters
        how_many = data.readByte();
        console.log(`${how_many} 2-Byte parameters present`);
        for (let i = 0; i < how_many; i++) {
            const io_id = data.read2Bytes();
            this[io_id] = data.read2Bytes();
        }
        // 4-Byte parameters
        how_many = data.readByte();
        console.log(`${how_many} 4-Byte parameters present`);
        for (let i = 0; i < how_many; i++) {
            const io_id = data.read2Bytes();
            this[io_id] = data.read4Bytes();
        }
        // 8-Byte parameters
        how_many = data.readByte();
        console.log(`${how_many} 8-Byte parameters present`);
        for (let i = 0; i < how_many; i++) {
            const io_id = data.read2Bytes();
            this[io_id] = data.read8Bytes();
        }

        const end = data.getIndex();
        console.log(`Record has been read. Record's length: ${end - start} bytes`);
    }
}

export class ExtendedRecordsPacket extends DevicePacket {
    private records_left!: boolean;
    private number_of_records!: number;
    private records!: ExtendedRecord[];

    constructor(data: BufferHandler) {
        super(data);
    }

    protected initPayload(data: BufferHandler): void {
        this.records_left = data.readByte() === 1;
        // console.log(this.records_left ? 'Records left in flash' : 'No records left in flash');
        this.number_of_records = data.readByte();
        // console.log(`This packet contains ${this.number_of_records} records`);
        this.records = [];

        for (let i = 0; i < this.number_of_records; i++) {
            // console.log(`Reading record ${i + 1} of ${this.number_of_records}`);
            this.records.push(new ExtendedRecord(data));
        }
    }
}

export function encodeAcknowledgement(ack: 0|1): Buffer {
    const packet = Buffer.alloc(6);
    packet.writeUInt8(ack, 3);
    fillPacketFields(packet, 100);
    return packet;
}