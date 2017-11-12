# Organization of this repository

This repocontains the full project and is therefore in an usual structure. When combining IT and business aspects (and a website is marketing is business) there exists a vey helpful method with [TOGAF](www.opengroup.org/subjectareas/enterprise/togaf "The TOGAF® framework is the de facto global standard for Enterprise Architecture.").

What I take out of TOGAF is the vocabular which helps me switch into a high-level view on my projects when I am in the trenches of building blocks. This vocabulary structures my thinking and I chose many naming conventions from my understanding of the method. With that as a reference here the pointers into this repository:

# ![biz][dot-app-16] applications deployed

These applications are deployed within the solution, are specificially written for it and far from off-the-shelf.

## ![biz][dot-app-16] backend

[./application/physical/backend](./application/physical/backend)

## ![biz][dot-app-16] mobile application

[./application/physical/mobileapp](./application/physical/mobileapp)

## ![biz][dot-app-16] geodata

[./application/physical/GIS](./application/physical/GIS)

# ![biz][dot-biz-16] business

I am a business administration guy by trade and can't help but spot "biz" where I see it. Th latest when hardware comes into play there is purchasing, maybe even a boll of materials 'BOM' and it doesn't help to put the ~~customer~~ user is in focus the terminology just fits.

## ![biz][dot-biz-16] press releases

[./business/marketing/media](./business/marketing/media)




# ![biz][dot-dat-16] data

This folder is typically used by scripts in ./application/physical to hold data in a predictable place. I tend to do a lot of curl'ing with checks for If-Modified-Since to be nice to the (mirror) servers.

# ![biz][dot-tec-16] technology

About off-the-shelf technology used by the project.


[dot-biz-16]: https://user-images.githubusercontent.com/943871/32907435-4c388e1a-cb00-11e7-85e7-b060c9028399.png "biz"
[dot-dat-16]: https://user-images.githubusercontent.com/943871/32907437-4d9e39f8-cb00-11e7-8dcf-697f7439860f.png "dat"
[dot-app-16]: https://user-images.githubusercontent.com/943871/32907438-4f141938-cb00-11e7-8d9c-50723c4decef.png "app"
[dot-tec-16]: https://user-images.githubusercontent.com/943871/32907440-5032be96-cb00-11e7-8cad-d7d16083ee5b.png "tec"

