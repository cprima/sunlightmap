---
layout: post
title: "Asynchronous events and $this"
categories: [ application_logical_building-blocks ]
date:   2018-02-14 00:00:00 +0100
abstract: When the callback of an asynchronous function is executed there is no determined state of $this. So better supply a copy.
---

# Asynchronous events and $this #

Given the following code that with the (anonymou)s callback function supplied in `.then()` and the requirement to only work with the "places" from storage there is no way to determine how long this (somehow expensive) read from local storage will take.

This is a somewhat contrived example but should explain the underlying concern.

```JavaScript
//imports

export class MyPage {

  //class variables

  constructor(
    //other init objects
    ) {

    //init

  } //end of the constructor

  //other (mandatory) methods

  private reloadMap() {
    //Getting the array of user-owned places from storage
    let that = this;
    this.asyncLocalStorage.getItem("places").then(function (value) {
      that.places = JSON.parse(value);
    });

    //do something with the new values

  }

}
```
