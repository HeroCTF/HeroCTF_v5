#include <stdio.h>
#include <string.h>
#include <stdlib.h>

// Password: S4y_H3lL0_t0_mY_l1ttl3_FR13ND!!

const unsigned char* check_this_out = "https://www.youtube.com/watch?v=Olgn9sXNdl0";
const unsigned char* STRANGE = "\x81\x63\x34\x01\x87\x54\xee\x1f\xe2\x08\x39\x6e\x90\x0a\xdb\x0c\xbe\x66\x39\x2a\xa3\x54\xdd\x15\x80\x66\x7e\x10\x8b\x46\xa3";

// Base64 implementation shamefully copied from https://github.com/zhicheng/base64/

#define BASE64_PAD 		'='
#define BASE64DE_FIRST 	'+'
#define BASE64DE_LAST 	'z'

char *UNO_REVERSE_CARD(const char *str) {
	  char* strTmp = (char*) malloc(255);
	  
      char *p1, *p2;
      strcpy(strTmp,str);
 
      if (! strTmp || ! *str) return strTmp;
      for (p1 = strTmp, p2 = strTmp + strlen(str) - 1; p2 > p1; ++p1, --p2) {
            *p1 ^= *p2;
            *p2 ^= *p1;
            *p1 ^= *p2;
      }
      return strTmp;
}

// Base64 decoding table
const unsigned char decode_table[] = {
	   255, 255, 255, 255, 255, 255, 255, 255,
	   255, 255, 255, 255, 255, 255, 255, 255,
	   255, 255, 255, 255, 255, 255, 255, 255,
	   255, 255, 255, 255, 255, 255, 255, 255,
	   255, 255, 255, 255, 255, 255, 255, 255,
	   255, 255, 255,  62, 255, 255, 255,  63,
	    52,  53,  54,  55,  56,  57,  58,  59,
	    60,  61, 255, 255, 255, 255, 255, 255,
	   255,   0,   1,  2,   3,   4,   5,    6,
	     7,   8,   9,  10,  11,  12,  13,  14,
	    15,  16,  17,  18,  19,  20,  21,  22,
	    23,  24,  25, 255, 255, 255, 255, 255,
	   255,  26,  27,  28,  29,  30,  31,  32,
	    33,  34,  35,  36,  37,  38,  39,  40,
	    41,  42,  43,  44,  45,  46,  47,  48,
	    49,  50,  51, 255, 255, 255, 255, 255
};

// Base64_decode
unsigned int decode(const unsigned char *in, unsigned int inlen, unsigned char *out) {
	unsigned int i;
	unsigned int j;
	unsigned char c;

	if (inlen & 0x3) {
		return 0;
	}

	for (i = j = 0; i < inlen; i++) {
		if (in[i] == BASE64_PAD) {
			break;
		
		} if (in[i] < BASE64DE_FIRST || in[i] > BASE64DE_LAST) {
			return 0;
		}

		c = decode_table[(unsigned char)in[i]];
		if (c == 0xFF) {
			return 0;
		}

		switch (i & 0x3) {
			case 0:
				out[j] = (c << 2) & 0xFF;
				break;
			case 1:
				out[j++] |= (c >> 4) & 0x3;
				out[j] = (c & 0xF) << 4; 
				break;
			case 2:
				out[j++] |= (c >> 2) & 0xF;
				out[j] = (c & 0x3) << 6;
				break;
			case 3:
				out[j++] |= c;
				break;
		}
	}

	return j;
}

// You lose
void fail(){
	puts("You obviously can't push it to the limit...");
	printf("If I can give you an advice, check this out: %s\n", check_this_out);
	exit(EXIT_FAILURE);
}


int main(int argc, char** argv){

	unsigned char* guess = (char*) malloc(64);
	unsigned char* dec = (char*) malloc(64);
	unsigned const char* enc;
	size_t dec_len, enc_len;

	// Get the input
	printf("Can you push it to the limit ? ");
	fgets(guess, 63, stdin);
	guess[strcspn(guess, "\n")] = '\x00';

	if(strlen(guess) != 31){
		fail();
	}

	// enc = "=Olgn9sXNdl0"
	for(enc = check_this_out ; *enc != BASE64_PAD ; enc++);

	// enc = "0ldNXs9nglO="
	enc = UNO_REVERSE_CARD(enc);

	// dec = "\xd2\x57\x4d\x5e\xcf\x67\x82\x53"
	dec_len = decode(enc, strlen(enc), dec);

	for(int i=0 ; i < 31 ; i++){
		if((guess[i] ^ dec[i % dec_len]) != STRANGE[i]){
			fail();
		}
	}

	printf("Well done! You can validate with the flag Hero{%s}\n", guess);
	printf("(And watch a last time this : %s)", check_this_out);

	return EXIT_SUCCESS;
}
