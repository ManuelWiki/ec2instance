export function crc16Rec(data: Uint8Array): number {
    let i: number;
    let bit: number;
    let carry: number;
    const poly: number = 0x8408; // reversed 0x1021
    let crc: number = 0;

    for (i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (bit = 0; bit < 8; bit++) {
            carry = crc & 1;
            crc >>= 1;
            if (carry) {
                crc ^= poly;
            }
        }
    }

    return crc;
}