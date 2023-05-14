#include <stdio.h>
#include <string.h>
#include <stdlib.h>

__uint64_t value = 0xAAAABBBBCCCCDDDD;


// This code will be executed before the main
__attribute__((constructor)) void hello(){
    puts("[!] Process is starting...");
}


// We don't want the classical GCC prologue and epilogue (I wanna see you naked naked naked)
// We don't want a x-ref to the value
__attribute__ ((naked)) void set_value() {
    __asm__ (
        // rax = 0x404058 (address of value)
        "push $0xFFFFFFFFFFBFBFA8\n"
        "pop %rax\n"
        "neg %rax\n"

        // rbx = 0xdeadbeefcafebabe
        "movabs $0xdeadbeefcafebabe, %rbx\n"
        
        // value = 0xdeadbeefcafebabe
        "mov %rbx, (%rax)\n"

        // return 0
        "xor %eax, %eax\n"
        "ret\n"
    );
}


int main() {
    FILE *fd;
    char chr;
    int count;

    if((fd = fopen("flag.txt", "r")) == NULL){
        puts("[-] Flag not found. If this happens in remote, contact an admin.");
        fflush(stdout);
        return EXIT_FAILURE;
    }

    if( value != 0xdeadbeefcafebabe ){
        puts("[-] Unfortunatly, you're not allowed to get the flag :(");
        fflush(stdout);
        return EXIT_FAILURE;
    }

    puts("[+] Here is your flag:");
    while((chr = getc(fd)) != EOF){
        printf("%c", chr);
    }
    
    fflush(stdout);
    fclose(fd);

  return EXIT_SUCCESS;
}