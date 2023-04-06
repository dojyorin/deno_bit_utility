import {cryptoHash} from "./crypto.ts";
import {utfEncode, utfDecode, hexEncode} from "./text.ts";

const sizeHash = 32;
const sizeName = 1;
const sizeBody = 4;

/**
* The file name and byte array pairs that make up the basic file.
*/
export type FileInit = [string, Uint8Array];

/**
* Encode data into a byte array in "minipack" format.
* @param files array of pair of name and byte array.
* @return byte array in "minipack" format.
* @see https://deno.land/x/simple_utility
*/
export async function minipackEncode(files:FileInit[]){
    const archive = new Uint8Array(files.reduce((a, [k, v]) => a + sizeHash + sizeName + sizeBody + utfEncode(k).byteLength + v.byteLength, 0));

    let i = 0;

    for(const [k, v] of files){
        const name = utfEncode(k);
        const body = v;

        archive.set(await cryptoHash(false, body), i);
        i += sizeHash;

        new DataView(archive.buffer, i).setUint8(0, name.byteLength);
        i += sizeName;

        new DataView(archive.buffer, i).setUint32(0, body.byteLength);
        i += sizeBody;

        archive.set(name, i);
        i += name.byteLength;

        archive.set(body, i);
        i += body.byteLength;
    }

    return archive;
}

/**
* Decode byte array in "minipack" format.
* @param archive byte array in "minipack" format.
* @return array of pair of name and byte array.
* @see https://deno.land/x/simple_utility
*/
export async function minipackDecode(archive:Uint8Array){
    const files:FileInit[] = [];

    for(let i = 0; i < archive.byteLength; false){
        const hash = archive.subarray(i, i += sizeHash);

        const ns = new DataView(archive.buffer, i).getUint8(0);
        i += sizeName;

        const bs = new DataView(archive.buffer, i).getUint32(0);
        i += sizeBody;

        const name = utfDecode(archive.subarray(i, i += ns));

        const body = archive.subarray(i, i += bs);

        if(hexEncode(hash) !== hexEncode(await cryptoHash(false, body))){
            throw new Error();
        }

        files.push([name, body]);
    }

    return files;
}