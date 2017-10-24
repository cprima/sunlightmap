import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ScreenorientationProvider } from '../../providers/screenorientation/screenorientation';
import { SocialSharing } from '@ionic-native/social-sharing';
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
  mapDateTime: Date = new Date()

  constructor(public navCtrl: NavController,
    public conn: ConnectivityServiceProvider,
    public so: ScreenorientationProvider,
    public socialSharing: SocialSharing,
    public platform: Platform,
    public events: Events,
    public http: Http
  ) {
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
    var headers = new Headers();
    headers.append("Accept", 'application/json');
    headers.append('Content-Type', 'application/json');
    let options = new RequestOptions({ headers: headers });

    let postParams = {
      RequestedAt: JSON.stringify(this.mapDateTime).replace(/"/g, ''),
      Width: this.so.pixelsEastWest,
      Height: this.so.pixelsNorthSouth
    }
    console.log(postParams);

    //http://localhost:8080/v2/test
    //http://sunlightmap.appspot.com/v2/test
    this.http.post('http://sunlightmap.appspot.com/v2/test', postParams, options).map(res => res.json()).subscribe(data => {
      console.log("data")
      this.backendresponse = data;
      this.drawMap(this.so.pixelsEastWest, this.so.pixelsNorthSouth);
    }, (err) => {
      //fail
      console.log("didntwrk :( ", err)
    }, () => {
      //complete
      console.log("fertsch!")
    });

  }

  public share() {
    //var basesixtyfour: string = 'R0lGODlhDAAMALMBAP8AAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAUKAAEALAAAAAAMAAwAQAQZMMhJK7iY4p3nlZ8XgmNlnibXdVqolmhcRQA7';
    //var context = this.canvasslm.nativeElement.getContext('2d');
    //https://forum.ionicframework.com/t/getelementbyid-ion-input/43920/11
    //console.log(this.canvasslm.nativeElement.toDataURL());
    var options = {
      message: 'planet @ ' + this.mapDateTime.toISOString(),
      subject: null,
      //files: ['data:image/png;base64,' + this.canvasslm.nativeElement.toDataURL()],
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

  private drawMap(width, height) {
    //https://stackoverflow.com/questions/4409445/base64-png-data-to-html5-canvas
    let base_image = new Image();
    let context = this.canvasslm.nativeElement.getContext('2d');
    let contextP = this.portraitslm.nativeElement.getContext('2d');
    let contextL = this.landscapeslm.nativeElement.getContext('2d');
    base_image.src = 'data:image/png;base64,' + this.backendresponse.Imgbase64;
    base_image.onload = function () {
      context.drawImage(base_image, 0, 0, width, height);
      contextP.drawImage(base_image, 0, 0, width, height);
      contextL.drawImage(base_image, 0, 0, width, height);
    }
  }
}
