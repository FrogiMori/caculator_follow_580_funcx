#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <zlib.h>

#pragma pack(push, 1)
typedef struct {
    char sig[4];
    unsigned int res1;
    unsigned int cbCabinet;
    unsigned int res2;
    unsigned int coffFiles;
    unsigned int res3;
    unsigned char verMin;
    unsigned char verMaj;
    unsigned short cFolders;
    unsigned short cFiles;
    unsigned short flags;
    unsigned short setID;
    unsigned short iCabinet;
} CFHEADER;

typedef struct {
    unsigned int coffCabStart;
    unsigned short cCFData;
    unsigned short typeCompress;
} CFFOLDER;

typedef struct {
    unsigned int cbFile;
    unsigned int uoffFolderStart;
    unsigned short iFolder;
    unsigned short date;
    unsigned short time;
    unsigned short attribs;
} CFFILE_HDR;
#pragma pack(pop)

typedef struct {
    char name[256];
    unsigned int cbFile;
    unsigned int uoffFolderStart;
    unsigned short iFolder;
} FileEntry;

int main() {
    const char *cab_path = "extracted/Data1.cab";
    const char *out_dir = "extracted/files";
    mkdir(out_dir, 0755);

    FILE *f = fopen(cab_path, "rb");
    if (!f) { perror("fopen"); return 1; }

    CFHEADER hdr;
    fread(&hdr, 1, sizeof(hdr), f);
    printf("CAB: cbCabinet=%u, cFolders=%u, cFiles=%u\n", hdr.cbCabinet, hdr.cFolders, hdr.cFiles);

    CFFOLDER *folders = malloc(hdr.cFolders * sizeof(CFFOLDER));
    for (int i = 0; i < hdr.cFolders; i++) {
        fread(&folders[i], 1, sizeof(CFFOLDER), f);
    }

    fseek(f, hdr.coffFiles, SEEK_SET);
    FileEntry *files = malloc(hdr.cFiles * sizeof(FileEntry));
    for (int i = 0; i < hdr.cFiles; i++) {
        CFFILE_HDR fhdr;
        fread(&fhdr, 1, sizeof(fhdr), f);
        files[i].cbFile = fhdr.cbFile;
        files[i].uoffFolderStart = fhdr.uoffFolderStart;
        files[i].iFolder = fhdr.iFolder;

        int c, p = 0;
        while ((c = fgetc(f)) != 0 && c != EOF && p < 255) {
            files[i].name[p++] = (char)c;
        }
        files[i].name[p] = '\0';
    }

    printf("Loaded %u files metadata. Now extracting folders...\n", hdr.cFiles);

    // Decompress each folder completely into memory
    for (int folder_idx = 0; folder_idx < hdr.cFolders; folder_idx++) {
        CFFOLDER *fld = &folders[folder_idx];
        printf("\nDecompressing Folder %d (coffCabStart=0x%x, cCFData=%u)...\n", 
               folder_idx, fld->coffCabStart, fld->cCFData);

        // Find total uncompressed size of this folder
        unsigned int folder_size = 0;
        for (int i = 0; i < hdr.cFiles; i++) {
            if (files[i].iFolder == folder_idx) {
                unsigned int end = files[i].uoffFolderStart + files[i].cbFile;
                if (end > folder_size) folder_size = end;
            }
        }
        printf("  Estimated uncompressed folder size: %u bytes (%0.2f MB)\n", folder_size, folder_size / (1024.0 * 1024.0));

        // Allocate buffer for folder data (with generous headroom)
        size_t alloc_size = folder_size + 1024 * 1024;
        unsigned char *folder_data = malloc(alloc_size);
        size_t folder_pos = 0;

        fseek(f, fld->coffCabStart, SEEK_SET);

        z_stream strm;
        memset(&strm, 0, sizeof(strm));
        inflateInit2(&strm, -MAX_WBITS);

        unsigned char zero_dict[32768] = {0};
        inflateSetDictionary(&strm, zero_dict, 32768);

        for (int blk_idx = 0; blk_idx < fld->cCFData; blk_idx++) {
            unsigned char blk_hdr[8];
            fread(blk_hdr, 1, 8, f);
            unsigned short cbData = *(unsigned short*)(blk_hdr + 4);
            unsigned short cbUncomp = *(unsigned short*)(blk_hdr + 6);

            unsigned char *cdata = malloc(cbData);
            fread(cdata, 1, cbData, f);

            // MSZIP check
            if (cdata[0] != 'C' || cdata[1] != 'K') {
                printf("  [!] Block %d missing CK signature! Got 0x%02x 0x%02x\n", blk_idx, cdata[0], cdata[1]);
            }

            // In MSZIP:
            // For subsequent blocks, dictionary is the last up-to-32KB of folder_data
            if (blk_idx > 0) {
                inflateReset(&strm);
                size_t dict_len = folder_pos < 32768 ? folder_pos : 32768;
                inflateSetDictionary(&strm, folder_data + folder_pos - dict_len, dict_len);
            }

            strm.next_in = cdata + 2;
            strm.avail_in = cbData - 2;
            strm.next_out = folder_data + folder_pos;
            strm.avail_out = alloc_size - folder_pos;

            int ret = inflate(&strm, Z_SYNC_FLUSH);
            size_t produced = (alloc_size - folder_pos) - strm.avail_out;
            if (produced != cbUncomp) {
                printf("  [!] Block %d: produced %lu != expected %u (ret=%d, msg=%s)\n", 
                       blk_idx, produced, cbUncomp, ret, strm.msg ? strm.msg : "none");
            }
            folder_pos += produced;
            free(cdata);
        }
        inflateEnd(&strm);

        printf("  Folder %d completely unpacked: %zu bytes\n", folder_idx, folder_pos);

        // Now save all files belonging to this folder
        for (int i = 0; i < hdr.cFiles; i++) {
            if (files[i].iFolder == folder_idx) {
                char out_path[512];
                snprintf(out_path, sizeof(out_path), "%s/%s", out_dir, files[i].name);

                FILE *out = fopen(out_path, "wb");
                if (!out) {
                    perror("fopen out");
                    continue;
                }
                fwrite(folder_data + files[i].uoffFolderStart, 1, files[i].cbFile, out);
                fclose(out);
                printf("  -> Saved: %-35s (%10u bytes)\n", files[i].name, files[i].cbFile);
            }
        }
        free(folder_data);
    }

    free(files);
    free(folders);
    fclose(f);
    printf("\nExtraction complete! Check %s/\n", out_dir);
    return 0;
}
