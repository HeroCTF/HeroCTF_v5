BITS 64

; /!\ WARNING /!\
; Some dirty things are done in this code (again).
; Don't do this at home.

; +------------------------------------------------------+
; |                    SECTION .RDATA                    |
; -------------------------------------------------------+

section .rdata

hello db "Hello. Input please: ", 0
hello_len equ $ - hello

; +------------------------------------------------------+
; |                     SECTION .BSS                     |
; -------------------------------------------------------+

section .bss

unknown: resb 32

; +------------------------------------------------------+
; |                     SECTION .TEXT                    |
; -------------------------------------------------------+

section .text
global _start

get_input:
	push rbp
	mov rbp, rsp
	sub rsp, 32

	; SYS_READ(stdin, rsp, 180)
	xor edi, edi
	mov rsi, rsp
	mov rdx, 180
	xor eax, eax
	syscall

	leave
	ret

_start:
	; Write "Thanks. Good bye." in .bss buffer
	mov rdi, unknown
	mov rsi, 0x202e736b6e616854
	mov [rdi], rsi

	add rdi, 8
	mov rsi, 0x65796220646f6f47
	mov [rdi], rsi

	add rdi, 8
	mov rsi, 0x000a2e
	mov [rdi], rsi

	; SYS_WRITE(stdout, hello, hello_len)
	mov rdi, 1
	mov rsi, hello
	mov rdx, hello_len
	mov rax, 1
	syscall

	call get_input

	; SYS_WRITE(stdout, thanks, thanks_len)
	mov rdi, 1
	mov rsi, unknown
	mov rdx, 18
	mov rax, 1
	syscall

_exit:
	; SYS_EXIT(0)
	xor edi, edi
	mov rax, 0x3c
	syscall

