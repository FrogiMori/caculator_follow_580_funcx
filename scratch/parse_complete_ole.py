import struct

MSI_PATH = "extracted/ClassWiz Emulator Subscription for fx-580VN X.msi"

with open(MSI_PATH, "rb") as f:
    data = f.read()

sector_size = 512
fat_count = struct.unpack("<I", data[44:48])[0]
dir_start = struct.unpack("<I", data[48:52])[0]
difat_start = struct.unpack("<I", data[68:72])[0]
difat_count = struct.unpack("<I", data[72:76])[0]

print(f"Header: fat_count={fat_count}, dir_start={dir_start}, difat_start={difat_start}, difat_count={difat_count}")

# 1. Read first 109 DIFAT entries from header
difat_entries = list(struct.unpack("<109I", data[76:76+436]))
difat_entries = [s for s in difat_entries if s < 0xFFFFFFFC]

# 2. Follow DIFAT chain for remaining FAT sectors
cur_difat_sec = difat_start
for _ in range(difat_count):
    if cur_difat_sec >= 0xFFFFFFFC: break
    off = 512 + cur_difat_sec * 512
    # In each DIFAT sector: 127 entries of FAT sector IDs + 1 entry (last 4 bytes) for next DIFAT sector
    entries = struct.unpack("<127I", data[off:off+508])
    next_difat = struct.unpack("<I", data[off+508:off+512])[0]
    for s in entries:
        if s < 0xFFFFFFFC:
            difat_entries.append(s)
    cur_difat_sec = next_difat

print(f"Total FAT sectors gathered from DIFAT: {len(difat_entries)} (expected {fat_count})")

# 3. Build FAT table
fat = []
for sec_id in difat_entries[:fat_count]:
    off = 512 + sec_id * 512
    fat.extend(struct.unpack("<128I", data[off:off+512]))

print(f"Total FAT table entries: {len(fat)}")

def follow(start):
    ch, cur, seen = [], start, set()
    while cur < 0xFFFFFFFC and cur not in seen:
        seen.add(cur); ch.append(cur)
        if cur >= len(fat): break
        cur = fat[cur]
    return ch

def read_stream(start, size):
    chain = follow(start)
    return b"".join(data[512+s*512:512+(s+1)*512] for s in chain)[:size]

# 4. Read Directory entries
dir_chain = follow(dir_start)
dir_data = b"".join(data[512+s*512:512+(s+1)*512] for s in dir_chain)
print(f"Total directory entries: {len(dir_data)//128}")

MSICHAR = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz._"
def decode_msi_name(name):
    res = []
    for c in name:
        o = ord(c)
        if 0x3800 <= o < 0x4800:
            idx = o - 0x3800
            hi, lo = idx >> 6, idx & 0x3f
            res.append(MSICHAR[lo] + MSICHAR[hi])
        elif o == 5: res.append("\x05")
        else: res.append(c)
    return ''.join(res)

streams = []
for i in range(len(dir_data)//128):
    e = dir_data[i*128:(i+1)*128]
    nlen = struct.unpack("<H", e[64:66])[0]
    raw = e[:nlen-2].decode("utf-16le", errors="replace") if nlen > 2 else ""
    obj_type = e[66]
    start = struct.unpack("<I", e[116:120])[0]
    size = struct.unpack("<Q", e[120:128])[0]
    if obj_type == 2:
        dec = decode_msi_name(raw)
        streams.append({"idx": i, "raw": raw, "name": dec, "start": start, "size": size})

print("\n--- Streams with size > 100,000 bytes ---")
for s in sorted(streams, key=lambda x: x["size"], reverse=True):
    if s["size"] > 100000:
        magic = read_stream(s["start"], 8)
        print(f"[{s['idx']:2}] {s['name']:50} | size={s['size']:>12,} | start={hex(s['start'])} | magic={magic[:4]}")
