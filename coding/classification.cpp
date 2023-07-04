// g++ classification.cpp -o classification -O2 -I/usr/local/openssl/include -L/usr/local/openssl/lib -lcrypto -std=c++17
// clang++ classification.cpp -o classification -O2 -I/usr/local/quictls/include -L/usr/local/quictls/lib -lcrypto -std=c++17
#include "sha256.h"
#include <unistd.h>
#include <algorithm>
#include <filesystem>
#include <iostream>
#include <set>
#include <string>
using std::cin, std::cout, std::endl, std::string;

bool check_finish(uint8_t *ret) {
	using namespace std::filesystem;
	std::set<string> files;
	try {
		path p = read_symlink("/proc/self/exe").replace_filename("mess");
		for (const directory_entry &entry: directory_iterator(p)) {
			files.emplace(entry.path().filename());
		}
		SHA512_CTX ctx;
		SHA512_Init(&ctx);
		for (const string &file : files) {
			SHA512_Update(&ctx, file.data(), file.size());
		}
		SHA512_Final(ret, &ctx);
		return true;
	} catch (const filesystem_error &) {
		return false;
	}
}

int main() {
	std::ios::sync_with_stdio(false), cin.tie(nullptr);

	std::string s;
	uint8_t ret[80];
	if (check_finish(ret)) {
		uint8_t flag[64] = {
			0x21, 0xc5, 0x6c, 0xa9, 0xdf, 0xa4, 0xc2, 0x79,
			0x60, 0x7f, 0xb4, 0x24, 0x14, 0x6b, 0x0a, 0xbb,
			0x53, 0xfb, 0xab, 0xb2, 0xcb, 0x63, 0xf1, 0x25,
			0xf5, 0x73, 0xbe, 0x9d, 0xe7, 0x22, 0x9e, 0xf3,
			0xc5, 0xa3, 0xce, 0xf1, 0x65, 0x77, 0x99, 0x8d,
			0x29, 0x0f, 0x1a, 0x7d, 0xfc, 0x33, 0xfa, 0xd5,
			0x69, 0x91, 0x71, 0x60, 0x64, 0x82, 0x8f, 0xad,
			0xbb, 0xe3, 0xcd, 0xd1, 0xc3, 0xfd, 0xca, 0xe8
		};
		for (int i = 0; i < 64; ++i) ret[i] ^= flag[i];

		if (std::count(ret + 40, ret + 64, 0) == 24) {
			cout << "Wow, you actually filled in ALLLLLL the extensions! I'm SOOOOOO grateful for all you've done! The flag is " << ret << ".\n";
			return 0;
		}
	}

	cout << "Due to some technical reasons, I lost the extensions of all these files!\n"
			"All these files are in '\x1b[33mmess.zip\x1b[0m', can you help me to recover the extensions?\n"
			"\x1b[37mPress enter to continue ...\x1b[0m" << endl;
	if (isatty(1)) std::getline(cin, s);

	cout << "Thank you extremely much for your kindness! I will give you a flag in return after your classification!\n"
			"I may be a little weak, but I'm going to help you in any way I can!\n"
			"\n"
			"  1) Unzip the archive to a folder named '\x1b[33mmess\x1b[0m' in the same directory as this file (\x1b[33m./classification\x1b[0m).\n"
			"    In detail, the directory structure should be as follows:\n"
			"\n"
			"    \x1b[1;34mclassification\x1b[0m\n"
			"    ├── \x1b[1;32mclassification\x1b[0m\n"
			"    ├── \x1b[1;31mmess.zip\x1b[0m\n"
			"    └── \x1b[1;34mmess\x1b[0m\n"
			"        └── \x1b[32m<a lot of files ...>\x1b[0m\n"
			"\n"
			"  2) I vaguely remember that there are 16 different types of files in '\x1b[33mmess\x1b[0m' directory (in lexicographical order):\n"
			"    2.1) Windows bitmaps, should be appended with '\x1b[33m.bmp\x1b[0m';\n"
			"    2.2) FLAC audios, should be appended with '\x1b[33m.flac\x1b[0m';\n"
			"    2.3) GIF images, should be appended with '\x1b[33m.gif\x1b[0m';\n"
			"    2.4) JPEG images, should be appended with '\x1b[33m.jpg\x1b[0m' \x1b[31m(not '.jpeg'!)\x1b[0m;\n"
			"    2.5) MIDI musics, should be appended with '\x1b[33m.mid\x1b[0m';\n"
			"    2.6) MP3 music, should be appended with '\x1b[33m.mp3\x1b[0m';\n"
			"    2.7) MP4 medias (audios & videos), should be appended with '\x1b[33m.mp4\x1b[0m';\n"
			"    2.8) PDF documents, should be appended with '\x1b[33m.pdf\x1b[0m';\n"
			"    2.9) PNG images, should be appended with '\x1b[33m.png\x1b[0m';\n"
			"    2.10) Microsoft PowerPoint, should be appended with '\x1b[33m.pptx\x1b[0m';\n"
			"    2.11) SVG (Scalable Vector Graphics) images, should be appended with '\x1b[33m.svg\x1b[0m';\n"
			"    2.12) TrueType Font collections, should be appended with '\x1b[33m.ttc\x1b[0m';\n"
			"    2.13) TrueType Font data, should be appended with '\x1b[33m.ttf\x1b[0m';\n"
			"    2.14) Wave audios, should be appended with '\x1b[33m.wav\x1b[0m';\n"
			"    2.15) Web/P images, should be appended with '\x1b[33m.webp\x1b[0m';\n"
			"    2.16) Zip archives, should be appended with '\x1b[33m.zip\x1b[0m'; \x1b[31m(Warning: DO NOT try to DECOMPRESS any of these zip files!)\x1b[0m\n"
			"  3) Use your shell commands \x1b[37m(hint: file, grep, cut, awk, mv, rename, etc.)\x1b[0m to add the extensions to all the files correctly.\n"
			"  4) \x1b[1;31mMake sure the 'mess' folder doesn't contain any irrelevent file or folder\x1b[0m.\n"
			"  5) If you are finished, re-run me to get flag! ^_^" << endl;

	return 0;
}
