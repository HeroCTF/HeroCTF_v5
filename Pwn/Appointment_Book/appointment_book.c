// gcc -no-pie -Wl,-z,norelro -o appointment_book appointment_book.c

#include <time.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>

#define NB_APPOINTMENTS 8

typedef struct {
    time_t time;
    char* message;
} appointment_t;

appointment_t appointments[NB_APPOINTMENTS];


// ret2win here !!!
void __attribute__((used)) debug_remote(){
    system("/bin/sh");
}


// Convert formated date string to UNIX timestamp
time_t date_to_timestamp(const char *date_time_str) {
    struct tm input_time;
    time_t timestamp;

    // Parse the user input and populate the input_time struct
    if (sscanf(date_time_str, "%d-%d-%d %d:%d:%d",
               &input_time.tm_year,
               &input_time.tm_mon,
               &input_time.tm_mday,
               &input_time.tm_hour,
               &input_time.tm_min,
               &input_time.tm_sec) != 6) {

        puts("[-] Invalid date and time format!");
        fflush(stdout);
        exit(EXIT_FAILURE);
    }

    // Adjust the input_time values to match the struct tm format
    input_time.tm_year -= 1900;
    input_time.tm_mon -= 1;
    input_time.tm_isdst = -1; // Let the system determine if daylight saving is in effect

    // Convert the input_time struct to a UNIX timestamp
    timestamp = mktime(&input_time);
    if (timestamp == -1) {
        puts("[-] Error converting the date and time to a UNIX timestamp");
        fflush(stdout);
        exit(EXIT_FAILURE);
    }

    return timestamp;
}


// Convert UNIX timestamp to formated date string
char* timestamp_to_date(time_t timestamp) {
    struct tm *output_time;
    char* buffer = (char*) malloc(32);

    // Convert the UNIX timestamp to a struct tm
    output_time = localtime(&timestamp);
    if (output_time == NULL) {
        puts("[-] Error converting the UNIX timestamp to a date and time");
        fflush(stdout);
        exit(EXIT_FAILURE);
    }

    // Format the struct tm as a date and time string
    strftime(buffer, 32, "%Y-%m-%d %H:%M:%S", output_time);

    return buffer;
}


// Create an appointment
void create_appointment(){
    int index;
    appointment_t* appointment;

    char* date_time_str = (char*) malloc(32);
    char* message = (char*) malloc(64);
    
    memset(date_time_str, 0, 32);
    memset(message, 0, 64);
    
    do {
        printf("[+] Enter the index of this appointment (0-7): ");
        fflush(stdout);

        scanf("%d", &index);
        getchar();

    } while(index > 7);
    

    appointment = &appointments[index];

    printf("[+] Enter a date and time (YYYY-MM-DD HH:MM:SS): ");
    fflush(stdout);

    fgets(date_time_str, 30, stdin);
    appointment->time = date_to_timestamp(date_time_str);

    printf("[+] Converted to UNIX timestamp using local timezone: %ld\n", appointment->time);

    printf("[+] Enter an associated message (place, people, notes...): ");
    fflush(stdout);

    fgets(message, 62, stdin);
    appointment->message = message;

    free(date_time_str);
}


// List appointments
void list_appointments(){
    appointment_t* appointment;

    puts("\n[+] List of appointments: ");
    fflush(stdout);

    for(int i=0 ; i < NB_APPOINTMENTS ; i++){
        appointment = &appointments[i];

        printf("- Appointment n°%d:\n", i+1);
        if(appointment->message){
            printf("\t- Date: %s\n", timestamp_to_date(appointment->time));
            printf("\t- Message: %s\n", appointment->message);
        
        } else {
            printf("\t[NO APPOINTMENT]\n");
        }
        fflush(stdout);
    }
}


// Print menu and get choice
int menu(){
    int choice;
    
    puts("\n***** Select an option *****");
    puts("1) List appointments");
    puts("2) Add an appointment");
    puts("3) Exit");

    printf("\nYour choice: ");
    fflush(stdout);
    
    scanf("%d", &choice);
    getchar();

    return choice;
}


int main(void){
    int index;
    int choice;
    time_t now;

    memset(&appointments, 0, sizeof(appointments));
    puts("========== Welcome to your appointment book. ==========");

    now = time(NULL);
    printf("\n[LOCAL TIME] %s\n", timestamp_to_date(now));
    fflush(stdout);

    while(0x1337){
        choice = menu();

        switch(choice){
            case 1:
                list_appointments();
                break;

            case 2:
                create_appointment();
                break;

            case 3:
                puts("\n[+] Good bye!");
                fflush(stdout);
                exit(EXIT_FAILURE);
                break;

            default:
                puts("\n[-] Unknwon choice\n");
                fflush(stdout);
                break;
        }
    }

    exit(EXIT_SUCCESS);
}
