// gcc -no-pie -Wno-format-security -o impossible_v2 impossible_v2.c aes.c

#include <time.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "aes.h"

#define MSG_SIZE 40

// AES implem source : https://github.com/noahp/aes_c

unsigned char* expected = "\xde\xad\xbe\xef\xde\xad\xbe\xef\xca\xfe\xba\xbe\xca\xfe\xba\xbe" ;

unsigned char key[16];
unsigned char message[MSG_SIZE];

int main(void){
    FILE* fd;
    unsigned char tmp_message[MSG_SIZE];
    char c;

    printf("I've implemented a 1-block AES ECB 128 cipher that uses a random key.\n"
           "Try to give me a message such as AES_Encrypt(message, key) = 0xdeadbeefdeadbeefcafebabecafebabe.\n"
           "(don't try too much, this is impossible).\n\n");
    fflush(stdout);

    fd = fopen("/dev/urandom", "rb");
    fread(key, 16, 1, fd);
    fclose(fd);

    printf("Enter your message: ");
    fflush(stdout);

    fgets(tmp_message, MSG_SIZE, stdin);
    sprintf(message, tmp_message);

    printf("Do you want to change it ? (y/n) ");
    fflush(stdout);
    c = getc(stdin);

    // get the "\n"
    getc(stdin);

    if(c == 'y'){
        printf("Enter your message (last chance): ");
        fflush(stdout);
        
        fgets(tmp_message, MSG_SIZE, stdin);
        sprintf(message, tmp_message);
    }

    printf("So, this is your final message: ");
    for(int i=0 ; i < MSG_SIZE ; i++){
        printf("%02x", message[i]);
    }
    puts("\n");
    fflush(stdout);

    AES_Encrypt(message, key);

    if(memcmp(message, expected, 16) == 0){
        puts("WHAT ?! THIS IS IMPOSSIBLE !!!");
        
        fd = fopen("flag.txt", "r");
        while((c = getc(fd)) != EOF){
            printf("%c", c);
        }
        fflush(stdout);
        
        fclose(fd);
    
    } else {
        puts("Well, I guess you're not this smart :)");
        fflush(stdout);
    }

    return EXIT_SUCCESS;
}