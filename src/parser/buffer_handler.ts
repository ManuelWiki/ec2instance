import bigInt from "big-integer";

// End of Buffer Validation should start here

class BufferHandler {
    private buffer: Buffer;
    private currentIndex: number;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
        this.currentIndex = 0;
    }
    
    // methods to extract values from buffer. All are Big Endian, and unsigned unless specified
    public readByte(): number {
        const value = this.buffer.readUInt8(this.currentIndex);
        this.currentIndex++;
        return value;
    }

    public read2Bytes(): number {
        const value = this.buffer.readUInt16BE(this.currentIndex);
        this.currentIndex += 2;
        return value;
    }
    
    public read4Bytes(): number {
        const value = this.buffer.readUInt32BE(this.currentIndex);
        this.currentIndex += 4;
        return value;
    }

    public read8Bytes(): bigInt.BigInteger {
        const high = this.read4Bytes();
        const low = this.read4Bytes();
        // do not increment currentIndex, as it's already done up here, at these 2 function calls
        
        const value = bigInt(high).shiftLeft(32).add(low);
        
        return value;
    }

    public bytesRemaining(): number {
        return this.buffer.length - this.currentIndex;
    }

    public getAsciiString(count: number): string {
        const string = this.buffer.toString("ascii", this.currentIndex, this.currentIndex + count);
        this.currentIndex += count;
        return string;
    }

    // for debugging only
    public getIndex(): number {
        return this.currentIndex;
    }

    public getBuffer(): Buffer {
        return this.buffer;
    }
}

export { BufferHandler };