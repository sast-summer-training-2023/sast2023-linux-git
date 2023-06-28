import { assert } from './util/type';

export type base64UrlString = string;
export type base64String = string;
export type binaryString = string;
export type hexString = string;
export type BufferEntry = base64UrlString | base64String | binaryString | Uint8Array | hexString | bigint;
export type BufferTransform = (x: BufferEntry) => BufferEntry;

const
	textEncoder = new TextEncoder(),
	textDecoder = new TextDecoder(),
	convRight = <BufferTransform[]>[
		(base: base64UrlString): base64String => base.replaceAll('-', '+').replaceAll('_', '/'),
		(base: base64String): binaryString => atob(base),
		(bin: binaryString) => new Uint8Array(bin.length).map((_, id) => bin.charCodeAt(id)),
		(buf: Uint8Array): hexString => [...buf].map(byte => byte.toString(16).padStart(2, '0')).join(''),
		(hex: hexString) => BigInt('0x' + hex)
	],
	convLeft = <BufferTransform[]>[
		(base: base64String): base64UrlString => base.replaceAll('+', '-').replaceAll('/', '_'),
		(bin: binaryString): base64String => btoa(bin),
		(buf: Uint8Array): binaryString => {
			if (buf.length <= 65536) return String.fromCharCode(...buf);
			const fragments = [];
			for (let i = 0, j; ; i = j) {
				j = i + 65536;
				if (j >= buf.length) {
					fragments.push(String.fromCharCode(...buf.subarray(i)));
					break;
				}
				fragments.push(String.fromCharCode(...buf.subarray(i, j)));
			}
			return fragments.join('');
		},
		(hex: hexString) => new Uint8Array(hex.length / 2).map((_, id) => parseInt(hex.substring(id * 2, (id + 1) * 2), 16)),
		(int: bigint): hexString => (hex => hex.length & 1 ? '0' + hex : hex)(int.toString(16))
	],
	left = Symbol(),
	right = Symbol(),
	internal = Symbol();

export class Buffer {
	[left]: number;
	[right]: number;
	[internal]: BufferEntry[];

	constructor(pos: number, value: BufferEntry) {
		this[left] = this[right] = pos;
		this[internal] = new Array(6);
		this[internal][pos] = value;
	}

	#to(n: number) {
		for (; this[right] < n; ++this[right]) {
			this[internal][this[right] + 1] = convRight[this[right]](this[internal][this[right]]);
		}
		for (; this[left] > n;) {
			--this[left];
			this[internal][this[left]] = convLeft[this[left]](this[internal][this[left] + 1]);
		}
		return this[internal][n];
	}

	static fromBase64Url(base64: base64UrlString) { return new Buffer(0, base64); }

	static fromBase64(base64: base64String) { return new Buffer(1, base64); }

	static fromBinaryString(binaryString: binaryString) { return new Buffer(2, binaryString); }

	static fromUint8Array(uint8Array: Uint8Array) { return new Buffer(3, uint8Array); }

	static fromHex(hex: hexString) { return new Buffer(4, hex); }

	static fromBigInt(bigint: bigint) { return new Buffer(5, bigint); }

	static fromUtf8(utf8: string): Buffer { return new Buffer(3, textEncoder.encode(utf8)); }

	static fromArrayBuffer(arrayBuffer: ArrayBuffer) { return new Buffer(3, new Uint8Array(arrayBuffer)); }

	static random(length: number) { return new Buffer(3, crypto.getRandomValues(new Uint8Array(length))); }

	asBase64Url() { return <base64UrlString>this.#to(0); }

	asBase64() { return <base64String>this.#to(1); }

	asBinaryString() { return <binaryString>this.#to(2); }

	asUint8Array() { return <Uint8Array>this.#to(3); }

	asHex() { return <hexString>this.#to(4); }

	asBigInt() { return <bigint>this.#to(5); }

	asUtf8() { return textDecoder.decode(<Uint8Array>this.#to(3)); }

	asArrayBuffer() { return (<Uint8Array>this.#to(3)).buffer; }

	async sha256() {
		return new Buffer(3, new Uint8Array(
			await crypto.subtle.digest('SHA-256', this.asUint8Array())
		));
	}

	static concatInternal(...buffers: Buffer[]) {
		const
			uint8Arrays = buffers.map(buffer => buffer.asUint8Array()),
			length = uint8Arrays.reduce((x, y) => x + y.length, 0),
			buffer = new Uint8Array(length);
		let pos = 0;
		for (const uint8Array of uint8Arrays) {
			buffer.set(uint8Array, pos);
			pos += uint8Arrays.length;
		}
		return buffer;
	}

	static concat(...buffers: Buffer[]) { return new Buffer(3, this.concatInternal(...buffers)); }
}

export class FixedLengthBuffer extends Buffer {
	length: number;

	constructor(pos: number, value: BufferEntry, length: number) {
		super(pos, value);
		this.length = length;
	}

	static fromBase64Url(base64Url: base64UrlString) {
		const buffer = new FixedLengthBuffer(0, base64Url, 0);
		buffer.length = buffer.asBinaryString().length;
		return buffer;
	}

	static fromBase64(base64: base64String) {
		const buffer = new FixedLengthBuffer(1, base64, 0);
		buffer.length = buffer.asBinaryString().length;
		return buffer;
	}

	static fromBinaryString(binaryString: binaryString) {
		return new FixedLengthBuffer(2, binaryString, binaryString.length);
	}

	static fromUint8Array(uint8Array: Uint8Array) {
		return new FixedLengthBuffer(3, uint8Array, uint8Array.length);
	}

	static fromHex(hex: hexString) {
		assert(!(hex.length & 1));
		return new FixedLengthBuffer(4, hex, hex.length >> 1);
	}

	static fromBigInt(bigint: bigint, length?: number) {
		const buffer = new FixedLengthBuffer(5, bigint, length ?? 0);
		if (typeof length === 'number') {
			buffer[left] = 4;
			buffer[internal][4] = buffer[internal][5].toString(16).padStart(length * 2, '0');
			assert(buffer[internal][4].length === length * 2);
		} else {
			buffer.length = buffer.asHex().length >> 1;
		}
		return buffer;
	}

	static fromArrayBuffer(arrayBuffer: ArrayBuffer) {
		return new FixedLengthBuffer(3, new Uint8Array(arrayBuffer), arrayBuffer.byteLength);
	}

	static random(length: number) {
		return new FixedLengthBuffer(3, crypto.getRandomValues(new Uint8Array(length)), length);
	}

	static concat(...buffers: Buffer[]) {
		const buffer = this.concatInternal(...buffers);
		return new FixedLengthBuffer(3, buffer, buffer.length);
	}
}
