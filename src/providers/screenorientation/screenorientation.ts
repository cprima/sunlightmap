import { Injectable } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Platform } from 'ionic-angular';
import { Events } from 'ionic-angular';

@Injectable()
export class ScreenorientationProvider {

  type: string = "";
  onChange: any;
  availableWidth: number;
  availableHeigth: number;
  portraitWidth: number;
  portraitHeight: number;
  landscapeWidth: number;
  landscapeHeight: number;
  pixelsEastWest: number;
  pixelsNorthSouth: number;

  constructor(public so: ScreenOrientation,
    public platform: Platform,
    public events: Events) {

    //console.log(so)
    this.onChange = so.onChange
    //this.type = so.type
    this.normalizeOrientation(so.type);
    this.setDimensions();

    so.onChange().subscribe(
      () => {
        //this.type = so.type
        this.normalizeOrientation(so.type);
        this.events.publish('screenorientation:changed', so.type);
        //console.log("Orientation Changed: ", so.type);
        //this.setDimensions();
      }
    );

  }

  normalizeOrientation(soType) {
    if (soType == 'landscape' || soType == 'landscape-primary' || soType == 'landscape-secondary') {
      this.type = 'landscape'
    } else if (soType == 'portrait' || soType == 'portrait-primary' || soType == 'portrait-secondary') {
      this.type = 'portrait'
    }
    console.log("Orientation Changed: ", this.type, soType);
  }

  setDimensions() {
    this.availableWidth = this.platform.width() - (2 * 16)
    this.availableHeigth = this.platform.height() - 12 - 23 - 12 - 56 - 32

    if (this.availableHeigth > this.availableWidth) { //portrait
      console.log("so portrait");
      this.pixelsEastWest = this.availableWidth;
      this.pixelsNorthSouth = Math.round(this.availableWidth / 2);
    } else if (this.availableHeigth <= this.availableWidth) {
      console.log("so landscape");
      this.pixelsNorthSouth = this.availableHeigth;
      this.pixelsEastWest = this.availableHeigth * 2;
    } else {
      console.log("so else");
      this.pixelsEastWest = 360;
      this.pixelsNorthSouth = 180;
    }
  }

}
