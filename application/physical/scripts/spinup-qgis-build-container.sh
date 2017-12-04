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

__CONTAINERDIR='/var/lib/container'  #d
__CODENAME='xenial'                  #n
__LOCALCACHEDIR='/var/cache/mirror'  #l
__CONTAINERNAME='qgisbuilds'         #c
_VERBOSE='false'                     #v

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
    d) __CONTAINERDIR="true"
    ;;
    n) __CODENAME=$OPTARG
    ;;
    l) __LOCALCACHEDIR=$OPTARG
    ;;
    c) __CONTAINERNAME=$OPTARG
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
  type systemd-nspawn >/dev/null 2>&1 || { echo >&2 "This script requires apt-ftparchive but it is not installed. ";  i=$((i + 1)); }

  if [[ $i > 0 ]]; then echo "Aborting."; echo "Please install the missing dependency."; exit 1; fi
} #end function checkrequirements


#/**
#  *
#  * As much configuration as necessary, as many conventions as sensible. Hopefully.
#  *
#  * The basic configuration
#  * __CONTAINERDIR        : Will be used for ...
#  * __CODENAME            : Will be used for ...
#  * __LOCALCACHEDIR       : Will be used for ...
#  * __CONTAINERNAME       : Will be used for ...
#  *
#  */

