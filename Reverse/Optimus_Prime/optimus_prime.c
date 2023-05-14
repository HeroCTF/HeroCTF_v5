// gcc -s -Wno-unused-result -O3 -o optimus_prime optimus_prime.c

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

// #define DEBUG
#define GRID_SIZE 16

// leftrotate function definition, for md5
#define LEFTROTATE(x, c) (((x) << (c)) | ((x) >> (32 - (c))))

typedef unsigned char BYTE;

// GRID[row][col]
BYTE GRID[GRID_SIZE][GRID_SIZE];

// These vars will contain the md5 hash
__uint32_t h0, h1, h2, h3;

/*
============================== TAKUZU RULES ==============================

- Each row must not contain more than two 0s or two 1s in a row
- Each column must not contain more than two 0s or two 1s in a row
- The number of 0's and 1's must be equal in the same row
- The number of 0's and 1's must be equal in the same column
- No row or column can be identical

============================== SOLUTION ==============================

0:  0b01100110, 0b01001011
1:  0b10011011, 0b01001001
2:  0b11010100, 0b10110100
3:  0b00100110, 0b11001011
4:  0b11011001, 0b01001001
5:  0b11011001, 0b00110100
6:  0b00100110, 0b10110110
7:  0b10010011, 0b01001011
8:  0b11001001, 0b10011001
9:  0b01100100, 0b10110110
10: 0b00110110, 0b01101010
11: 0b10011001, 0b10010101
12: 0b01101010, 0b01100110
13: 0b10010100, 0b10011011
14: 0b00101101, 0b10110100
15: 0b01101011, 0b01100100

*/


#ifdef DEBUG
void print_grid() {

    // COLOR_RED   "\033[0;31m"
    // COLOR_GREEN "\033[0;32m"
    // COLOR_END   "\033[0m"

    printf("     ");
    for(int i = 0; i < GRID_SIZE; i++){
        printf("\033[0;32m%02d\033[0m ", i);
    }
    puts("\n   +------------------------------------------------");

    for (int i = 0; i < GRID_SIZE; i++) {
        for (int j = 0; j < GRID_SIZE; j++) {
            if(j == 0)
                printf("\033[0;31m%02d\033[0m | ", i);
            if(GRID[i][j] == 0xff)
                printf("__ ");
            else
                printf(" %01X ", GRID[i][j]);

        }
        printf("\n");
        // if(i != GRID_SIZE-1)
        //     printf("   |\n");
    }
}
#endif


// Grid init (why did I do it by hand ?)
__attribute__((constructor, section(".text"))) void init_grid(){
    
    // /!\ TW: absolutly not portable code, don't do this at home /!\ 
    // The goal here is to get the address of GRID without making a x-ref to it
    // I could have dynamically resolve the ".bss" address by parsing the in-memory ELF but it's not very discreet
    // --> useless because other parts of the grid are referenced... but well

    // only way I found to counter the gcc optimizations
    // (I won vs -O3, this all you need to know)
    int r = rand() + 0x1c;

    __uint64_t GRID_address = (__uint64_t)&h2;

    for(int i=0; i < 0x1c && i < r; i++){
        GRID_address++;
    }

#ifdef DEBUG
    printf("GRID address: %lx\n", (__uint64_t) GRID_address);
#endif

    memset((BYTE**) GRID_address, 0xFF, GRID_SIZE*GRID_SIZE);

    GRID[0][6] = 1;
    
    GRID[1][1] = 0;
    GRID[1][3] = 1;
    GRID[1][13] = 0;
    GRID[1][14] = 0;

    GRID[2][0] = 1;
    GRID[2][4] = 0;
    GRID[2][7] = 0;
    GRID[2][9] = 0;
    GRID[2][14] = 0;

    GRID[3][4] = 0;
    GRID[3][7] = 0;
    GRID[3][10] = 0;
    GRID[3][13] = 0;

    GRID[4][1] = 1;
    GRID[4][3] = 1;
    GRID[4][8] = 0;
    GRID[4][10] = 0;
    GRID[4][12] = 1;
    GRID[4][15] = 1;

    GRID[5][0] = 1;
    GRID[5][5] = 0;
    GRID[5][11] = 1;

    GRID[6][1] = 0;
    GRID[6][3] = 0;
    GRID[6][6] = 1;
    GRID[6][13] = 1;

    GRID[7][1] = 0;
    GRID[7][2] = 0;
    GRID[7][7] = 1;
    GRID[7][9] = 1;

    GRID[8][7] = 1;
    GRID[8][9] = 0;
    GRID[8][10] = 0;
    GRID[8][13] = 0;

    GRID[9][0] = 0;
    GRID[9][1] = 1;
    GRID[9][6] = 0;
    GRID[9][14] = 1;

    GRID[10][0] = 0;
    GRID[10][10] = 1;
    GRID[10][14] = 1;

    GRID[11][1] = 0;
    GRID[11][5] = 0;
    GRID[11][13] = 1;

    GRID[12][0] = 0;
    GRID[12][5] = 0;

    GRID[13][9] = 0;
    GRID[13][11] = 1;
    GRID[13][15] = 1;

    GRID[14][0] = 0;
    GRID[14][1] = 0;
    GRID[14][4] = 1;
    GRID[14][8] = 1;
    GRID[14][10] = 1;
    GRID[14][11] = 1;
    GRID[14][14] = 0;

    GRID[15][5] = 0;
    GRID[15][12] = 0;
    GRID[15][14] = 0;
}


