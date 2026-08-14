import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ModalController, Platform, NavParams, ViewController } from 'ionic-angular';
//import { Platform, NavParams, ViewController } from 'ionic-angular';

import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';

import { GeocoderProvider } from '../../providers/geocoder/geocoder';

@Component({
    template: `
  <ion-header>
    <ion-toolbar>
      <ion-title>
        Place
      </ion-title>
      <ion-buttons start>
        <button ion-button (click)="dismiss()">
          <span ion-text color="primary" showWhen="ios">Cancel</span>
          <ion-icon name="md-close" hideWhen="ios" ></ion-icon>
        </button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content>

  <form 
  *ngIf="displayForward"
  [formGroup]="form" 
  (ngSubmit)="performForwardGeocoding(form.value)">
  <ion-list>
     <ion-item margin-bottom>
        <ion-label>Location</ion-label>
        <ion-input 
           type="text" 
           formControlName="keyword"></ion-input>
     </ion-item>


     <ion-item margin-bottom>
        <button 
           ion-button 
           color="primary"
           text-center
           block
           [disabled]="!form.valid">Geocode this location</button>
     </ion-item>

  </ion-list>
</form>
   
<!--
Conditionally display the geocoding results
-->
<section *ngIf="geocoded">
{{ results.str }}
<hr />
{{ form.value.keyword }}
{{ results.coordinates.latitude }},
{{ results.coordinates.longitude }}

<ion-buttons end>
<button (click)="savePlace(form.value.keyword, results.coordinates.latitude, results.coordinates.longitude )"><ion-icon name="checkmark"></ion-icon></button>
</ion-buttons>

</section>

<!-- <ion-list>
<ion-item>
  <ion-avatar item-start>
    <img src="{{character?.image}}">
  </ion-avatar>
  <h2>{{character?.name}}</h2>
  <p>{{character?.quote}}</p>
</ion-item>

<ion-item *ngFor="let item of character['items']">
{{item?.title}}
<ion-note item-end>
  {{item?.note}}
</ion-note>
</ion-item>

</ion-list> -->

  </ion-content>
  `
})
export class ModalContentPage {


    /**
     * Define a FormGroup object for the forwardGeocoding form
     */
    public form: FormGroup;



    /**
     * Define a FormGroup object for the reverseGeocoding form
     */
    public geoForm: FormGroup;



    /**
     * Define a boolean property to reference whether geocoding has been 
     * performed or not
     */
    public geocoded: boolean;



    /**
     * Define a string value to handle returned geocoding results
     */
    public results: string;
    //public results: any;



    /**
     * Define the initial text value for the form switching button in the
     * HTML template
     */
    public filter: string = 'Search by Coordinates';



    /**
     * Define a boolean property to determine that the forwardGeocoding
     * form is displayed first
     */
    public displayForward: boolean = true;



    /**
     * Define a boolean property to determine that the reverseGeocoding
     * form is not to be displayed first
     */
    public displayReverse: boolean = false;


    public characters: any;
    public character: any = { items: [] };
    public places: any;
    public place: any;


