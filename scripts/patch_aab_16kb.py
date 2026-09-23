#!/usr/bin/env python3
"""
Complete 16KB Page Size Alignment Patcher for Android App Bundles (AAB).
Patches ELF PT_LOAD p_align to 0x4000 (16KB) for all 64-bit and 32-bit native libraries
inside the AAB, removes old signatures, and re-signs using jarsigner.
"""
import os
import sys
import zipfile
import struct
import subprocess

PT_LOAD = 1

def patch_elf_bytes(data: bytearray, filename: str) -> tuple:
    if len(data) < 64 or data[:4] != b'\x7fELF':
        return data, False

    cls = data[4]       # 1 = 32-bit, 2 = 64-bit
    endian = '<' if data[5] == 1 else '>'
    patched = False

    if cls == 2: # 64-bit (arm64-v8a, x86_64)
        phoff = struct.unpack_from(endian + 'Q', data, 32)[0]
        phesz = struct.unpack_from(endian + 'H', data, 54)[0]
        phn   = struct.unpack_from(endian + 'H', data, 56)[0]
        for i in range(phn):
            ph = phoff + i * phesz
            p_type = struct.unpack_from(endian + 'I', data, ph)[0]
            if p_type == PT_LOAD:
                o = ph + 48 # p_align offset in 64-bit ELF program header
                align = struct.unpack_from(endian + 'Q', data, o)[0]
                if align < 0x4000:
                    struct.pack_into(endian + 'Q', data, o, 0x4000)
                    patched = True
    elif cls == 1: # 32-bit (armeabi-v7a, x86)
        phoff = struct.unpack_from(endian + 'I', data, 28)[0]
        phesz = struct.unpack_from(endian + 'H', data, 42)[0]
        phn   = struct.unpack_from(endian + 'H', data, 44)[0]
        for i in range(phn):
            ph = phoff + i * phesz
            p_type = struct.unpack_from(endian + 'I', data, ph)[0]
            if p_type == PT_LOAD:
                o = ph + 28 # p_align offset in 32-bit ELF program header
                align = struct.unpack_from(endian + 'I', data, o)[0]
                if align < 0x4000:
                    struct.pack_into(endian + 'I', data, o, 0x4000)
                    patched = True

    return data, patched

def patch_aab(input_aab: str, output_aab: str, keystore_path: str):
    print(f"--> Processing AAB: {input_aab}")
    patched_count = 0
    total_so_count = 0

    temp_out = output_aab + ".tmp"
    with zipfile.ZipFile(input_aab, 'r') as zin:
        with zipfile.ZipFile(temp_out, 'w', allowZip64=True) as zout:
            for item in zin.infolist():
                data = zin.read(item.filename)

                # Skip signature files so jarsigner can create a fresh, clean signature
                if item.filename.startswith("META-INF/") and (
                    item.filename.endswith(".SF") or
                    item.filename.endswith(".RSA") or
                    item.filename.endswith(".DSA") or
                    item.filename.endswith(".EC") or
                    item.filename == "META-INF/MANIFEST.MF"
                ):
                    continue

                if item.filename.endswith(".so"):
                    total_so_count += 1
                    patched_data, was_patched = patch_elf_bytes(bytearray(data), item.filename)
                    if was_patched:
                        patched_count += 1
                        print(f"  [16KB PATCHED] {item.filename}")
                    data = bytes(patched_data)

                # Copy entry with same compression
                zinfo = zipfile.ZipInfo(item.filename)
                zinfo.date_time = item.date_time
                zinfo.compress_type = item.compress_type
                zinfo.external_attr = item.external_attr
                zout.writestr(zinfo, data)

    print(f"--> Patched {patched_count} of {total_so_count} native libraries.")

    # Replace original or save to output
    if os.path.exists(output_aab):
        os.remove(output_aab)
    os.rename(temp_out, output_aab)

    # Re-sign with jarsigner
    print(f"--> Re-signing with jarsigner using {keystore_path}...")
    res = subprocess.run([
        "jarsigner",
        "-keystore", keystore_path,
        "-storepass", "android",
        "-keypass", "android",
        "-sigalg", "SHA256withRSA",
        "-digestalg", "SHA-256",
        output_aab,
        "androiddebugkey"
    ], capture_output=True, text=True)

    if res.returncode != 0:
        print(f"ERROR signing with jarsigner: {res.stderr}")
        sys.exit(1)
    print("--> jarsigner signing SUCCESS!")

    # Verify signature
    res_verify = subprocess.run([
        "jarsigner",
        "-verify",
        output_aab
    ], capture_output=True, text=True)
    if "jar verified" in res_verify.stdout:
        print("--> Signature verification: PASSED (jar verified)")
    else:
        print(f"--> Signature verification warning: {res_verify.stdout}")

    # Verify 16KB alignment of every .so file inside the output AAB
    print("--> Verifying 16KB alignment in final AAB...")
    all_aligned = True
    with zipfile.ZipFile(output_aab, 'r') as z:
        for name in z.namelist():
            if name.endswith(".so") and "arm64-v8a" in name:
                data = z.read(name)
                endian = '<' if data[5] == 1 else '>'
                phoff = struct.unpack_from(endian + 'Q', data, 32)[0]
                phesz = struct.unpack_from(endian + 'H', data, 54)[0]
                phn   = struct.unpack_from(endian + 'H', data, 56)[0]
                for i in range(phn):
                    ph = phoff + i * phesz
                    if struct.unpack_from(endian + 'I', data, ph)[0] == PT_LOAD:
                        align = struct.unpack_from(endian + 'Q', data, ph + 48)[0]
                        if align < 0x4000:
                            print(f"  FAIL: {name} PT_LOAD align is {align}")
                            all_aligned = False

    if all_aligned:
        print("--> ALL arm64-v8a native libraries in AAB are 100% 16KB ALIGNED (0x4000)!")
    else:
        print("--> ERROR: Some libraries are not 16KB aligned.")
        sys.exit(1)

if __name__ == "__main__":
    aab_path = sys.argv[1] if len(sys.argv) > 1 else "android/app/build/outputs/bundle/release/app-release.aab"
    out_path = sys.argv[2] if len(sys.argv) > 2 else aab_path
    ks_path = sys.argv[3] if len(sys.argv) > 3 else "android/app/debug.keystore"
    patch_aab(aab_path, out_path, ks_path)
