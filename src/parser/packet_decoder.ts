import { BufferHandler } from "./buffer_handler";
import { crc16kermit } from "crc";

export abstract class DevicePacket {
    protected length: number;
    protected imei: bigInt.BigInteger;
    protected command_ID: number;
    // payload
    protected crc: number;

    protected abstract initPayload(data: BufferHandler): void;

    constructor(buffer: BufferHandler) {
        this.length = buffer.read2Bytes();
        this.imei = buffer.read8Bytes();
        this.command_ID = buffer.readByte();
        this.initPayload(buffer);
        this.crc = buffer.read2Bytes();

        // Missing a validation for correct CRC
        // Missing a validation for remaining bytes.
    }
}

