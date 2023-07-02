#include <openssl/sha.h>
#include <cstdint>
#include <string>

inline void sha256(std::string_view s, uint8_t *ret) {
	static SHA256_CTX ctx;
	SHA256_Init(&ctx);
	SHA256_Update(&ctx, (const uint8_t *) s.data(), s.size());
	SHA256_Final(ret, &ctx);
}
