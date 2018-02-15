---
layout: post
title: "Lightweight container with systemd-nspawn"
categories: [ technology_physical_building-blocks ]
date:   2017-12-01 12:00:00 +0100
abstract: This repository also contains some (at the time) cutting-edge tests for the geographic information software (https://www.qgis.org/en/site/)[QGIS]. To always install nightly builds of version 2.99 (to become QGIS 3) the approach was to use lightweight containers with systemd-nspawn. After all, a container is a kernel namespace and cgroups on a filesystem.
---

## Container with systemd-nspawn

To install latest developer versions of any packagor program it is good practice not to pollute the installation with possibly experimental versions. One lightweight and not widely used way is to use `systemd-nspawn`.

https://wiki.archlinux.org/index.php/Systemd-nspawn#Create_a_Debian_or_Ubuntu_environment

Originally developed for testing systemd itself this boots into a virtual filesystem, gives the container its own PID 1 and are bootet from the host by root (depending on the kernel config the container's priviledges may then be dropped).

Networking can be an container's own private network or the host's network can be shared.

The filesystem from the host can be mounted.

After all Docker and also systemd-nspawn are just using the Linux kernel's namespace and cgroups features.

### How to create a container

```bash
cd /var/lib/container/
sudo debootstrap xenial qgis299 http://archive.ubuntu.com/ubuntu/
```

The content of the directory afterwads:
```
$ ls qgis299/
bin   dev  home  lib64  mnt  proc  run   srv  tmp  var
boot  etc  lib   media  opt  root  sbin  sys  usr
```

Booting into the container first time (to set a root password):
```
sudo systemd-nspawn -D  qgis299
passwd
logout
```

Then the container should be booted in the background and `machinectl` used to e.g. enter it. The ArchLinux Wiki has (as usual) a very good overview and helpful troubleshooting tipps.

On the host:
With `sudo systemctl edit systemd-nspawn@.service` enter in the newly created file
```
cat /etc/systemd/system/systemd-nspawn@.service.d/override.conf 
[Service]
ExecStart=
ExecStart=/usr/bin/systemd-nspawn --quiet --keep-unit --boot --link-journal=try-guest --machine=%I
```

Inside the container:
```
systemctl enable --now systemd-resolved
ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf

```


### How to Create a Cache for `debootstrap`

TL;DR Run `curl -L https://slm.prdv.de/setup_debootstrapcache.sh | sudo sh`

On Ubuntu 16.04 and possibly Debian the program `apt-move` can be used to create a cache for frequent `debootstrap` use. Possibly because the following was tested on Ubuntu 16.04 only, some paths *may* differ on Debian. As my usecase was to install QGIS 2.99 nigthly builds which seem to be provided quite reliably for `xenial` this was all that the usecase asked for.

Following http://cheesehead-techblog.blogspot.de/2012/01/local-file-cache-to-speed-up.html this is resulting change:

<pre>
<del>sudo debootstrap --arch=amd64 xenial qgisbuilds http://archive.ubuntu.com/ubuntu/</del>
sudo debootstrap --no-check-gpg --arch=amd64 xenial qgisbuilds file:///var/local/mirrors
</pre>

1. install necessary packages
2. create folders and helper files
3. perform cache-warming and set up the mirror
4. use `debootstrap` with a local mirror

#### install necessary packages

```
sudo apt-get apt-move
```

#### create folder and helper files

A dedicated folder to hold the cache is needed:

```bash
sudo mkdir -p /var/cache/mirrors
```

And also a config file needs to be created:

```
sudo tee "/var/lib/container/apt-move.conf" > /dev/null <<'EOF'
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
```

Finally what is left to do is to create a primer for the Release file:

```
sudo tee "${__CONFDIR}/myapt.conf" > /dev/null <<'EOF'
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
```



#### cache warming and mirror setup

```
sudo mkdir /tmp/cache
sudo debootstrap --arch=amd64 --download-only xenial /tmp/cache
sudo cp /tmp/cache/var/cache/apt/archives/* /var/cache/apt/archives/
```

Now a Packages and Release file must be generated containing info about this mirror:

```bash
cd /var/cache/mirror
sudo apt-ftparchive packages pool/main/ | gzip -9c > /tmp/Packages.gz
sudo mv /tmp/Packages.gz dists/xenial/main/binary-amd64/Packages.gz
sudo apt-ftparchive -c /var/lib/container/myapt.conf release dists/xenial/ > /tmp/Release
sudo mv /tmp/Release dists/xenial/
```


## sample qgisbuilds

On Debian and Ubuntu the program `debootstrap` downloads a root filesystem that can be entered or booted with `systemd-nspawn`. Some workarounds to execeute initial commands on first boot can easily set up a working QGIS build server.

A script doing all these tasks is available at /application/physical/scripts/spinup-qgis-build-container.sh , here are some interstings snippets:


use the above created mirror to bootstrap in a bandwidth-saving way
```
sudo debootstrap --no-check-gpg xenial FOOBAR file:///var/local/mirrors
```


Add a check to /etc/rc.local to execute a file somewhere else to be run only once.

```
sudo tee "./FOOBAR/etc/rc.local" > /dev/null <<'EOF'
#!/bin/sh -e
if [ -f /root/firstboot.sh ]; then /bin/bash "/root/firstboot.sh" && rm "/root/firstboot.sh"; fi
exit 0
EOF

Manipulate the apt sources:
sudo tee "./FOOBAR/etc/apt/sources.list" > /dev/null <<'EOF'
deb http://archive.ubuntu.com/ubuntu xenial main
deb http://archive.ubuntu.com/ubuntu xenial universe
deb http://qgis.org/ubuntugis-nightly xenial main
#deb-src http://qgis.org/ubuntugis-nightly xenial main

deb http://ppa.launchpad.net/ubuntugis/ubuntugis-unstable/ubuntu xenial main
EOF

Add a hostname
sudo tee "./FOOBAR/etc/hostname" > /dev/null <<'EOF'
qgisbuilds
EOF

sudo tee "./FOOBAR/root/firstboot.sh" > /dev/null <<'EOF'
systemctl enable --now systemd-networkd systemd-resolved
ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf
apt-get update
apt-get -y upgrade
id -u user &>/dev/null || adduser -q --disabled-password --gecos '' --ingroup sudo --uid 1976 user
echo 'user:user' | chpasswd
su - user
export HOME=/home/user
echo 'export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:${HOME}/apps/lib/' >> .profile
#continue to set up local QGIS build
```






