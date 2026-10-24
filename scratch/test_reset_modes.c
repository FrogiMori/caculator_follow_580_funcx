#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <zlib.h>

int main() {
    FILE *f = fopen("extracted/Data1.cab", "rb");
    if (!f) return 1;

    // Test Folder 0 blocks:
    // Block 0: off=0x909, sz=8138 (cdata has 'CK' + 8136 bytes)
    // Block 1: off=0x28db, sz=13866
    
    // Read block 0
    fseek(f, 0x909, SEEK_SET);
    unsigned char hdr0[8];
    fread(hdr0, 1, 8, f);
    unsigned char *cdata0 = malloc(8138);
    fread(cdata0, 1, 8138, f);

    // Read block 1
    fseek(f, 0x28db, SEEK_SET);
    unsigned char hdr1[8];
    fread(hdr1, 1, 8, f);
    unsigned short sz1 = *(unsigned short*)(hdr1 + 4);
    unsigned short uncomp1 = *(unsigned short*)(hdr1 + 6);
    unsigned char *cdata1 = malloc(sz1);
    fread(cdata1, 1, sz1, f);
    printf("Block 1 header: sz=%u, uncomp=%u, magic=%c%c\n", sz1, uncomp1, cdata1[0], cdata1[1]);

    unsigned char *out = malloc(1024*1024);
    
    // Test 1: Persistent stream without inflateReset
    printf("\n--- Test 1: Single stream without reset ---\n");
    z_stream strm;
    memset(&strm, 0, sizeof(strm));
    inflateInit2(&strm, -MAX_WBITS);
    unsigned char zero_dict[32768] = {0};
    inflateSetDictionary(&strm, zero_dict, 32768);
    
    strm.next_in = cdata0 + 2;
    strm.avail_in = 8136;
    strm.next_out = out;
    strm.avail_out = 1024*1024;
    int ret0 = inflate(&strm, Z_SYNC_FLUSH);
    size_t prod0 = 1024*1024 - strm.avail_out;
    printf("Block 0: ret=%d, prod=%zu, avail_in=%u\n", ret0, prod0, strm.avail_in);

    // Just feed block 1 (skip CK)
    strm.next_in = cdata1 + 2;
    strm.avail_in = sz1 - 2;
    int ret1 = inflate(&strm, Z_SYNC_FLUSH);
    size_t prod1 = (1024*1024 - strm.avail_out) - prod0;
    printf("Block 1: ret=%d, prod=%zu, avail_in=%u, msg=%s\n", ret1, prod1, strm.avail_in, strm.msg ? strm.msg : "none");
    inflateEnd(&strm);

    // Test 2: With inflateResetKeep (preserves sliding window dictionary!)
    printf("\n--- Test 2: With inflateResetKeep ---\n");
    memset(&strm, 0, sizeof(strm));
    inflateInit2(&strm, -MAX_WBITS);
    inflateSetDictionary(&strm, zero_dict, 32768);
    
    strm.next_in = cdata0 + 2;
    strm.avail_in = 8136;
    strm.next_out = out;
    strm.avail_out = 1024*1024;
    ret0 = inflate(&strm, Z_SYNC_FLUSH);
    prod0 = 1024*1024 - strm.avail_out;
    printf("Block 0: ret=%d, prod=%zu\n", ret0, prod0);

    inflateResetKeep(&strm);
    strm.next_in = cdata1 + 2;
    strm.avail_in = sz1 - 2;
    ret1 = inflate(&strm, Z_SYNC_FLUSH);
    prod1 = (1024*1024 - strm.avail_out) - prod0;
    printf("Block 1: ret=%d, prod=%zu, msg=%s\n", ret1, prod1, strm.msg ? strm.msg : "none");
    inflateEnd(&strm);

    return 0;
}
