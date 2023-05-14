#include <stdio.h>
#include <stdlib.h>
#include <uuid/uuid.h>
#include <unistd.h>

#define NB_PATCHES 5

#define SECTION_PLT_START	0x1020
#define SECTION_TEXT_END	0x12F6

#define SECTION_GOT_START  	0x3FF0
#define SECTION_GOT_PLT_END	0x4040

// gcc -o sELF_control sELF_control.c -luuid

int main(){
	uuid_t binuuid;
	int ch;
	long int offset;
	unsigned int value;
	char* uuid;
	char execute[100], xxd[50];
	FILE *original, *copy;

	printf( "██╗  ██╗███████╗██████╗  ██████╗  ██████╗████████╗███████╗\n"
			"██║  ██║██╔════╝██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔════╝\n"
			"███████║█████╗  ██████╔╝██║   ██║██║        ██║   █████╗  \n"
			"██╔══██║██╔══╝  ██╔══██╗██║   ██║██║        ██║   ██╔══╝  \n"
			"██║  ██║███████╗██║  ██║╚██████╔╝╚██████╗   ██║   ██║     \n"
			"╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝   ╚═╝   ╚═╝     \n");
	printf("=============== sELF control v3 (by SoEasY) ===============\n\n");
	fflush(stdout);

	// You are judging me ? Don't. Not cool bro.
	system("bash -c \"/bin/rm /tmp/* >& /dev/null\"");

	uuid = (char*) malloc(50);
	sprintf(uuid, "/tmp/");
	// Don't do this at home kids
	uuid += 5;
	uuid_generate_random(binuuid);
	uuid_unparse(binuuid, uuid);
	// This is done by professionals
	uuid -= 5;

	original = fopen("get_flag", "rb");
	copy = fopen(uuid, "wb");

	if(original == NULL){
		printf("[-] Impossible to open the original file.\n");
		return 1;
	}

	while((ch = fgetc(original)) != EOF)
		fputc(ch, copy);

	fclose(original);
	fclose(copy);

	for(int i=0; i < NB_PATCHES; i++){
		copy = fopen(uuid, "r+");
		offset = 0;

		if(copy == NULL){
			printf("[-] Impossible to open the temporary file.\n");
			return 1;
		}
		
		printf("\n[+] Patch n°%d/%d\n", i+1, NB_PATCHES);

		printf("- Offset of the byte to patch in hex (example: %04X) : ", rand() % 0xffff);
		fflush(stdout);
		scanf("%lx", &offset);

		// Nice bypass found by stoopid#4736
		if(offset >= 0 && offset <= 3){
			puts("[-] You can't patch the ELF magic bytes :)");
			fflush(stdout);
			fclose(copy);
			break;
		}

		// Are you trying to bypass the if(value == 0xdeadbeefcafebabe) ?????
		if(offset >= SECTION_PLT_START && offset <= SECTION_TEXT_END){
			puts("[-] You can't patch the .plt, .plt.sec or .text sections :)");
			fflush(stdout);
			fclose(copy);
			break;
		}

		// Are you trying to 
		if(offset >= SECTION_GOT_START && offset <= SECTION_GOT_PLT_END){
			puts("[-] You can't patch the .got or .got.plt sections :)");
			fflush(stdout);
			fclose(copy);
			break;
		}

		printf("- Value to put at this offset in hex (example: %02X) : ", rand() % 32);
		fflush(stdout);
		scanf("%x", &value);

		fseek(copy, offset, SEEK_SET);
		fputc(value, copy);
	
		fclose(copy);
	}

	/*
	printf("\n[+] ELF header : \n");
	sprintf(xxd, "xxd %s | head\x00", uuid);
	system(xxd);
	*/

	printf("\n[+] Execution : \n");
	fflush(stdout);
	sprintf(execute, "chmod +x %s && %s", uuid, uuid);
	system(execute);
	
	remove(uuid);
	return 0;
}