#wrapped in function, called later
do_prompt_configuration() {

  echo ""
  
  while true; do
    read -e -p "Enter the location of the folder for container filsystems: " -i "${__CONTAINERDIR}" __CONTAINERDIR
    if [ ! -z ${__CONTAINERDIR} ]; then break; fi
  done
  
  while true; do
    read -e -p "Enter the name of the container: " -i "${__CONTAINERNAME}" __CONTAINERNAME
    if [ ! -z ${__CONTAINERNAME} ]; then break; fi
  done

  while true; do
    echo "This script is currently limited to Ubuntu 16.04, codename xenial"
    read -e -p "Which codename do you want to mirror? " -i "${__CODENAME}" __CODENAME
    if [[ "$__CODENAME" =~ ^xenial$ ]]; then
       break;
    else
      echo "${__CODENAME} is not valid, only xenial is implemented yet"
    fi
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


checkrequirements
do_prompt_configuration

if [ ! -d "${__CONTAINERDIR}" ];  then ${_SUDO} mkdir -p "${__CONTAINERDIR}"; fi
if [ ! -d "${__LOCALCACHEDIR}" ]; then
  echo "No local cache file ${__LOCALCACHEDIR}, exiting!"
  exit
fi

cd "${__CONTAINERDIR}"

if [ ! -d "${__CONTAINERNAME}" ]; then
  ${_SUDO} debootstrap --no-check-gpg ${__CODENAME} ${__CONTAINERNAME} file://${__LOCALCACHEDIR}
fi

${_SUDO} tee "./${__CONTAINERNAME}/etc/apt/sources.list" > /dev/null << EOF
#deb http://archive.ubuntu.com/ubuntu ${__CODENAME} main
#deb http://archive.ubuntu.com/ubuntu ${__CODENAME} universe
deb http://de.archive.ubuntu.com/ubuntu/ ${__CODENAME}-updates main restricted
deb http://de.archive.ubuntu.com/ubuntu/ ${__CODENAME} universe
deb http://de.archive.ubuntu.com/ubuntu/ ${__CODENAME}-updates universe

deb http://de.archive.ubuntu.com/ubuntu/ ${__CODENAME} multiverse
deb http://de.archive.ubuntu.com/ubuntu/ ${__CODENAME}-updates multiverse

deb http://de.archive.ubuntu.com/ubuntu/ ${__CODENAME}-backports main restricted universe multiverse

EOF

${_SUDO} systemd-nspawn -D qgisbuilds2 apt-get update
${_SUDO} systemd-nspawn -D qgisbuilds2 apt-get -y dist-upgrade
#${_SUDO} systemd-nspawn -D qgisbuilds2 apt-get -y upgrade
${_SUDO} systemd-nspawn -D qgisbuilds2 apt-get install -y dbus
${_SUDO} systemd-nspawn -D qgisbuilds2 systemctl enable --now systemd-networkd systemd-resolved
${_SUDO} systemd-nspawn -D qgisbuilds2 ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf


${_SUDO} tee "./${__CONTAINERNAME}/etc/rc.local" > /dev/null <<'EOF'
#!/bin/sh -e
if [ -f /root/firstboot.sh ]; then /bin/bash "/root/firstboot.sh" && rm "/root/firstboot.sh"; fi
exit 0
EOF

${_SUDO} tee -a "./${__CONTAINERNAME}/etc/apt/sources.list" > /dev/null << EOF
deb http://qgis.org/ubuntugis-nightly ${__CODENAME} main
deb http://ppa.launchpad.net/ubuntugis/ubuntugis-unstable/ubuntu ${__CODENAME} main
EOF

sudo tee "./${__CONTAINERNAME}/etc/hostname" > /dev/null << EOF
${__CONTAINERNAME}
EOF

sudo tee "${__CONTAINERNAME}/root/firstboot.sh" > /dev/null << 'EOF'
apt-key adv --keyserver keyserver.ubuntu.com --recv-key CAEB3DC3BDF7FB45
apt-key adv --keyserver keyserver.ubuntu.com --recv-key 089EBE08314DF160
apt-get update
apt-get -y upgrade
apt-get install -y dbus
apt-get install -y vim screen git wget curl
apt-get install -y apt-transport-https build-essential binutils ipython3
apt-get install -y bison ca-certificates ccache cmake cmake-curses-gui dh-python doxygen expect flex gdal-bin git graphviz grass-dev libexpat1-dev libfcgi-dev libgdal-dev libgeos-dev libgsl-dev libpq-dev libproj-dev libqca-qt5-2-dev libqca-qt5-2-plugins libqt5opengl5-dev libqt5scintilla2-dev libqt5sql5-sqlite libqt5svg5-dev libqt5webkit5-dev libqt5xmlpatterns5-dev libqwt-qt5-dev libspatialindex-dev libspatialite-dev libsqlite3-dev libsqlite3-mod-spatialite libzip-dev lighttpd locales ninja-build pkg-config poppler-utils pyqt5-dev pyqt5-dev-tools pyqt5.qsci-dev python3-all-dev python3-dateutil python3-dev python3-future python3-gdal python3-httplib2 python3-jinja2 python3-markupsafe python3-mock python3-nose2 python3-owslib python3-plotly python3-psycopg2 python3-pygments python3-pyproj python3-pyqt5 python3-pyqt5.qsci python3-pyqt5.qtsql python3-pyqt5.qtsvg python3-requests python3-sip python3-sip-dev python3-six python3-termcolor python3-tz python3-yaml qt5-default qt5keychain-dev qtbase5-dev qtpositioning5-dev qtscript5-dev qttools5-dev qttools5-dev-tools spawn-fcgi txt2tags xauth xfonts-100dpi xfonts-75dpi xfonts-base xfonts-scalable xvfb
id -u user &>/dev/null || adduser -q --disabled-password --gecos '' --ingroup sudo --uid 1976 user
echo 'user:user' | chpasswd
cd /usr/local/bin
ln -s /usr/bin/ccache gcc
ln -s /usr/bin/ccache g++
su - user
export HOME=/home/user

grep -q -F 'export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:${HOME}/apps/lib/' ${HOME}/.profile || echo 'export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:${HOME}/apps/lib/' >> foo.bar
grep -q -F 'PATH=~/opt/bin:$PATH' ${HOME}/.profile || echo 'PATH=~/opt/bin:$PATH' >> foo.bar

if [ ! -d "${HOME}/apps" ];    then mkdir -p ${HOME}/apps ;    fi
if [ ! -d "${HOME}/dev/cpp" ]; then mkdir -p ${HOME}/dev/cpp ; fi
cd ${HOME}/dev/cpp
if [ ! -d "QGIS" ]; then
  git clone git://github.com/qgis/QGIS.git
fi
cd QGIS
git pull
if [ ! -d "build-master" ]; then mkdir build-master ; else rm -rf ./build-master; mkdir ./build-master; fi
cd build-master
cmake -D CMAKE_BUILD_TYPE=Debug -D CMAKE_INSTALL_PREFIX=${HOME}/apps ..
make -j2
make install
cd ${HOME}
EOF



#/**
#  * Ready
#  *
#  */


echo ""
echo "usage:"
echo "sudo systemd-nspawn    -D ${__CONTAINERNAME} #then passwd and logout"
echo "sudo systemd-nspawn -b -D ${__CONTAINERNAME} #then shutdown -h now"