// potentially inlined
size_t my_strlen(char* string){
    char* ptr;
    for(ptr=string ; *ptr ; ptr++);
    return ptr - string;
}


/*
input[0],input[1]
input[2],input[3]
...
input[12],input[13]
input[14],input[15]
*/
void parse_buffer_to_grid(BYTE* buffer) {
    int byte_index;
    int bit_position;

    for (int i = 0; i < 16; i++) {
        for (int j = 0; j < 16; j++) {
            // Get the corresponding byte from the buffer
            byte_index = (i * 16 + j) / 8;

            // Get the bit position within the byte (0-7)
            bit_position = 7 - (j % 8);

            // Extract the bit and store it in the grid
            if(GRID[i][j] == 0xff){
                GRID[i][j] = (buffer[byte_index] >> bit_position) & 1;
            }
        }
    }
}


/*
- Each row must not contain more than two 0s or two 1s in a row
- Each column must not contain more than two 0s or two 1s in a row
*/
bool check_adjacent_numbers() {
    for (int i = 0; i < 16; i++) {
        // Number of 
        int count0 = 0;
        int count1 = 0;

        for (int j = 0; j < 15; j++) {

            if (GRID[i][j] == GRID[i][j+1]) {
                if (GRID[i][j] == 0) {
                    if(++count0 > 1){
#ifdef DEBUG
                        printf("[FAIL] count0 (GRID[%d][%d])\n", i, j);
#endif
                        return false;
                    }

                } else if (GRID[i][j] == 1) {
                    if(++count1 > 1){
#ifdef DEBUG
                        printf("[FAIL] count1 (GRID[%d][%d])\n", i, j);
#endif
                        return false;
                    }
                }
            } else {
                count0 = 0;
                count1 = 0;
            }
        }
    }
    return true; // Passed the check
}


/*
- The number of 0's and 1's must be equal in the same row
- The number of 0's and 1's must be equal in the same column
*/
bool check_number_of_numbers() {
    // For each row and column, store 2 values :
    // - number of 0's
    // - number of 1's
    BYTE rowCount[16][2];
    BYTE colCount[16][2];

    memset(rowCount, 0, 16*2);
    memset(colCount, 0, 16*2);

    for (int i = 0; i < 16; ++i) {
        for (int j = 0; j < 16; ++j) {

            // Increment the corresponding row and column counts
            rowCount[i][ GRID[i][j] ]++;
            colCount[j][ GRID[i][j] ]++;
        }
    }

    // Check if the number of 0's and 1's is equal in each column and row
    for (int i = 0; i < 16; ++i) {
        if (rowCount[i][0] != rowCount[i][1]) {
#ifdef DEBUG
            printf("[FAIL] nb0 != nb1 (row n°%d --> 0=%d, 1=%d)\n", i, rowCount[i][0], rowCount[i][1]);
#endif
            return false;

        } else if (colCount[i][0] != colCount[i][1]) {
#ifdef DEBUG
            printf("[FAIL] nb0 != nb1 (column n°%d--> 0=%d, 1=%d)\n", i, colCount[i][0], colCount[i][1]);
#endif
            return false;
        }
    }

    return true;
}


/*
- No row or column can be identical
*/
__uint16_t hashRowOrColumn(unsigned char rowOrColumn[16]) {
    __uint16_t hash = 0;
    for (int i = 0; i < 16; ++i) {
        hash = (hash << 1) | rowOrColumn[i];
    }
    return hash;
}

bool hasUniqueRowsAndColumns() {
    __uint16_t rowHashes[16];
    __uint16_t colHashes[16];

    // Calculate hashes for rows and columns
    for (int i = 0; i < 16; ++i) {
        BYTE row[16];
        BYTE col[16];

        for (int j = 0; j < 16; ++j) {
            row[j] = GRID[i][j];
            col[j] = GRID[j][i];
        }

        rowHashes[i] = hashRowOrColumn(row);
        colHashes[i] = hashRowOrColumn(col);
    }

    // Check for duplicate row hashes
    for (int i = 0; i < 16; ++i) {
        for (int j = i + 1; j < 16; ++j) {
            if (rowHashes[i] == rowHashes[j]) {
#ifdef DEBUG
                printf("[FAIL] equals rowHashes (rowHashes[%d]=%x, rowHashes[%d]=%x)\n", i, rowHashes[i], j, rowHashes[j]);
#endif
                return false;
            }
        }
    }

    // Check for duplicate column hashes
    for (int i = 0; i < 16; ++i) {
        for (int j = i + 1; j < 16; ++j) {
            if (colHashes[i] == colHashes[j]) {
#ifdef DEBUG
                printf("[FAIL] equals colHashes (colHashes[%d]=%x, colHashes[%d]=%x)\n", i, colHashes[i], j, colHashes[j]);
#endif
                return false;
            }
        }
    }

    return true;
}


