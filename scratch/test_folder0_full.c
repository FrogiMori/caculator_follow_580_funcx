#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <zlib.h>

int main() {
    FILE *f = fopen("extracted/Data1.cab", "rb");
    if (!f) return 1;

    // Folder 0: coffCabStart = 0x909, cCFData = 92
    fseek(f, 0x909, SEEK_SET);

    size_t alloc_sz = 4 * 1024 * 1024;
    unsigned char *out = malloc(alloc_sz);
    size_t total = 0;

    z_stream strm;
    memset(&strm, 0, sizeof(strm));
    inflateInit2(&strm, -MAX_WBITS);

    unsigned char zero_dict[32768] = {0};
    inflateSetDictionary(&strm, zero_dict, 32768);

    unsigned int cur_off = 0x909;

    for (int blk = 0; blk < 92; blk++) {
        fseek(f, cur_off, SEEK_SET);
        unsigned char hdr[8];
        if (fread(hdr, 1, 8, f) < 8) break;

        unsigned short sz = *(unsigned short*)(hdr + 4);
        unsigned short uncomp = *(unsigned short*)(hdr + 6);

        // Block 0 sz correction
        if (blk == 0) sz = 8138;

        unsigned char *cdata = malloc(sz);
        fread(cdata, 1, sz, f);

        if (blk > 0) {
            inflateResetKeep(&strm);
        }

        strm.next_in = cdata + 2;
        strm.avail_in = sz - 2;
        strm.next_out = out + total;
        strm.avail_out = alloc_sz - total;

        int ret = inflate(&strm, Z_SYNC_FLUSH);
        size_t prod = (alloc_sz - total) - strm.avail_out;

        if (blk < 10 || blk > 85) {
            printf("Blk %2d (off=%x): sz=%5u, uncomp=%5u, prod=%5zu, ret=%d\n", 
                   blk, cur_off, sz, uncomp, prod, ret);
        } else if (blk == 10) {
            printf("...\n");
        }

        total += prod;
        free(cdata);
        cur_off += 8 + sz;
    }

    inflateEnd(&strm);
    fclose(f);

    printf("\nFolder 0 total uncompressed: %zu bytes\n", total);

    // Save activationfx.dll (1,494,016 bytes starting at offset 0)
    FILE *fout = fopen("extracted/binaries/activationfx.dll", "wb");
    if (fout) {
        fwrite(out, 1, 1494016, fout);
        fclose(fout);
        printf("Saved activationfx.dll (1494016 bytes)!\n");
    }

    return 0;
}
