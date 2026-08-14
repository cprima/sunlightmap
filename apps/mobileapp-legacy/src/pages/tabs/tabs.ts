import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { MapPage } from '../map/map';
import { SettingsPage } from '../settings/settings';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = MapPage;
  tab2Root = SettingsPage;
  tab3Root = AboutPage;
  tab4Root = ContactPage;

  constructor() {

  }
}
