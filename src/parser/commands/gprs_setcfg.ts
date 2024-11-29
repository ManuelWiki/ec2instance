// Command 07/108

import { fillPacketFields } from "../packet_encoder";
import { encodeSetcfg } from "../setcfg_encoder";
import { ConfigParams } from "../setcfg_encoder";
import { DevicePacket } from "../packet_decoder";
import { BufferHandler } from "../buffer_handler";

export function encodeGprsSetcfg(options: ConfigParams): Buffer {
    const payloadString = encodeSetcfg(options);
    const payloadBuffer = Buffer.from(payloadString, 'ascii');
    if(payloadBuffer.length > 1018) {
        throw new Error('Payload too long');
    }
    let packet = Buffer.alloc(payloadBuffer.length + 5);
    payloadBuffer.copy(packet, 3);
    fillPacketFields(packet, 108);
    return packet;
}

export class SetcfgPacket extends DevicePacket {
    private response!: string;

    protected initPayload(data: BufferHandler): void {
        const buffer = data.getBuffer();
        const payload = buffer.slice(3, buffer.length - 2);
        this.response = payload.toString('ascii');
    }

    constructor(buffer: BufferHandler) {
        super(buffer);
    }

    public getResponse(): string {
        return this.response;
    }
}
