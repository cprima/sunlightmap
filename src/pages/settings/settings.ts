import { Component } from '@angular/core';
//import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NavController, NavParams } from 'ionic-angular';
import { PlacesPage } from '../../pages/places/places';

import { FormBuilder, FormGroup } from '@angular/forms';
import { SettingsProvider } from '../../providers/settings/settings';

//@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  //geoPlaces: any;
  placesPage = PlacesPage;
  settingsReady = false;
  form: FormGroup;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public settings: SettingsProvider) {

    this.settings.subject.subscribe(settings => {
      if (settings) {
        //console.log(settings);
        //console.log(settings.mapcenter);
      }
    });

  }

  _buildForm() {
    let group: any = {
      mapcenter: [this.settings.defaults.mapcenter]
    };

    this.form = this.formBuilder.group(group);

    // Watch the form for changes, and
    this.form.valueChanges.subscribe((v) => {
      this.settings.save(v);
      //console.log(this.form);
      //console.log(this.settings);
      //console.log(v);
    });
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad SettingsPage');
    this.form = this.formBuilder.group({});
  }


  ionViewWillEnter() {
    // Build an empty form for the template to render
    this.form = this.formBuilder.group({});

    this.settings.subject.subscribe(settings => {
      if (settings) {
        //console.log(settings);
        //console.log(settings.mapcenter);
        this.settingsReady = true;
        this._buildForm();
      }
    });


  }

  ngOnChanges() {
    //console.log('Ng All Changes');
  }

}
