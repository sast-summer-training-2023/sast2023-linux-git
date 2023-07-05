// g++ envir.cpp -o envir -O2 -I/usr/local/openssl/include -L/usr/local/openssl/lib -lcrypto -std=c++17
// clang++ envir.cpp -o envir -O2 -I/usr/local/quictls/include -L/usr/local/quictls/lib -lcrypto -std=c++17
#include "sha256.h"
#include <unistd.h>
#include <algorithm>
#include <cstring>
#include <filesystem>
#include <iostream>
#include <random>
#include <string>
using std::cin, std::cout, std::endl, std::string;

std::mt19937 gen;

uint64_t work(uint64_t x, uint64_t y) {
	if (!x) return y;
	uint64_t X = x << 20 | x >> 44;
	X ^= 0x01234567fedcba98ull;
	y *= 0x02468ace13579bdfull;
	uint64_t stk[16];
	for (int i = 0; i < 16; ++i) stk[i] = gen() ^ (x + y);
	stk[x & 15] = work(x - 1, X ^ y);
	std::sort(stk, stk + 16);
	return stk[y & 15];
}

string get_stdout_fn() {
	using namespace std::filesystem;
	try {
		return read_symlink("/proc/self/fd/1").filename();
	} catch (const filesystem_error &) {
		return string();
	}
}

int main(int argc, char *argv[]) {
	std::ios::sync_with_stdio(false), cin.tie(nullptr);

	string s;
	string stdout_fn = get_stdout_fn();

	cout << "In this task, we hope you do the following three things (to make up an intelligent environment !).\n"
			"After you succeed to do these, you will be given a flag.\n"
			"\x1b[37mPress enter to continue ...\x1b[0m" << endl;
	if (isatty(1)) std::getline(cin, s);

	cout << "\x1b[1;35m======== Task 1: Environment Variable ========\x1b[0m\n"
			"I want you to directly call 'envir' to invoke this program instead of './envir' or others.\n"
			"Can you meet my requirements?\n";

	if (strcmp(*argv, "envir")) return 1;

	cout << "\x1b[32mPretty good! It seems that you DID call me by 'envir'\x1b[0m. Probably you know something about \x1b[36mPATH\x1b[0m and other environment variables.\n"
			"\x1b[37mPress enter to continue ...\x1b[0m" << endl;
	if (isatty(1)) std::getline(cin, s);

	cout << "\x1b[1;35m======== Task 2: Stack limit ========\x1b[0m\n"
			"I will run a stack-consuming algorithm soon, it may cause a \"Stack Overflow\" later, could you please give me a larger stack size?\n"
			"Recall how to make a larger stack size in Linux.\n"
			"If you make sure the stack size is sufficient, please press enter." << endl;
	if (isatty(1)) std::getline(cin, s);

	uint64_t result = work(10000000, 1); // 0x70e30a12d31974f2
	cout << "\x1b[32mThanks for your stack\x1b[0m! I believe you used `\x1b[36mulimit -s unlimited\x1b[0m`!\n"
			"\x1b[37mPress enter to continue ...\x1b[0m" << endl;
	if (isatty(1)) std::getline(cin, s);

	cout << "\x1b[1;35m======== Task 3: Redirection ========\x1b[0m\n"
			"This task is slightly easier than the previous two.\n"
			"I am very shy, so I dare not tell you the flag face-to-face (in console), so I want you to redirect my output to a file named '\x1b[33mflag.txt\x1b[0m'. Can you do it?\n";

	if (stdout_fn == "flag.txt") {
		uint8_t ret[32];
		sha256(std::string_view(reinterpret_cast<char *>(&result), 8), ret);

		uint8_t flag[32] = {
			0xa6, 0x9f, 0x46, 0x54, 0x1d, 0x0b, 0xbc, 0xa5,
			0xe7, 0xcc, 0x0f, 0x20, 0x64, 0x61, 0x23, 0xdd,
			0xab, 0x35, 0x7f, 0x22, 0x18, 0x5e, 0xcf, 0x26,
			0x64, 0x05, 0x03, 0x4a, 0xbc, 0x39, 0x5a, 0xd7
		};
		for (int i = 0; i < 32; ++i) ret[i] ^= flag[i];

		cout << "Congratulations! The flag is " << ret << ".\n";
	}

	return 0;
}
