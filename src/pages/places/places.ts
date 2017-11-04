import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { ModalContentPage } from './modal-page';

@Component({
    selector: 'page-places',
    templateUrl: 'places.html'
})
export class PlacesPage {

    public places: Array<string>;

    constructor(private navCtrl: NavController,
        public modalCtrl: ModalController) { }

    //onPageDidEnter() {
    ionViewWillEnter() {
        console.log("places page onPageDidEnter");
        this.places = JSON.parse(localStorage.getItem("places"));
        console.log(this.places);
        if (!this.places) {
            this.places = [];
        }
    }

    noop(foo) {
        console.log(foo);
    }


    deletePlace(index: number) {
        this.places.splice(index, 1);
        localStorage.setItem("places", JSON.stringify(this.places));
    }

    delete(index: number) {
        this.places.splice(index, 1);
        localStorage.setItem("todos", JSON.stringify(this.places));
    }

    add() {
        this.navCtrl.push(PlacesPage);
    }


    public openModal(characterNum) {

        let modal = this.modalCtrl.create(ModalContentPage, {
            characterNum: characterNum
        }, {
                enterAnimation: 'modal-alert-pop-in',
                leaveAnimation: 'modal-alert-pop-out',
                cssClass: 'my-modal'
            }
        );
        modal.onDidDismiss(() => {
            // Nothing to do
        });
        modal.present();
    }

}