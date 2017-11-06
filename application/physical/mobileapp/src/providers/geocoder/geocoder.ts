import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {
  NativeGeocoder,
  NativeGeocoderReverseResult,
  NativeGeocoderForwardResult
} from '@ionic-native/native-geocoder';


@Injectable()
export class GeocoderProvider {

  constructor(public http: Http,
    private _GEOCODE: NativeGeocoder) {

  }



  /**
    *
    * Perform reverseGeocoding operation and return address details
    *
    * @public
    * @method reverseGeocode
    * @return {Promise}
    *
    */
  reverseGeocode(lat: number, lng: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this._GEOCODE.reverseGeocode(lat, lng)
        .then((result: NativeGeocoderReverseResult) => {
          let str: string = `The reverseGeocode address is ${result.postalCode} in ${result.countryCode}`;
          resolve(str);
        })
        .catch((error: any) => {
          console.log(error);
          reject(error);
        });
    });
  }




  /**
    *
    * Perform forwardGeocode operation and return latitude/longitude details
    *
    * @public
    * @method forwardGeocode
    * @return {Promise}
    *
    */
  forwardGeocode(keyword: string): Promise<any> {
    //console.log("forwardGeocode");
    return new Promise((resolve, reject) => {
      this._GEOCODE.forwardGeocode(keyword)
        .then((coordinates: NativeGeocoderForwardResult) => {
          //console.log("forwardGeocode inside Promise");
          let str: string = `The coordinates are latitude=${coordinates.latitude} and longitude=${coordinates.longitude}`;
          let returnedObject = {};
          returnedObject['str'] = str;
          returnedObject['coordinates'] = coordinates;
          resolve(returnedObject);
        })
        .catch((error: any) => {
          //console.log(error);
          reject(error);
        });
    });
  }

}