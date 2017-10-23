import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { ToastController } from 'ionic-angular';
//ionic cordova plugin add cordova-plugin-network-information
//npm install --save @ionic-native/network
import { Network } from '@ionic-native/network';
import { Subscription } from 'rxjs/Subscription';
import { Platform } from 'ionic-angular';

/*
https://www.joshmorony.com/creating-an-advanced-google-maps-component-in-ionic-2/
https://blog.paulhalliday.io/2017/06/23/ionic-3-network-detection/
*/
@Injectable()
export class ConnectivityServiceProvider {

  connected: Subscription;
  disconnected: Subscription;
  is_online: boolean = false;

  onDevice: boolean;

  constructor(public platform: Platform,
    private toast: ToastController,
    private network: Network
  ) {
    this.onDevice = this.platform.is('cordova');
    if (this.onDevice) {
      console.log(this.onDevice, this.network)
    } else {
      if (navigator.onLine) { this.is_online = true; }
    }
  }

  monitor() {
    this.platform.ready().then(() => {
      this.platform.pause.subscribe(() => {
        console.log("paused");
        this.connected.unsubscribe();
        this.disconnected.unsubscribe();
      });
      this.platform.resume.subscribe(() => {
        console.log("resumed");
        this.connected = this.network.onConnect().subscribe(data => {
          this.is_online = true;
          this.displayNetworkUpdate(data.type);
        }, error => console.error(error));

        this.disconnected = this.network.onDisconnect().subscribe(data => {
          this.is_online = false;
          this.displayNetworkUpdate(data.type);
        }, error => console.error(error));

      });
    });

    this.connected = this.network.onConnect().subscribe(data => {
      this.is_online = true;
      console.log('connectivity-service this connected');
      this.displayNetworkUpdate(data.type);
    }, error => console.error(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.is_online = false;
      console.log('connectivity-service this DISconnected');
      this.displayNetworkUpdate(data.type);
    }, error => console.error(error));
  }

  isOnline() {
    return this.is_online;
  }
  isOffline() {
    return !this.is_online;
  }

  //Observable
  toastConnectivityChanges() {
    this.connected = this.network.onConnect().subscribe(data => {
      this.is_online = true;
      this.displayNetworkUpdate(data.type);
    }, error => console.error(error));

    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.is_online = false;
      this.displayNetworkUpdate(data.type);
    }, error => console.error(error));
  }

  //ToDo check proper event for service (ionViewWillLeave is most likely wrong)
  ionViewWillLeave() {
    this.connected.unsubscribe();
    this.disconnected.unsubscribe();
  }

  displayNetworkUpdate(connectionState: string) {
    let networkType = null;
    if (this.onDevice) {
      //https://github.com/apache/cordova-plugin-network-information
      networkType = this.network.type;
      this.toast.create({
        message: `You are now ${connectionState} via ${networkType}`,
        duration: 3000
      }).present();
    } else {
      this.toast.create({
        message: `You are now ${connectionState}`,
        duration: 3000
      }).present();
    }
  }

}
