from string import digits
from PIL import Image

def convertImageToGreyscale(image):
    return image.convert('L')

def openImage(imagePath):
    return Image.open(imagePath)

def saveImage(image, imagePath):
    image.save(imagePath)   

# Return an array of digits
def decimalToBaseArray(n, b):
    if n == 0:
        return [0]
    digits = []
    while n:
        digits.append(int(n % b))
        n //= b
    return digits[::-1]

def baseToDecimalArray(num,base):  # Maximum base - 36
    dec_num = 0
    for i in range(len(num)):
        dec_num += int(num[i])*(base**(len(num)-i-1))
    return dec_num

# Return a string of digits
def decimalToBaseString(num,base):  # Maximum base - 36
    base_num = ""

    if num == 0:
        return "0"

    while num > 0:
        dig = int(num%base)
        if dig<10:
            base_num += str(dig)
        else:
            base_num += chr(ord('A')+dig-10)  # Using uppercase letters
        num //= base

    base_num = base_num[::-1]  # To reverse the string
    return base_num

def flatten2DArray(array):
    return [item for sublist in array for item in sublist]

def array1DToPicture(array, width, height):
    stegoImage = Image.new('L', (width, height))
    for i in range(height):
        for j in range(width):
            stegoImage.putpixel((j,i), array[i*width+j])

    return stegoImage
            

def computeF(pixels,modulo,n):
    f = 0
    for i in range(0,n):
        f += pixels[i] * (i+1)

    return f % modulo

def hideDataWithEMD(image, data, n, output):

    # Check if the image is in greyscale
    if image.mode != 'L':
        image = convertImageToGreyscale(image)
        print('[-] Image converted to greyscale')
    else:
        print('[+] Image is already in greyscale')

    modulo = 2*n+1
    print("[-] Modulo = " + str(modulo))

    # Iterate through the chars of the data and convert them to base n
    # Each secret digit falls within [0, 2n].
    secret = []
    for char in data:
        secret.append(decimalToBaseArray(ord(char),modulo))
    flattenSecret = flatten2DArray(secret)
    print("[-] Secret message has been converted into base " + str(modulo))

    # Compute width and height of the image
    width, height = image.size
    print("[-] Image size: " + str(width) + "x" + str(height))

    digitSecret = 0
    
    # Get all pixels in a 1D array
    pixels = list(image.getdata())

    # Get the maximum number of pixels where grous can be formed
    usableSize = int((len(pixels)) - (len(pixels) % n))
    print("[-] Usable size = " + str(usableSize))

    # Check if the image is big enough to hide the data
    if usableSize / n < len(flattenSecret):
        print("[-] Image is not big enough to hide the data")
        return
    else:
        print("[-] Image is big enough to hide the data")

    coverPixelList = []

    # Iterate over pixels and group the pixels in pairs 
    for i in range(0,usableSize,n):
        
        if digitSecret >= len(flattenSecret):
            lastIndex = i
            break

        # We compute the value of d
        d = int(decimalToBaseString(flattenSecret[digitSecret],modulo))

        # We compute the value of f
        pixelList = pixels[i:i+n]
        f = computeF(pixelList,modulo,n)

        if d != f:
                s = (d - f) % (modulo)
                if s <= n:
                    # If s < n, we add 1 to the pixel in position s
                    # print("[-]",digitSecret,"Digit",d,"Adding 1 to pixel " + str(s))
                    pixelList[s-1] += 1
                elif s > n:
                    # If s > n, we subtract 1 to the pixel in position 2n+1-s
                    # print("[-]",digitSecret,"Digit",d,"Subtracting 1 to pixel " + str(2*n+1-s))
                    pixelList[(2*n+1-s)-1] -= 1
        # else:
            # print("[-]",digitSecret,"Digit",d,"No change needed")
        
        coverPixelList.append(pixelList)
        digitSecret += 1

    # Add the remaining pixels
    coverPixelList.append(pixels[lastIndex:])
    coverPixelList = flatten2DArray(coverPixelList)
    
    # Transform the 1D pixels array into a picture
    stegoImage = array1DToPicture(coverPixelList, width, height)
    print("[-] Data has been hidden in the image")
    saveImage(stegoImage, output)
    print("[-] Stego image saved as " + output)

def retrieveDataWithEMD(image, n, sizeFlag):
    # Check if the image is in greyscale
    if image.mode != 'L':
        print("[-] Image is not in greyscale")
        return

    modulo = 2*n+1
    print("[-] Modulo = " + str(modulo))

    # Compute width and height of the image
    width, height = image.size
    print("[-] Image size: " + str(width) + "x" + str(height))
    
    secret = []
    pixels = list(image.getdata())
    usableSize = int((len(pixels)) - (len(pixels) % n))
    print("[-] Usable size = " + str(usableSize))

    numberOfGroupFor1Char = len(decimalToBaseArray(ord('a'),modulo))
    print("[-] Number of pixels groups required to hide 1 char : " + str(numberOfGroupFor1Char))

    for i in range(0,usableSize,n):

        if len(secret) >= sizeFlag * numberOfGroupFor1Char:
                break

        # We compute the value of f
        pixelList = pixels[i:i+n]
        d = computeF(pixelList,modulo,n)
        secret.append(d)

        secretChars = []

        for i in range(0,len(secret),numberOfGroupFor1Char):
            secretChars.append(chr(baseToDecimalArray(secret[i:i+numberOfGroupFor1Char],modulo)))

        s = ''.join(str(x) for x in secretChars)
    print(secret)
    print("[-] Secret message: " + s)


def main():
    image = openImage('vannes.png')
    hideDataWithEMD(image, 'Where the ocean ventures so far inland, the Regional Natural Park of the Gulf of Morbihan remains an open space with multiple influences that proudly claims its roots and culture.   Listed in the Club of the most beautiful bays in the world, the Gulf of Morbihan is home to some forty islands nestled in a small inland sea 5 km wide and 21 km long. It opens on the Atlantic Ocean through a one kilometer wide gulf located between Port-Navalo and Locmariaquer. Nestled at the bottom of the bay, the city of Vannes is 25 kilometers from the ocean.  All year round, you can embark on a cruise boat to discover the Gulf of Morbihan by sea. Set sail on a heritage sailboat to better feel the roll and pitch of Mor Braz, this vast bay that spans the southern flanks of Morbihan. Well done, the flag is Hero[V4NN3S_C17Y_F7W], I hope you enjoyed it', 2,"vannesHidden.png")
    retrieveDataWithEMD(openImage("vannesHidden.png"),2,841)
main()