import struct

MSI_PATH = "extracted/ClassWiz Emulator Subscription for fx-580VN X.msi"
OUT_CAB = "extracted/Data1_clean.cab"

with open(MSI_PATH, "rb") as f:
    data = f.read()

fat_count = struct.unpack("<I", data[44:48])[0]
dir_start = struct.unpack("<I", data[48:52])[0]
difat_start = struct.unpack("<I", data[68:72])[0]
difat_count = struct.unpack("<I", data[72:76])[0]

difat_entries = list(struct.unpack("<109I", data[76:76+436]))
difat_entries = [s for s in difat_entries if s < 0xFFFFFFFC]

cur_difat = difat_start
for _ in range(difat_count):
    if cur_difat >= 0xFFFFFFFC: break
    off = 512 + cur_difat * 512
    entries = struct.unpack("<127I", data[off:off+508])
    next_difat = struct.unpack("<I", data[off+508:off+512])[0]
    for s in entries:
        if s < 0xFFFFFFFC: difat_entries.append(s)
    cur_difat = next_difat

fat = []
for sec_id in difat_entries[:fat_count]:
    off = 512 + sec_id * 512
    fat.extend(struct.unpack("<128I", data[off:off+512]))

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

# Read directory
dir_chain = follow(dir_start)
dir_data = b"".join(data[512+s*512:512+(s+1)*512] for s in dir_chain)

# Stream 81 is Data1.cab
e81 = dir_data[81*128:82*128]
start81 = struct.unpack("<I", e81[116:120])[0]
size81 = struct.unpack("<Q", e81[120:128])[0]

print(f"Reading Data1.cab stream: start={hex(start81)}, size={size81:,} bytes...")
cab_bytes = read_stream(start81, size81)
print(f"Read {len(cab_bytes):,} bytes, magic={cab_bytes[:4]}")

with open(OUT_CAB, "wb") as f:
    f.write(cab_bytes)

print(f"Saved to {OUT_CAB} successfully!")