    constructor(
        public platform: Platform,
        public params: NavParams,
        public viewCtrl: ViewController,
        public foo: ModalController,
        public navCtrl: NavController,

        public _GEOCODE: GeocoderProvider,
        private _FB: FormBuilder,
        private _PLATFORM: Platform

    ) {
        this.places = JSON.parse(localStorage.getItem("places"));
        if (!this.places) {
            this.places = [];
        }
        this.place = "";

        this.characters = [
            {
                name: 'Gollum',
                quote: 'Sneaky little hobbitses!',
                image: 'assets/img/avatar-gollum.jpg',
                items: [
                    { title: 'Race', note: 'Hobbit' },
                    { title: 'Culture', note: 'River Folk' },
                    { title: 'Alter Ego', note: 'Smeagol' }
                ]
            },
            {
                name: 'Frodo',
                quote: 'Go back, Sam! I\'m going to Mordor alone!',
                image: 'assets/img/avatar-frodo.jpg',
                items: [
                    { title: 'Race', note: 'Hobbit' },
                    { title: 'Culture', note: 'Shire Folk' },
                    { title: 'Weapon', note: 'Sting' }
                ]
            },
            {
                name: 'Samwise Gamgee',
                quote: 'What we need is a few good taters.',
                image: 'assets/img/avatar-samwise.jpg',
                items: [
                    { title: 'Race', note: 'Hobbit' },
                    { title: 'Culture', note: 'Shire Folk' },
                    { title: 'Nickname', note: 'Sam' }
                ]
            }
        ];
        this.character = this.characters[this.params.get('characterNum')];
        //this.character.items = {};
        //this.character = characters[1];
        console.log(this.character, this.params);



        // Define the validation rules for handling the
        // address submission from the forward geocoding form
        this.form = _FB.group({
            'keyword': ['', Validators.required]
        });


        // Define the validation rules for handling the 
        // latitude/longitude submissions from the reverse 
        // geocoding form
        this.geoForm = _FB.group({
            'latitude': ['', Validators.required],
            'longitude': ['', Validators.required]
        });

    }

    //savePlace(form.value.keyword, results.coordinates.latitude, results.coordinates.longitude )
    savePlace(name, lat, lon) {
        let place = {};
        place['name'] = name;
        place['lat'] = lat;
        place['lon'] = lon;
        console.log(place);
        //if (this.place != "") { //check
        this.places.push(place);
        console.log(this.places);
        localStorage.setItem("places", JSON.stringify(this.places));
        this.navCtrl.pop();
        //}
    }

    //unused
    save() {
        if (this.place != "") {
            this.places.push(this.place);
            localStorage.setItem("todos", JSON.stringify(this.places));
            this.navCtrl.pop();
        }
    }


    ionViewWillEnter() {
        //this.character = this.characters[this.params.get('characterNum')];
        this.character = this.characters[0];
        this.character.items = {};
        console.log(this.character, this.params);
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }


    /**
      *
      * Determine whether the forwardGeocoding or
      * reverseGeocoding form will be displayed
      *
      * @public
      * @method filterForm
      * @return {none}
      *
      */
    filterForm() {
        if (this.displayForward) {
            this.filter = 'Search by keyword';
            this.displayReverse = true;
            this.displayForward = false;
        }
        else {
            this.filter = 'Search by Co-ordinates';
            this.displayReverse = false;
            this.displayForward = true;
        }
    }




    /**
      *
      * Retrieve latitude/longitude coordinate values from HTML form, 
      * pass these into the reverseGeocode method of the Geocoder service 
      * and handle the results accordingly
      *
      * @public
      * @method performReverseGeocoding
      * @return {none}
      *
      */
    performReverseGeocoding(val) {
        this._PLATFORM.ready()
            .then((data: any) => {
                let latitude: any = parseFloat(this.geoForm.controls["latitude"].value),
                    longitude: any = parseFloat(this.geoForm.controls["longitude"].value);

                this._GEOCODE.reverseGeocode(latitude, longitude)
                    .then((data: any) => {
                        this.geocoded = true;
                        this.results = data;

                    })
                    .catch((error: any) => {
                        this.geocoded = true;
                        this.results = error.message;
                    });
            });
    }




    /**
      *
      * Retrieve address location submitted from HTML form, 
      * pass these into the forwardGeocode method of the Geocoder service 
      * and handle returned latitude/longitude coordinate values accordingly
      *
      * @public
      * @method performForwardGeocoding
      * @return {none}
      *
      */
    performForwardGeocoding(val) {
        this._PLATFORM.ready()
            .then((data: any) => {
                let keyword: string = this.form.controls["keyword"].value;
                this._GEOCODE.forwardGeocode(keyword)
                    .then((data: any) => {
                        this.geocoded = true;
                        this.results = data;
                    })
                    .catch((error: any) => {
                        this.geocoded = true;
                        let returnedObject: any = {};
                        returnedObject['str'] = 'default';
                        returnedObject['coordinates'] = { latitude: 50, longitude: 10 };
                        this.results = returnedObject;
                        //this.results = error.message;
                    });
            });
    }




}