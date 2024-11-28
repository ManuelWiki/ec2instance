import { ExtendedRecordsPacket } from "./commands/extended_records";
import { SetcfgPacket } from "./commands/gprs_setcfg";
import { BufferHandler } from "./buffer_handler";

export function decodePacket(buffer: Buffer) {
    const cmd = buffer.readUint8(10);

    switch (cmd) {
        case 68:
            return new ExtendedRecordsPacket(new BufferHandler(buffer));
        case 7:
            return new SetcfgPacket(new BufferHandler(buffer));
    }
}
