import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { Network } from '@ionic-native/network';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { MapPage } from '../pages/map/map';
import { SettingsPage } from '../pages/settings/settings';
import { TabsPage } from '../pages/tabs/tabs';
import { PlacesPage } from '../pages/places/places';
import { HomePage } from '../pages/home/home';


//import { GeocoderProvider } from '../providers/geocoder/geocoder';
import { GeocoderModalPage } from '../pages/map/GeocoderModal';
import { ModalContentPage } from '../pages/places/modal-page';
import { ModalAlertPopIn, ModalAlertPopOut, ModalAlertMdPopIn, ModalAlertMdPopOut } from '../pages/places/my-special-transition';
//https://forum.ionicframework.com/t/adding-custom-transitions-custom-modal-transition/75924/3
import { Config } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SocialSharing } from '@ionic-native/social-sharing';
import { ScreenorientationProvider } from '../providers/screenorientation/screenorientation';
import { ConnectivityServiceProvider } from '../providers/connectivity-service/connectivity-service';
import { GeocoderProvider } from '../providers/geocoder/geocoder';
import { NativeGeocoder } from '@ionic-native/native-geocoder';
import { SettingsProvider } from '../providers/settings/settings';

import { IonicStorageModule } from '@ionic/storage';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    AboutPage,
    ContactPage,
    MapPage,
    SettingsPage,
    TabsPage,
    PlacesPage,
    ModalContentPage,
    GeocoderModalPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AboutPage,
    ContactPage,
    MapPage,
    SettingsPage,
    TabsPage,
    PlacesPage,
    ModalContentPage,
    GeocoderModalPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Network,
    ScreenOrientation,
    SocialSharing,
    ScreenorientationProvider,
    ConnectivityServiceProvider,
    NativeGeocoder,
    GeocoderProvider,
    SettingsProvider
  ]
})
export class AppModule {
  constructor(
    public platform: Platform,
    public config: Config) {
    this.setCustomTransitions();
  }

  private setCustomTransitions() {
    let isAndroid: boolean = this.platform.is('android');
    this.config.setTransition('modal-alert-pop-in', isAndroid ? ModalAlertMdPopIn : ModalAlertPopIn);
    this.config.setTransition('modal-alert-pop-out', isAndroid ? ModalAlertMdPopOut : ModalAlertPopOut);
  }
}
