import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { Constants } from '../../app/config';

@Injectable()
export class SettingsProvider {

  public defaults: any = {
    mapcenter: "asia"
  }

  //https://github.com/ionic-team/ionic-starter-super/issues/58#issuecomment-335612555
  constructor(public storage: Storage) {
    // load settings from storage (async)
    this.storage.get(Constants.STORAGE_KEY_SETTINGS).then(settings => {
      this.save(settings || null);
    });
  }

  // don't access settings directly, but subscribe to the subject instead
  // the subject will initially return/broadcast null (until loading finishes)
  // test if a key exists with `if ('key' in settings)`
  private settings = this.defaults;
  public subject: BehaviorSubject<any> = new BehaviorSubject(null);

  // merge object into settings (defaults to overwrite existing)
  merge(settings: any, overwrite = true) {
    for (const key in settings) {
      if (overwrite || !(key in this.settings)) {
        this.settings[key] = settings[key];
      }
    }
  }

  // set value, then save to storage (which also broadcasts it)
  // (await this to make sure it got saved)
  setValue(key: string, value: any) {
    this.settings[key] = value;
    return this.save();
  }

  // optionally merge the passed object into settings, then broadcast and save
  // (await this to make sure it got saved)
  save(settings: any = null) {
    if (settings) {
      this.merge(settings);
    }

    this.broadcast();

    return this.storage.set(Constants.STORAGE_KEY_SETTINGS, this.settings);
  }

  // broadcast settings to everyone who subscribes to the subject
  broadcast(settings = this.settings) {
    this.subject.next(settings);
  }
}