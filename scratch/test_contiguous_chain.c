#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <zlib.h>

int main() {
    FILE *f = fopen("extracted/Data1.cab", "rb");
    if (!f) return 1;

    // Block 0 is at 0x909, size 8138
    // Block 1 is at 0x28db, size 13866
    // Block 2 is at 0x610d, size 13969
    // Block 3 is at 0x97a6, size 17353
    
    unsigned int offsets[] = {0x909, 0x28db, 0x610d, 0x97a6, 0xdb77, 0x11e8e, 0x1653f, 0x1b12e};
    int n_blocks = sizeof(offsets)/sizeof(offsets[0]);
    
    unsigned char *decomp = malloc(1024*1024);
    size_t total = 0;
    
    z_stream strm;
    memset(&strm, 0, sizeof(strm));
    inflateInit2(&strm, -MAX_WBITS);
    
    unsigned char zero_dict[32768] = {0};
    inflateSetDictionary(&strm, zero_dict, 32768);
    
    for (int i = 0; i < n_blocks; i++) {
        fseek(f, offsets[i], SEEK_SET);
        unsigned char hdr[8];
        fread(hdr, 1, 8, f);
        unsigned short sz = *(unsigned short*)(hdr + 4);
        unsigned short uncomp = *(unsigned short*)(hdr + 6);
        
        // for block 0, sz is 8138 (0x1fca)
        if (i == 0) sz = 8138;
        
        unsigned char *cdata = malloc(sz);
        fread(cdata, 1, sz, f);
        
        if (i > 0) {
            inflateReset(&strm);
            size_t dlen = total < 32768 ? total : 32768;
            inflateSetDictionary(&strm, decomp + total - dlen, dlen);
        }
        
        strm.next_in = cdata + 2;
        strm.avail_in = sz - 2;
        strm.next_out = decomp + total;
        strm.avail_out = 1024*1024 - total;
        
        int ret = inflate(&strm, Z_SYNC_FLUSH);
        size_t prod = (1024*1024 - total) - strm.avail_out;
        printf("Block %d (off=%x): sz=%u, uncomp_hdr=%u, produced=%zu, ret=%d, msg=%s\n",
               i, offsets[i], sz, uncomp, prod, ret, strm.msg ? strm.msg : "none");
        
        total += prod;
        free(cdata);
    }
    
    printf("\nTotal decompressed after %d blocks: %zu bytes\n", n_blocks, total);
    printf("First 32 bytes of decompressed file:\n");
    for (int i = 0; i < 32; i++) printf("%02x ", decomp[i]);
    printf("\n");
    for (int i = 0; i < 32; i++) putchar((decomp[i] >= 32 && decomp[i] <= 126) ? decomp[i] : '.');
    printf("\n");
    
    inflateEnd(&strm);
    fclose(f);
    return 0;
}
