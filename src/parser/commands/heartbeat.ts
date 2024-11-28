// Command 16/116

import { DevicePacket } from "../packet_decoder";
import { BufferHandler } from "../buffer_handler";
import { fillPacketFields } from "../packet_encoder";

export class HeartbeatPacket extends DevicePacket {
    constructor(buffer: BufferHandler) {
        super(buffer);
    }

    protected initPayload(data: BufferHandler): void {}
}

export function encodeHeartbeat(): Buffer {
    const packet = Buffer.alloc(6);
    packet.writeUInt8(1, 3);
    fillPacketFields(packet, 116);
    return packet;
}
