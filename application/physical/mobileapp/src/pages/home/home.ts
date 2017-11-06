import { Component, ViewChild } from '@angular/core';
import { Events, Platform, NavController, AlertController, LoadingController } from 'ionic-angular';
import { ScreenorientationProvider } from '../../providers/screenorientation/screenorientation';
import { SocialSharing } from '@ionic-native/social-sharing';

import { SettingsProvider } from '../../providers/settings/settings';

import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
//import 'rxjs/add/operator/delay';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('canvasslm') canvasslm;
  @ViewChild('portraitslm') portraitslm;
  @ViewChild('landscapeslm') landscapeslm;
  backendresponse: any;
  backendrequest: any = { success: 'unknown', lastRequested: 0 };
  mapDateTime: Date = new Date();
  mapcenter: string = "local";
  hasAlert: boolean = false;
  lastRequested: number; // = this.getUnixtime();

  geoPlaces: any;

  constructor(public navCtrl: NavController,
    public conn: ConnectivityServiceProvider,
    public so: ScreenorientationProvider,
    public socialSharing: SocialSharing,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public platform: Platform,
    public events: Events,
    public http: Http,
    public settings: SettingsProvider) {

    this.geoPlaces = JSON.parse(localStorage.getItem("places"));
    //console.log(this.geoPlaces);
    if (!this.geoPlaces) {
      this.geoPlaces = [];
    }

    events.subscribe('screenorientation:changed', (type) => {
      console.log('so changed: ', type);
      this.reloadMap();
    });

    this.settings.subject.subscribe(settings => {
      if (settings) {
        //console.log(settings);
        this.mapcenter = settings.mapcenter;
        this.reloadMap(); //fixme just redraw
      }
    });

  }

  ngAfterViewInit() {
    this.requestMapFromBackend();
    //console.log(this.settings.mapcenter); //undefined for now
  }

  private reloadMap() {

    this.geoPlaces = JSON.parse(localStorage.getItem("places"));
    console.log("reloadMap", this.geoPlaces);
    if (!this.geoPlaces) {
      this.geoPlaces = [];
    }

    //console.log("reloading")
    this.mapDateTime = new Date();
    this.requestMap();
    //this.requestMapFromBackend();

  }

  //preparation to move to provider
  private requestMapFromBackend() {

    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });

    let postParams = {
      RequestedAt: JSON.stringify(this.mapDateTime).replace(/"/g, ''),
      Width: this.so.pixelsEastWest,
      Height: this.so.pixelsNorthSouth
    }

    //caveat: Device toolbar in Chrome makes platform 'android' or 'ios'!
    let url = 'http://localhost:8080/v2/test'
    if (this.platform.is('android') || this.platform.is('ios')) {
      url = 'http://sunlightmap.appspot.com/v2/test';
    }
    //console.log(url);
    return this.http.post(url, postParams, options)
      .retry(2)
      //.timeout(100)
      .map(res => res.json());
  }

  private requestMap() {

    let myLoading = this.presentLoadingDefault();

    if (this.backendrequest.lastRequested < this.getUnixtime() - 4) {
      this.requestMapFromBackend()
        .subscribe(data => {

          this.backendresponse = data;
          //console.log(data);
          this.backendrequest.success = 'ok';
          this.backendrequest.lastRequested = this.getUnixtime();
          this.drawAllMaps();
          myLoading.dismiss();

        }, (err) => {
          this.backendrequest.success = 'error';
          this.backendrequest.lastRequested = this.getUnixtime();
          myLoading.dismiss();
          this.presentAlert();
          //console.log("didntwrk :( ", err)
        }, () => {
          //console.log("complete")
        });
    }

    //console.log(this.backendresponse);

    if (this.backendrequest.success == 'ok') {
      //this.drawAllMaps();
    } else {
      //noop
    }

  }

  private drawAllMaps() {

    let canvasses = [this.canvasslm, this.portraitslm, this.landscapeslm];
    let self = this;
    canvasses.forEach(function (canvas) {
      let ctx = canvas.nativeElement.getContext('2d');
      //let x = 0; let y = 0;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      self.drawSingleMap(canvas, ctx.canvas.width, ctx.canvas.height, self.geoPlaces);
    }
    );
  }

  public share() {
    var options = {
      message: 'planet @ ' + this.mapDateTime.toISOString(),
      subject: null,
      files: [this.canvasslm.nativeElement.toDataURL()],
      url: null
    };

    this.socialSharing.shareWithOptions(options).then(
      (foo) => {
        console.log(foo);
      }
    ).catch(
      (err) => {
        console.log(err);
      }
      );
  }

  public drawSingleMap(canvasViewChild, width, height, geoplaces) {

    //https://stackoverflow.com/questions/4409445/base64-png-data-to-html5-canvas
    let context = canvasViewChild.nativeElement.getContext('2d');
    let base_image = new Image();
    base_image.src = 'data:image/png;base64,' + this.backendresponse.Imgbase64;

    let center = this.mapcenter;
    let self = this;

    //crop and re-align in thirds
    base_image.onload = function () {
      console.log(base_image.width, width, base_image.height, height)
      if (center == "asia") {
        context.drawImage(base_image, //left
          base_image.width / 3 * 2, 0, (base_image.width / 3 * 3), base_image.height,
          width / 3 * 1, 0, width / 3 * 3, height);
        context.drawImage(base_image, //left
          0, 0, base_image.width / 3, base_image.height,
          (width / 3 * 2), 0, width / 3, height);
        context.drawImage(base_image, //right
          base_image.width / 3 * 1, 0, base_image.width / 3, base_image.height,
          0, 0, width / 3, height);
      }

      else if (center == "americas") {
        context.drawImage(base_image,
          0, 0, base_image.width / 3, base_image.height,
          width / 3 * 1, 0, width / 3, height);
        context.drawImage(base_image,
          base_image.width / 3 * 1, 0, base_image.width / 3, base_image.height,
          width / 3 * 2, 0, width / 3, height);
        context.drawImage(base_image,
          base_image.width / 3 * 2, 0, base_image.width / 3 * 1, base_image.height,
          0, 0, width / 3 * 1, height);
      }

      else {
        context.drawImage(base_image, 0, 0, width, height);
      }

      //place marker dots on map in canvas
      geoplaces.forEach((value, index) => {

        let coords = self.translateLatlonToXyInpicture(value.lat, value.lon, width, height, center);

        var radius = Math.round(height / 100);
        context.beginPath();
        context.arc(coords.x, coords.y, radius, 0, 2 * Math.PI, false);
        context.fillStyle = '#dc322f';
        context.fill();

      });
    }

  }

  private translateLatlonToXyInpicture(lat, lon, width, height, center) {
    //https://www.codeproject.com/Questions/626899/Converting-Latitude-And-Longitude-to-an-X-Y-Coordi

    let x = Math.round((width / 2) + ((lon * (width / 2)) / 180));
    let y = Math.round((height / 2) - ((lat * (height / 2)) / 90));

    if (center == "asia") {
      x = x - width / 3; //ugly wraparound
      if (x < 0) {
        x = x + width;
      }
    }
    else if (center == "americas") {
      x = x + width / 3; //ugly wraparound
      if (x > width) {
        x = x - width;
      }
    }

    //https://stackoverflow.com/a/2917197
    return {
      x: x,
      y: y
    };

  }

  //https://ionicframework.com/docs/api/components/loading/LoadingController/
  private presentLoadingDefault(content = '') {
    if (content == '') { content = 'Please wait...'; }
    const loading = this.loadingCtrl.create({
      content: content
    });

    loading.present();

    setTimeout(() => {
      loading.dismiss();
    }, 16000);
    return loading;
  }

  private presentAlert() {
    if (this.hasAlert == false) {
      const alert = this.alertCtrl.create({
        title: 'Map Problem',
        subTitle: 'No response from map server. :(',
        buttons: [{
          text: 'Dismiss',
          handler: () => {
            this.hasAlert == false;
          }
        }]
      });
      //console.log(alert);
      this.hasAlert = true;
      alert.present();
    }
  }

  private getUnixtime() {
    return Math.floor(Date.now() / 1000);
  }

}
