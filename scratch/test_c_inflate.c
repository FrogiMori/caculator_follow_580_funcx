#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <zlib.h>

int main() {
    FILE *f = fopen("extracted/Data1.cab", "rb");
    if (!f) { perror("fopen"); return 1; }
    
    // Seek to block 0 at 0x909
    fseek(f, 0x909, SEEK_SET);
    
    unsigned char hdr[8];
    fread(hdr, 1, 8, f);
    unsigned int cs = *(unsigned int*)hdr;
    unsigned short sz = *(unsigned short*)(hdr + 4);
    unsigned short uncomp = *(unsigned short*)(hdr + 6);
    printf("Block 0: sz=%u, uncomp=%u\n", sz, uncomp);
    
    unsigned char *in_buf = malloc(sz);
    fread(in_buf, 1, sz, f);
    printf("Magic: %c%c (0x%02x 0x%02x)\n", in_buf[0], in_buf[1], in_buf[0], in_buf[1]);
    
    unsigned char *out_buf = malloc(65536);
    
    z_stream strm;
    memset(&strm, 0, sizeof(strm));
    int ret = inflateInit2(&strm, -MAX_WBITS);
    if (ret != Z_OK) { printf("inflateInit2 failed: %d\n", ret); return 1; }
    
    strm.next_in = in_buf + 2;
    strm.avail_in = sz - 2;
    strm.next_out = out_buf;
    strm.avail_out = 65536;
    
    ret = inflate(&strm, Z_SYNC_FLUSH);
    printf("inflate ret=%d, bytes_produced=%lu, msg=%s\n", ret, (unsigned long)(65536 - strm.avail_out), strm.msg ? strm.msg : "none");
    
    if (strm.avail_out < 65536) {
        printf("First 16 bytes decompressed: ");
        for (int i = 0; i < 16; i++) printf("%02x ", out_buf[i]);
        printf("\n");
        // Print ascii if printable
        for (int i = 0; i < 16; i++) {
            char c = out_buf[i];
            putchar((c >= 32 && c <= 126) ? c : '.');
        }
        printf("\n");
    }
    
    inflateEnd(&strm);
    fclose(f);
    return 0;
}
