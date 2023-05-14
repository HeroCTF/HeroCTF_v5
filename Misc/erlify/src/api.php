<?php
error_reporting(0);
if($_SERVER["REQUEST_METHOD"] === "POST")
{
    if(isset($_POST["code"]) && !empty($_POST["code"]))
    {
        try
        {
            if(strlen($_POST["code"]) < 1000)
            {
                $dirname = "/tmp/".uniqid();
                mkdir($dirname);
                file_put_contents($dirname."/code.erl",base64_decode($_POST["code"]));
                $handle = popen("cd ".$dirname.";HOME=/tmp erlc code.erl 2>&1","r");
                $msg = fread($handle,4096);
            }else $msg = "Your code is too long.";
        } catch (Exception $e)
        {
            $msg = "An error occuered, please try again.";
        }
    }else $msg = "Missing parameters.";
}
echo $msg;