; +-----------------------------+
; |   write "/bin/sh" in .bss   | OK
; |   RAX = 0x3b (SYS_EXECVE)   | OK
; |   RDI = char* name          | OK 
; |   RSI = char** argv         | OK (Don't touch hehe)
; |   RDX = char** envp = 0     | OK
; +-----------------------------+

_wtf:
; ********** Set RAX=0x3b **********
	pop			r11
	pop			r10
	movq 		xmm1, r10
	pinsrq		xmm1, r11, 1
	pcmpeqw		xmm2, xmm2
	pxor		xmm1, xmm2
    movdqu		xmm0, [unknown]
	pcmpistrm	xmm0, xmm1, 0b0001000
	movq		rax, xmm0
	not			ax
	rol			ax, 8

	; Cleanup
	xorps		xmm0, xmm0
	pxor		xmm1, xmm1
	vxorps		xmm2, xmm2, xmm2
	xor 		r10, r10
	xor 		r11, r11
	ret

; ********** SET RDX=0 **********
	; To confuse the issue
	mov al, 0x13
	syscall

	mov al, 0xf0
	syscall

	mov al, 0x49
	syscall

	; b0 99	--> mov al, 0x99
	; 99 	--> cdq (set rdx=0) 
	mov al, 0x99
	syscall

	mov al, 0xc3
	syscall

	mov al, 0xd6
	syscall

	mov al, 0x37
	syscall

	mov al, 0x42
	syscall

;  ********** Store "/bin/sh" in xmm0 **********
	pop r12
    pop r13
    pop r14
	pop r15

    movq xmm0, r13
    pinsrq xmm0, r12, 1

    movq xmm1, r15
    pinsrq xmm1, r14, 1

    PMADDWD xmm0, xmm1

	;;;;;;;;;;;;;;;;;;;;;;;;;;

    mov r10, 0x8080808080808080
    mov r11, 0x8080808008000C04

    movq xmm1, r11
    pinsrq xmm1, r10, 1

    PSHUFB xmm0, xmm1

	;;;;;;;;;;;;;;;;;;;;;;;;;;

    pop r12
    pop r13
    pop r14
	pop r15

    movq xmm1, r13
    pinsrq xmm1, r12, 1

    movq xmm2, r15
    pinsrq xmm2, r14, 1

    PMADDWD xmm1, xmm2

	;;;;;;;;;;;;;;;;;;;;;;;;;;

    movq xmm2, r11       
    pinsrq xmm2, r10, 1 

    PSHUFB xmm1, xmm2

	;;;;;;;;;;;;;;;;;;;;;;;;;;

    pslldq xmm1, 4
    ADDPS XMM0, XMM1 ; -----------> xmm0 = 0x0068732f6e69622f --> /bin/sh\x00
	; MOVQ r10, xmm0

	; Cleanup
	; xorps xmm0, xmm0
	pxor xmm1, xmm1
	vxorps xmm2, xmm2, xmm2
	xor r10, r10
	xor r11, r11
	xor r12, r12
	xor r13, r13
	xor r14, r14
	xor r15, r15
	ret

;  ********** Store address of .bss buffer in r11 **********
	; r10=0x0068732f6e69622f
	movq r10, xmm0
	pop r11 ; 0xd0a69697d08c0800
	bswap r11
	pext r11, r10, r11
	xor r10, r10
	ret

;  ********** Store xmm0 ("/bin/sh") in [r11] **********
    ; MOV [r11], lower_64bits(xmm0)
	VPEXTRQ [r11], xmm0, 0x42
	ret

; ********** Store r11 to RDI **********
	; Special gift for you my friend (it's fucking 3:30 am, I need to sleep.)
	xchg r11, rdi
	ret

; +--------------------------------------------+
; |    RANDOM NOTES (lost some IQ in there)    |
; +--------------------------------------------+

; ========== PSHUFB ==========
	; VALUE
	;   v16_int8 = {0x2f, 0x0, 0x0, 0x0, 0x62, 0x0, 0x0, 0x0, 0x69, 0x0, 0x0, 0x0, 0x6e, 0x0, 0x0, 0x0},
	;   uint128 = 0x6e00000069000000620000002f

	; MASK
	;   v16_int8 = {0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0xc, 0x8, 0x4, 0x0},
	;   uint128 = 0x0

	; RESULT         f     e     d     c     b    a    9    8    7    6    5    4    3    2    1    0
	;   v16_int8 = {0x2f, 0x62, 0x69, 0x6e, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0},
	;   uint128 = 6e69622f


; ========== PMADDWD ==========

    ; XMM0: 0000 0000 0032 0002 0016 0005 0014 0001
    ;         x    x    x    x    x    x    x    x 
    ; XMM1: 0000 0000 0002 0002 0005 0001 0002 0007
    ;        =n1  =n2  =n3  =n4  =n5  =n6  =n7  =n8

    ; n1 + n2 = 00     y1 (4 bytes)
    ; n3 + n4 = 68     y2 (4 bytes)
    ; n5 + n6 = 73     y3 (4 bytes)
    ; n7 + n8 = 2f     y4 (4 bytes)

    ; XMM0: 00000000 00000000 00000000 00000000
    ;          y1       y2       y3       y4


; ========== PEXT ==========

	; "/bin/sh" = 00000000 01101000 01110011 00101111 01101110 01101001 01100010 00101111
	; extract   = 00000000 00001001 10001100 11010000 11110001 10010110 10100010 11010000
	;			= 0x00098cd0f196a2d0
	; bswaped   = 0xd0a296f1d08c0900
	; 0x403018  = 01000000 00110000 00011000

; ========== pcmpistrm ==========

	; PCMPxSTRx --> String comparison
	; PCMPxSTRx xmm (patter to find), xmm/mem (string we are searching), imm8 (comparison)
		; 0 0    0                           0                       00     00
		; 0 (1)  Complement only valid bits  complement the result   test   data type

	; data type:
		; [ 00: Unsigned bytes ]
		; 01: Unsigned words
		; 10: Signed bytes
		; 11: Signed words

	; test:
		; 00: Subset (any characters specified in the patter, order doesn't matter)
		; 01: Ranges (characters specified by ranges pars: AZ, az, 09...)
		; [ 10: Matching characters 1 to 1 ]
		; 11: Substring search

	; (1):
		; Masks: 0=bit mask, [ 1=byte mask ]
		; Indices: 0=index of 1st match, 1=index of last match

	; =====> Use it to set RAX= 0x3b
	; 	PCMPESTRM - Explicit length, return mask
	;	PCMPISTRM - Implicit length, return mask
	; 	PCMPESTRI - Explicit length, return index
	;	PCMPISTRI - Implicit length, return index

	; 	Explicit: Lengths specified in the RAX and RDX registers
	; 	Implicit: Strings are NULL or 0 terminated strings

	; 	Mask: Results are returned as a mask of 1's and 0's
	;	Index: Index of first or final result is returned in RCX

	; 0000000000111011 --> 0x3b
	;             1101110000000000 --> Reversed
	; string2 db "AABAAABBBBBBBBBB"

	;			  1101110000000000
	;			  0010001111111111 --> not ax
	; string1 db "AAAAAAAAAAAAAAAA"
	; string2 db "BBABBBAAAAAAAAAA"

	;			  1111111100100011 --> rol 8
	; string1 db "AAAAAAAAAAAAAAAA"
	; string2 db "AAAAAAAABBABBBAA"

	; string1 db   "Thanks. Good bye"
	; string2 db   "Thanks. __o___ye"

	; 65795f5f5f6f5f5f202e736b6e616854
	; e y _ _ _ o _ _   . s k n a h T
	; rop += b"__o___ye"
	; rop += b"Thanks. "

	; 9a86a0a0a090a0a0dfd18c94919e97ab