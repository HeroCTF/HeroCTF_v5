BITS 64

; /!\ WARNING /!\
; Some dirty things are done in this code (again).
; Don't do this at home.

; -------------------------------------------------------

section .rdata

hello db "Hello. So, you want to be a ROPedancer? ", 0
hello_len equ $ - hello

answer_no db "Well, let me know if you change your mind.", 0xa, 0
answer_no_len equ $ - answer_no

answer_yes db "Alright. Please enter an email on which we can contact you: ", 0
answer_yes_len equ $ - answer_yes

letter_message db "Thanks. You have 400 characters to convince me to hire you: ", 0
letter_message_len equ $ - letter_message

error_email db "This is not a valid email, don't waste my time.", 0xa, 0
error_email_len equ $ - error_email

good_bye db "We will get back to you soon. Good bye.", 0xa, 0
good_bye_len equ $ - good_bye

; -------------------------------------------------------

section .bss

motivation_letter: resb 400

; -------------------------------------------------------

section .text
global _start

; /////////////////////////////////////////////////////////////

check_email:
	xor eax, eax

_continue:
	mov al, [rdi]
	test al, al
	je _not_found

	cmp al, 0x40 ; '@'
	je _found
	inc rdi
	jmp _continue

_found:
	; Control RAX here ?
	xor eax, eax
	inc al

_not_found:
	ret

; ///////////////////////////////////////////////////////

_start:
	; SYS_WRITE(stdout, hello, hello_len)
	mov rax, 1
	mov rdi, 1
	mov rsi, hello
	mov rdx, hello_len
	syscall

_get_choice:
	; rsp = stack buffer of 4 bytes
	sub rsp, 4

	; SYS_READ(stdin, rsp, 4)
	xor eax, eax
	xor edi, edi
	mov rsi, rsp
	mov rdx, 4
	syscall

	; ebx = 4 bytes input
	mov ebx, DWORD [rsp]
	add rsp, 4

	; SYS_WRITE(stdout, answer_msg, answer_len)
	mov rax, 1
    mov rdi, 1
	cmp ebx, 0xa736579 ; compare answer to "yes\n"
	jne _choice_no

_choice_yes:
	mov rsi, answer_yes
	mov rdx, answer_yes_len
	syscall

	call get_motivation_letter
	jmp _exit

_choice_no:
	mov rsi, answer_no
    mov rdx, answer_no_len
    syscall

_exit:
	; SYS_EXIT(0)
	xor edi, edi
	mov rax, 0x3c
	syscall

; ///////////////////////////////////////////////////////

get_motivation_letter:
	; prologue
	push rbp
	mov rbp, rsp

	; Stack buffer of 16 bytes to store the email address
	sub rsp, 16

	; SYS_READ(stdin, rsp, 100) --> Buffer overflow !!!
	xor eax, eax
	xor edi, edi
	mov rsi, rsp
	mov rdx, 100 ; TOOD: CHANGE THIS TO THE MINIMUM
	syscall

	mov rdi, rsp
	call check_email

	test eax, eax
	jz _bad_email

	; SYS_WRITE(stdout, hello, hello_len)
	xor eax, eax
	inc al
	xor edi, edi
	inc edi
	mov rsi, letter_message
	mov rdx, letter_message_len
	syscall

	; SYS_READ(stdin, motivation_letter, 500)
	xor eax, eax
	xor edi, edi
	mov rsi, motivation_letter
	mov rdx, 500
	syscall

	; SYS_WRITE(stdout, good_bye, good_bye_len)
	mov rax, 1
	mov rdi, 1
	mov rsi, good_bye
	mov rdx, good_bye_len
	syscall

	jmp _get_motivation_letter_end


_bad_email:
	; SYS_WRITE(stdout, hello, hello_len)
	xor eax, eax
	inc al
	xor edi, edi
	inc edi
	mov rsi, error_email
	mov rdx, error_email_len
	syscall

_get_motivation_letter_end:
	mov rsp, rbp
	pop rbp
	ret