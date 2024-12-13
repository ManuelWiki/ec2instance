import { crc16Rec } from "./crc";

export function fillPacketFields(buffer: Buffer, cmd_id: number): void {
    const len = buffer.length - 4; // length of buffer without CRC and length fields
    buffer.writeUInt16BE(len, 0); // write the packet's length at position 0
    buffer.writeUInt8(cmd_id, 2); // write CMD_ID at position 2

    const crc = crc16Rec(buffer.subarray(2, len + 2));
    buffer.writeUInt16BE(crc, len + 2); // +2 is to add the 2 bytes corresponding to length field's 2 bytes
}