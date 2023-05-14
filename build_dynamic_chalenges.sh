#!/bin/bash

PWD=$(pwd)

function build() {
    path=$1
    image_name=$2

    pushd "${PWD}/${path}"
    docker build . -t "$image_name"
    popd
}

# Image tag supports only lowercase letters
build "./Misc/pyjail" "pyjail:latest"
build "./Misc/pygulag" "pygulag:latest"
build "./Misc/Irreductible" "irreductible:latest"
build "./System/SUDOkLu" "sudoklu:latest"
build "./Web/Drink_from_my_Flask_1" "drink_from_my_flask:latest"
build "./Forensics/My_Poor_Webserver" "my_poor_webserver:latest"
build "./Web/Best_Schools/src" "best_schools:latest"
build "./Misc/I_Use_Zsh_Btw" "i_use_zsh_btw:latest"
build "./System/IMF0/Dockers/backup" "imf_backup:latest"
build "./System/IMF0/Dockers/dev" "imf_dev:latest"
build "./System/Chm0d" "chm0d:latest"
build "./Web/blogodogo/blogodogo" "blogodogo:latest"
docker pull redis:7-alpine