/*
Check for all rules
*/
bool check() {
    if(hasUniqueRowsAndColumns() && check_number_of_numbers() && check_adjacent_numbers()){
        return true;
    }

    return false;
}


/////////////////////////////////////////////////////////////////////////////////////////////

/*
 * Simple MD5 implementation, by Tim Caswell (creationix)
 * --> https://gist.github.com/creationix/4710780
 * (thanks)
 */
void md5(__uint8_t *initial_msg, size_t initial_len) {
 
    // Message (to prepare)
    __uint8_t *msg = NULL;
 
    // Note: All variables are unsigned 32 bit and wrap modulo 2^32 when calculating
 
    // r specifies the per-round shift amounts
 
    __uint32_t r[] = {7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
                    5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
                    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
                    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21};

    // Use binary integer part of the sines of integers (in radians) as constants// Initialize variables:
    __uint32_t k[] = {
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
        0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
        0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
        0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
        0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
        0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
        0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
        0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
        0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
        0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
        0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
        0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391};
 
    h0 = 0x67452301;
    h1 = 0xefcdab89;
    h2 = 0x98badcfe;
    h3 = 0x10325476;
 
    // Pre-processing: adding a single 1 bit
    //append "1" bit to message    
    /* Notice: the input bytes are considered as bits strings,
       where the first bit is the most significant bit of the byte.[37] */
 
    // Pre-processing: padding with zeros
    //append "0" bit until message length in bit ≡ 448 (mod 512)
    //append length mod (2 pow 64) to message
 
    int new_len = ((((initial_len + 8) / 64) + 1) * 64) - 8;
 
    msg = calloc(new_len + 64, 1); // also appends "0" bits 
                                   // (we alloc also 64 extra bytes...)
    memcpy(msg, initial_msg, initial_len);
    msg[initial_len] = 128; // write the "1" bit
 
    __uint32_t bits_len = 8*initial_len; // note, we append the len
    memcpy(msg + new_len, &bits_len, 4);           // in bits at the end of the buffer
 
    // Process the message in successive 512-bit chunks:
    //for each 512-bit chunk of message:
    int offset;
    for(offset=0; offset<new_len; offset += (512/8)) {
 
        // break chunk into sixteen 32-bit words w[j], 0 ≤ j ≤ 15
        __uint32_t *w = (__uint32_t *) (msg + offset);

        // Initialize hash value for this chunk:
        __uint32_t a = h0;
        __uint32_t b = h1;
        __uint32_t c = h2;
        __uint32_t d = h3;
 
        // Main loop:
        __uint32_t i;
        for(i = 0; i<64; i++) { 
            __uint32_t f, g;
 
             if (i < 16) {
                f = (b & c) | ((~b) & d);
                g = i;
            } else if (i < 32) {
                f = (d & b) | ((~d) & c);
                g = (5*i + 1) % 16;
            } else if (i < 48) {
                f = b ^ c ^ d;
                g = (3*i + 5) % 16;          
            } else {
                f = c ^ (b | (~d));
                g = (7*i) % 16;
            }

            __uint32_t temp = d;
            d = c;
            c = b;
            b = b + LEFTROTATE((a + f + k[i] + w[g]), r[i]);
            a = temp;
        }
 
        // Add this chunk's hash to result so far:
 
        h0 += a;
        h1 += b;
        h2 += c;
        h3 += d;
    }
 
    free(msg);
}

/////////////////////////////////////////////////////////////////////////////////////////////

int main(void){
    __uint8_t *p;
    char *input = (char*) malloc(33);

    printf("Autobots, transform and roll out! Bumblebee, give me the password: ");
    fgets(input, 33, stdin);
    input[strcspn(input, "\n")] = 0;

    if(my_strlen(input) != 32){
        puts("Autobots, fall back! Get to the tower!");
        return EXIT_FAILURE;
    }

    parse_buffer_to_grid(input);

#ifdef DEBUG
    puts("");
    print_grid();
    puts("");
#endif

    if(check()){
        md5(input, my_strlen(input));
        printf("Stay safe, soldier. I am coming. Hero{");
 
        p = (__uint8_t *) &h0;
        printf("%2.2x%2.2x%2.2x%2.2x", p[0], p[1], p[2], p[3]);
    
        p= (__uint8_t *) &h1;
        printf("%2.2x%2.2x%2.2x%2.2x", p[0], p[1], p[2], p[3]);
    
        p= (__uint8_t *) &h2;
        printf("%2.2x%2.2x%2.2x%2.2x", p[0], p[1], p[2], p[3]);
    
        p= (__uint8_t *) &h3;
        printf("%2.2x%2.2x%2.2x%2.2x}.\n", p[0], p[1], p[2], p[3]);

    }else{
        puts("Autobots, fall back! Get to the tower!");
        return EXIT_FAILURE;
    }
    
    return EXIT_SUCCESS;
}