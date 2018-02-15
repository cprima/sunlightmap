---
layout: post
title: "Mobile app: Reacting to events on the device"
categories: [ application_logical_building-blocks ]
date:   2018-02-13 00:00:00 +0100
abstract: Reacting to events is a fundamental paradigm in any software architecture. Here is one approach how to do this with Cordova events in Ionic 3. 
---

# Reacting to events on the device #

To fulfill the requirements of the AppStore and to provide an acceptable user experience a maximum screen estate shall be filled by the Sunlightmap app's main content, the map.

This necessitates to

- know available width and height
- react to changes in orientation.

An outline of the solution:

- create a provider
- install a native plugin, here: screenorientation
- subscribe to this plugin's events
- upon change, re-calculate the available screen estate
- emit an eventthru Angular's event mechanism
- in a related page's controller, subscribe to this event


## Prerequisites ##

Following instructions on [ionicframework.com/.../screen-orientation/](https://ionicframework.com/docs/native/screen-orientation/), the plugin needs tobe installed:

```bash
ionic cordova plugin add cordova-plugin-screen-orientation
npm install --save @ionic-native/screen-orientation
```

As usual, this plugin needs to be registered in the file `src/app/app.module.ts`:

```JavaScript
import { ScreenOrientation } from '@ionic-native/screen-orientation';
...
  providers: [
    ...
    ScreenorientationProvider,
    ...
  ]
```

This makes the screenorientation plugin available to the Ionic app.

The event mechanism are already included in the default Ionic installation, namely `node_modules/ionic-angular/util/events.js`. It is a basic publish-subscribe pattern, organized in channels.

## An Ionic provider to listen to changes in screen orientation ##

In Ionic "providers" are background services which are not just active in the currently visible page.

To listen to a change in screen orientation such a "provider" is the way to go:

```bash
mkdir -p src/providers/screenorientation
```

By placing the code in a file e.g. screenorientation.ts the import path will become `import { ScreenorientationProvider } from '../../providers/screenorientation/screenorientation';`.

A minimal `src/providers/screenorientation/screenorientation.ts` could look like this (key explanations follow below):

```JavaScript
import { Injectable } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Platform } from 'ionic-angular';
import { Events } from 'ionic-angular';

@Injectable()
export class ScreenorientationProvider {

  private type: string;
  private onChange: any;
  public availableWidth: number;
  public availableHeigth: number;

  constructor(
    public so: ScreenOrientation,
    private platform: Platform,
    public events: Events) {

    this.type = so.type;
    this.onChange = so.onChange
    this.normalizeOrientation(so.type);
    this.setDimensions();

    so.onChange().subscribe(
      () => {
        this.type = so.type
        this.normalizeOrientation(so.type);
        this.setDimensions();
        this.events.publish('screenorientation:changed', this.type);
      }
    );

  }

  normalizeOrientation(soType) {
    if (soType == 'landscape' || soType == 'landscape-primary' || soType == 'landscape-secondary') {
      this.type = 'landscape'
    } else if (soType == 'portrait' || soType == 'portrait-primary' || soType == 'portrait-secondary') {
      this.type = 'portrait'
    }
  }

  setDimensions() {
    this.availableWidth = this.platform.width() - (2 * 16)
    this.availableHeigth = this.platform.height() - 12 - 23 - 12 - 56 - 32

    console.log("Width is %d and Height is %d.", this.availableWidth, this.availableHeigth);
  }

}
```

At first this JavaScript (or better Typescript) file includes the classes `Injectable`, `ScreenOrientation`, `Platform` and `Events`. This "injectable class" then intializes the class variables `type`, `onChange`, `availableWidth` and `availableHeight`. The constructor initializes the objects `ScreenOrientation`, `Platform` and `Events` and

- sets default values for the class variables
  - directly
  - with the help of the methods `normalizeOrientation` and `setDimensions`

For the purpose of this app it is easier to work with "normalized" screen orientations as the Web API underneath the plugin return hyphenated string according to the device's default layout (a tablet is primarily in landscape, a smartphone only secondarily in landscape -- more about this at [developer.mozilla.org/.../lockOrientation](https://developer.mozilla.org/en-US/docs/Web/API/Screen/lockOrientation)).


The constructor also subscribes to the onChange event of the screenorienation plugin and itself publishes an event on the implicitly created `screenorientation:changed` channel (the colon is just a freely chosen convention here).

```JavaScript
@Injectable()
export class ScreenorientationProvider {

  //member variables

  constructor(
    //init
    ) {

    //defaults

    so.onChange().subscribe(
      () => {
        this.type = so.type
        this.normalizeOrientation(so.type);
        this.setDimensions();
        this.events.publish('screenorientation:changed', this.type);
      }
    );

  }
```

The member variable `this.type` is then filled with the normalized orienatation, to make life easier down the road and not having to string-parse.

```JavaScript
  normalizeOrientation(soType) {
    if (soType == 'landscape' || soType == 'landscape-primary' || soType == 'landscape-secondary') {
      this.type = 'landscape'
    } else if (soType == 'portrait' || soType == 'portrait-primary' || soType == 'portrait-secondary') {
      this.type = 'portrait'
    }
  }
```

And finally the other member variables are filled with values from the Platform object (which was not really mentioned so far but is equally crucial to this "provider":

```JavaScript
  setDimensions() {
    //app-specific: left and right margin
    this.availableWidth = this.platform.width() - (2 * 16)
    //app-specific: margins, header, footer
    this.availableHeigth = this.platform.height() - 12 - 23 - 12 - 56 - 32

    console.log("Width is %d and Height is %d.", this.availableWidth, this.availableHeigth);
  }
```

## A sample subscriber to the re-published event ##

To import the custom provider from a file e.g. `src/pages/map/map.ts` a relative path to the file and the name of the exported class (from `export class ScreenorientationProvider {`) is used.

The page then initializes the object in its constructor, and subscribes to the changes.

```JavaScript
///other imports
import { ScreenorientationProvider } from '../../providers/screenorientation/screenorientation';

export class MapPage {

  //class variables

  constructor(
    //other init objects
    public so: ScreenorientationProvider
    ) {

    events.subscribe('screenorientation:changed', (type) => {
      console.log('so changed: ', type);
      this.reloadMap();
    });

  } //end of the constructor

  //other (mandatory) methods

  private reloadMap() {
    //Getting the array of user-owned places from storage
    let that = this;
    this.asyncLocalStorage.getItem("places").then(function (value) {
      //console.log("async got", value);
      that.places = JSON.parse(value);
    });

    //do something with the new values

  }

}
```

That's it! This is how to leverage Cordova in an Ionic hybrid app with a background "provider" and event-based communication within the JavaScript running in a Web Container.
