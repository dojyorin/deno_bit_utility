/**
* Compresses raw binary in "deflate" format (RFC1951 compliant).
* It does not include header information like "gzip" (RFC1952) or "zlib" (RFC1950) as it does purely "compression only".
* @param data The byte buffer.
**/
export async function deflateEncode(data:ArrayBuffer){
    return new Response(new Blob([data]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer();
}

/**
* Decompress "deflate" format (RFC1951 compliant) binary.
* Binaries containing header information like "gzip" (RFC1952) or "zlib" (RFC1950) cannot be decompressed.
* @param data The byte buffer.
**/
export async function deflateDecode(data:ArrayBuffer){
    return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer();
}