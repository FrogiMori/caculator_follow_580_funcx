#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <zlib.h>

int main() {
    FILE *f = fopen("extracted/Data1.cab", "rb");
    if (!f) { perror("fopen"); return 1; }
    fseek(f, 0x909, SEEK_SET);
    
    unsigned char hdr[8];
    fread(hdr, 1, 8, f);
    unsigned short sz = *(unsigned short*)(hdr + 4);
    unsigned short uncomp = *(unsigned short*)(hdr + 6);
    
    unsigned char *in_buf = malloc(sz);
    fread(in_buf, 1, sz, f);
    
    unsigned char *out_buf = malloc(65536);
    
    z_stream strm;
    memset(&strm, 0, sizeof(strm));
    inflateInit2(&strm, -MAX_WBITS);
    
    // Test with 32KB zero dictionary
    unsigned char zero_dict[32768] = {0};
    inflateSetDictionary(&strm, zero_dict, 32768);
    
    strm.next_in = in_buf + 2;
    strm.avail_in = sz - 2;
    strm.next_out = out_buf;
    strm.avail_out = 65536;
    
    int ret = inflate(&strm, Z_SYNC_FLUSH);
    printf("With zero_dict: inflate ret=%d, produced=%lu, msg=%s\n", ret, (unsigned long)(65536 - strm.avail_out), strm.msg ? strm.msg : "none");
    
    inflateEnd(&strm);
    fclose(f);
    return 0;
}
