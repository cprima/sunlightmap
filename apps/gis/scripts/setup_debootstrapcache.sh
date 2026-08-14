#!/usr/bin/env bash
#/** 
#  * This script does...
#  * 
#  * Copyright (c) 2016 Christian Prior
#  * Licensed under the MIT License. See LICENSE file in the project root for full license information.
#  * 
#  * Usage:
#  *
#  *
#  */

set -o nounset #exit on undeclared variable

__CONFDIR='/etc/slm'                  #e
__CODENAME='xenial'                   #n
__LOCALCACHEDIR='/var/cache/mirror'   #l
__CACHEWARMONLY='false'               #w
_VERBOSE='false'                      #v

#http://stackoverflow.com/questions/18215973/how-to-check-if-running-as-root-in-a-bash-script
#The script needs root permissions to create the filesystem and manipulate the installation on the SD card
_SUDO=''
if (( $EUID != 0 )); then
  while true; do sudo ls; break; done
  _SUDO='sudo'
fi; #from now on this is possible: $SUDO some_command

#check if directories exist or create them
for d in '/tmp' '/var/lib/container'; do
  if [ ! -d $d ]; then ${_SUDO} mkdir -p ./$d; fi
done

while getopts ":hvwe:d:n:" opt; do
  case $opt in
    w) __CACHEWARMONLY="true"
    ;;
    e) __CONFDIR=$OPTARG
    ;;
    l) __CACHEDIR=$OPTARG
    ;;
    n) __CODENAME=$OPTARG
    ;;
    v) _VERBOSE="true"
    ;;
    \?) echo "Invalid option -$OPTARG" >&2; echo -n "continuing "; sleep 1; echo -n "."; sleep 1; echo -n "."; sleep 1; echo ".";
    ;;
  esac;
done

#/**
#  * helper functions
#  *
#  */

#Trying to keep this to a minimum.
#Script tested and developed on Ubuntu 16.04
checkrequirements() {
  i=0;
  type debootstrap >/dev/null 2>&1 || { echo >&2 "This script requires debootstrap but it is not installed. ";  i=$((i + 1)); }
  type apt-ftparchive >/dev/null 2>&1 || { echo >&2 "This script requires apt-ftparchive but it is not installed. ";  i=$((i + 1)); }
  type nc >/dev/null 2>&1 || { echo >&2 "This script requires nc (netcat) but it is not installed. ";  i=$((i + 1)); }

  if [[ $i > 0 ]]; then echo "Aborting."; echo "Please install the missing dependency."; exit 1; fi
} #end function checkrequirements


#/**
#  *
#  * As much configuration as necessary, as many conventions as sensible. Hopefully.
#  *
#  * The basic configuration           :
#  * __CONFDIR            : Will be used for ...
#  * __CACHEDIR         : Will be used for ...
#  * __CODENAME         : Will be used for ...
#  *
#  * Functional stuff:
#  * __CACHWARMONLY: Skips all this configurating
#  *
#  */

#wrapped in function, called later
do_prompt_configuration() {

  echo ""

  while true; do
    echo "This script is currently limited to Ubuntu 16.04, codename xenial"
    read -e -p "Which codename do you want to mirror? " -i "${__CODENAME}" __CODENAME
    if [[ "$__CODENAME" =~ ^xenial$ ]]; then
       break;
    else
      echo "${__CODENAME} is not valid, only xenial is implemented yet"
    fi
  done

  # while true; do
  #   read -e -p "How many cluster nodes in total shall be generated onto SD cards? [1-9] " -i "${__COUNT}" __COUNT
  #   if ! [ "$__COUNT" -eq "$__COUNT" ] 2> /dev/null ; then
  #     echo "Integer input values only."
  #   else
  #     if [ "$__COUNT" -le 9 -a "$__COUNT" -ge 1 ] ; then break; else echo "1-9 only"; fi
  #   fi
  # done
  
  while true; do
    read -e -p "Enter the location of the folder for configuration files: " -i "${__CONFDIR}" __CONFDIR
    if [ ! -z ${__CONFDIR} ]; then break; fi
  done
  
  while true; do
    read -e -p "Enter the location of the cache on the disk: " -i "${__LOCALCACHEDIR}" __LOCALCACHEDIR
    if [ ! -z ${__LOCALCACHEDIR} ]; then break; fi
  done

}


######################################################################
#/**
#  * Main part
#  *
#  */


clear
echo "This script will ask for (or automatically use existing) sudo permissions!"
#echo "There will be additional prompts before anything gets overwritten."
#echo "Like this one:"
while true; do
  read -p "Do you want to continue? [Yn] " yn
  [ -z "$yn" ] && yn="y"
  case $yn in
    [Yy]* ) break;;
    [Nn]* ) echo "Exiting."; exit;;
    * ) echo "Please answer yes or no.";;
  esac
done

if [ "${__CACHEWARMONLY}" == "false" ]; then

checkrequirements
do_prompt_configuration

if [ ! -d "${__CONFDIR}" ];       then ${_SUDO} mkdir -p "${__CONFDIR}"; fi
if [ ! -d "${__LOCALCACHEDIR}" ]; then ${_SUDO} mkdir -p "${__LOCALCACHEDIR}"; fi

${_SUDO} tee "${__CONFDIR}/apt-move.conf" > /dev/null << EOF
COPYONLY=yes
APTSITES="/all/"
LOCALDIR=${__LOCALCACHEDIR}
DIST=${__CODENAME}
PKGTYPE=binary
FILECACHE=/var/cache/apt/archives
LISTSTATE=/var/lib/apt/lists
DELETE=no
MAXDELETE=20
COPYONLY=yes
PKGCOMP=gzip
CONTENTS=no
GPGKEY=
EOF

${_SUDO} tee "${__CONFDIR}/myapt.conf" > /dev/null << EOF
APT::FTPArchive::Release {
Origin "APT-Move";
Label "APT-Move";
Suite "${__CODENAME}";
Codename "${__CODENAME}";
Architectures "amd64";
Components "main restricted universe";
Description "debootstrap mirror";
};
EOF

fi


#/**
#  * Cache warming
#  *
#  */

if nc -zw1 google.com 443; then
  if [ ! -d "/tmp/cache" ]; then ${_SUDO} mkdir -p "/tmp/cache"; fi
  export DEBIAN_FRONTEND=noninteractive #better safe than sorry
  ${_SUDO} debootstrap --arch=amd64 --download-only ${__CODENAME} /tmp/cache #1> /dev/null
  ${_SUDO} cp /tmp/cache/var/cache/apt/archives/* /var/cache/apt/archives/
  #sudo rm -rf /tmp/cache
  ${_SUDO} apt-move -q -c "${__CONFDIR}/apt-move.conf" update
  cd ${__LOCALCACHEDIR}
  ${_SUDO} apt-ftparchive packages pool/main/ | gzip -9c > /tmp/Packages.gz
  ${_SUDO} mv /tmp/Packages.gz dists/xenial/main/binary-amd64/Packages.gz
  ${_SUDO} apt-ftparchive -c /var/lib/container/myapt.conf release dists/xenial/ > /tmp/Release
  ${_SUDO} mv /tmp/Release dists/xenial/
cd -
fi

echo ""
echo "usage:"
echo "debootstrap --no-check-gpg ${__CODENAME} ${__CODENAME}frommirror file:///var/local/mirrors"
