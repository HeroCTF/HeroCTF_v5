from PIL import Image
import numpy as np
from math import *

def stringToBinary(string):
    return ''.join([format(ord(i), "08b") for i in string])

def fileToString(file_src):
    fileContent = ""
    file = open(file_src, 'r')
    while 1:
        # read by character
        char = file.read(1)         
        if not char:
            break  
        fileContent = fileContent + char
    file.close()
    return fileContent

def stringToFile(string, dst):
    file = open(dst, 'w')
    file.write(string)
    file.close()

def binaryArrayToString(binary):
    string_ints = [str(int) for int in binary]
    str_of_ints = "".join(string_ints)
    return ''.join([chr(int(binary[i:i+8], 2)) for i in range(0, len(str_of_ints), 8)])

def binaryToString(binary):
    return ''.join([chr(int(binary[i:i+8], 2)) for i in range(0, len(binary), 8)])

def encode(image_src, message_src):
    print("[-] Encoding... ")
    img = Image.open(image_src, 'r')
    width, height = img.size

    data = fileToString(message_src)
    print("[-] Message file opened !")
    array = np.array(list(img.getdata()))

    maximumSizeMessage = 200 * 200 
    print("[-] Maximum size of message: {} bits".format(maximumSizeMessage))

    bits_message = stringToBinary(data)
    print("[-] Message size in bits: {} bits".format(len(bits_message)))

    if len(bits_message) > maximumSizeMessage:
        print("[-] ERROR : Message is too big to be hide in the image :(")
        exit()
    else:
        print("[-] The is enough space to hide the message !")
    
    i = 0
    for x in range(0,200):
        for y in range(0,200):
            pixel = list(img.getpixel((x, y)))
            if (i < len(bits_message)):
                pixel[1] = pixel[1] & ~1 | int(bits_message[i])
                i  = i + 1
            img.putpixel((x, y), tuple(pixel)) 

    print("[-] Message encoded !")
    print("[-] Saving image...")
    print("[-] Done ! Image saved as secret.png")
    img.save("secret.png", "PNG")

def decode(src):
    print("[-] Decoding... ")
    
    extracted_bin = ""
    img = Image.open(src, 'r')

    width, height = img.size
    print("[-] Image size: {}x{}".format(width, height))
    for x in range(0, 200):
        for y in range(0, 200):
            pixel = list(img.getpixel((x, y)))
            extracted_bin = extracted_bin + str((pixel[1] & 1))
    
    stringToFile(binaryToString(extracted_bin), "extracted.txt")
    print("[-] Message extracted !")
    print("[-] Message saved as extracted.txt")

print("##########################################################")
print("######################## ENCODING ########################")
print("##########################################################")
encode('LSD.png','message.txt')
print("")

print("##########################################################")
print("######################## DECODING ########################")
print("##########################################################")
decode('secret.png')