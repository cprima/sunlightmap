---
layout: post
title: "Ionic 3: Refresh on pulldown"
categories: [ application_logical_building-blocks ]
date:   2018-02-14 00:00:00 +0100
abstract: Mobile apps typically provide a "refresh" key `F5` substitute by pulling down from the top of the page. Here is how to do this in Ionic 3.
---

# Refresher #

This little helper is built into Ionic and can easily be implemented so that a user pulls down from the top of the screen to "F5"-reload the page. The documentation is at [ionicframework.com/.../components/.../Refresher/](https://ionicframework.com/docs/api/components/refresher/Refresher/).

Components in Ionic are high-level building blocks. They are documented

- as showcases on [ionicframework.com/docs/components/](https://ionicframework.com/docs/components/)
- and in their API documentation at [ionicframework.com/docs/api/](https://ionicframework.com/docs/api/)

## Refershing the page with the map ##

In the file `src/pages/map/map.html` there is at the top:

```HTML
  <ion-refresher (ionRefresh)="doRefresh($event)">
    <ion-refresher-content></ion-refresher-content>
  </ion-refresher>
```

This "component" then triggers in map.ts `doRefresh()`:

```JavaScript
  doRefresh(refresher) {
    this.reloadMap();
    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }
```

To prevent an infinite loop e.g. when the network is down the whole execution is limited to two seconds.

![screenshot of refresher with called method executing](../images/ionic-component-refresher.png 'Ionic component "refresher"')
