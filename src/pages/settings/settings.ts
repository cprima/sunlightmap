import { Component } from '@angular/core';
//import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  //geoPlaces: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    /*     this.geoPlaces = [
          { name: "Wolfsburg", lat: 52.436754, lon: 10.812858 },
          { name: "Eriwan", lat: 40.190042, lon: 44.515477 },
        ];
    
        this.geoPlaces.forEach((value, index) => {
          //console.log(value);
          let x = Math.round(360 + ((value.lon * 360) / 180));
          let y = Math.round(180 - ((value.lat * 180) / 180));
          console.log(value.name, x, y)
        }); */
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

}
