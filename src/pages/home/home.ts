import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ScreenorientationProvider } from '../../providers/screenorientation/screenorientation';
import { SocialSharing } from '@ionic-native/social-sharing';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { ConnectivityServiceProvider } from '../../providers/connectivity-service/connectivity-service';
import { Platform } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('canvasslm') canvasslm;
  @ViewChild('canvasslm') canvasslm2: ElementRef;
  @ViewChild('portraitslm') portraitslm;
  @ViewChild('landscapeslm') landscapeslm;
  slmimgbase64: string = '';
  backendresponse: any;
  teststuff: any;
  mapDateTime: Date = new Date();

  geoPlaces: any;

  constructor(public navCtrl: NavController,
    public conn: ConnectivityServiceProvider,
    public so: ScreenorientationProvider,
    public socialSharing: SocialSharing,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public platform: Platform,
    public events: Events,
    public http: Http
  ) {
    this.geoPlaces = [
      //{ name: "Wolfsburg", lat: 52.436754, lon: 10.812858 },
      //{ name: "Eriwan", lat: 40.190042, lon: 44.515477 },
    ];
    //console.log(conn)
    events.subscribe('screenorientation:changed', (type) => {
      console.log('so changed: ', type);
      this.reloadMap();
    });
  }

  ngAfterViewInit() {
    this.requestMapFromBackend()
  }

  reloadMap() {
    console.log("reloading")
    this.mapDateTime = new Date();
    let context = this.canvasslm.nativeElement.getContext('2d');
    let contextP = this.portraitslm.nativeElement.getContext('2d');
    let contextL = this.landscapeslm.nativeElement.getContext('2d');
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    contextP.clearRect(0, 0, context.canvas.width, context.canvas.height);
    contextL.clearRect(0, 0, context.canvas.width, context.canvas.height);
    this.requestMapFromBackend()

  }

  requestMapFromBackend() {
    let myLoading = this.presentLoadingDefault();
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });

    let postParams = {
      RequestedAt: JSON.stringify(this.mapDateTime).replace(/"/g, ''),
      Width: this.so.pixelsEastWest,
      Height: this.so.pixelsNorthSouth
    }

    //http://localhost:8080/v2/test
    //http://sunlightmap.appspot.com/v2/test
    this.http.post('http://sunlightmap.appspot.com/v2/test', postParams, options).map(res => res.json()).subscribe(data => {
      console.log("data")
      this.backendresponse = data;
      this.drawMap(this.so.pixelsEastWest, this.so.pixelsNorthSouth, this.geoPlaces);
      this.drawMap2(this.canvasslm, 720, 360, this.geoPlaces);
      myLoading.dismiss();
    }, (err) => {
      //fail
      this.presentAlert();
      console.log("didntwrk :( ", err)
    }, () => {
      //complete
      console.log("fertsch!")
    });

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

  public drawMap(width, height, geoplaces) {
    //https://stackoverflow.com/questions/4409445/base64-png-data-to-html5-canvas
    //let context = this.canvasslm.nativeElement.getContext('2d');
    let contextP = this.portraitslm.nativeElement.getContext('2d');
    let contextL = this.landscapeslm.nativeElement.getContext('2d');

    let base_image = new Image();
    base_image.src = 'data:image/png;base64,' + this.backendresponse.Imgbase64;
    base_image.onload = function () {
      //context.drawImage(base_image, 0, 0, 720, 360);
      contextP.drawImage(base_image, 0, 0, width, height);
      contextL.drawImage(base_image, 0, 0, width, height);

      let x: number;
      let y: number;
      geoplaces.forEach((value, index) => {
        //console.log(value);
        x = Math.round((width / 2) + ((value.lon * (width / 2)) / 180));
        y = Math.round((height / 2) - ((value.lat * (height / 2)) / 90));
        console.log(value.name, x, y)

        var radius = Math.round(height / 100);
        contextL.beginPath();
        contextL.arc(x, y, radius, 0, 2 * Math.PI, false);
        contextL.fillStyle = '#dc322f';
        contextL.fill();
        contextP.beginPath();
        contextP.arc(x, y, radius, 0, 2 * Math.PI, false);
        contextP.fillStyle = '#dc322f';
        contextP.fill();
        //contextP.lineWidth = 5;
        //contextP.strokeStyle = '#003300';
        //contextP.stroke();
      });
    }

  }

  public drawMap2(canvasViewChild, width, height, geoplaces) {
    //https://stackoverflow.com/questions/4409445/base64-png-data-to-html5-canvas
    let context = canvasViewChild.nativeElement.getContext('2d');
    let base_image = new Image();
    base_image.src = 'data:image/png;base64,' + this.backendresponse.Imgbase64;

    base_image.onload = function () {
      context.drawImage(base_image, 0, 0, width, height);

      let x: number;
      let y: number;

      geoplaces.forEach((value, index) => {
        //console.log(value);
        x = Math.round((width / 2) + ((value.lon * (width / 2)) / 180));
        y = Math.round((height / 2) - ((value.lat * (height / 2)) / 90));
        console.log(value.name, x, y)

        var radius = Math.round(height / 100);
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fillStyle = '#dc322f';
        context.fill();

      });
    }

  }

  //https://ionicframework.com/docs/api/components/loading/LoadingController/
  presentLoadingDefault() {
    const loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    loading.present();

    setTimeout(() => {
      loading.dismiss();
    }, 16000);
    return loading;
  }

  presentAlert() {
    const alert = this.alertCtrl.create({
      title: 'Map Problem',
      subTitle: 'No response from map server. :(',
      buttons: ['Dismiss']
    });
    alert.present();
  }


}
