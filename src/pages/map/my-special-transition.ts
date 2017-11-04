import { Animation, Transition } from 'ionic-angular';

export class ModalAlertPopIn extends Transition {
    init() {
        super.init();

        const ele: HTMLElement = this.enteringView.pageRef().nativeElement;
        const backdropEle = ele.querySelector('ion-backdrop');
        const backdrop = new Animation(this.plt, backdropEle);
        const wrapper = new Animation(this.plt, ele.querySelector('.modal-wrapper'));

        wrapper.fromTo('opacity', 0.01, 1).fromTo('scale', 1.1, 1);
        backdrop.fromTo('opacity', 0.01, 0.3);

        this
            .easing('ease-in-out')
            .duration(200)
            .add(backdrop)
            .add(wrapper);
    }
}

export class ModalAlertPopOut extends Transition {
    init() {
        super.init();

        const ele: HTMLElement = this.leavingView.pageRef().nativeElement;
        let backdrop = new Animation(this.plt, ele.querySelector('ion-backdrop'));
        let wrapperEle = <HTMLElement>ele.querySelector('.modal-wrapper');
        let wrapper = new Animation(this.plt, wrapperEle);

        wrapper.fromTo('opacity', 0.99, 0).fromTo('scale', 1, 0.9);
        backdrop.fromTo('opacity', 0.3, 0);

        this
            .easing('ease-in-out')
            .duration(200)
            .add(backdrop)
            .add(wrapper);
    }
}

export class ModalAlertMdPopIn extends Transition {
    init() {
        super.init();

        const ele: HTMLElement = this.enteringView.pageRef().nativeElement;
        const backdrop = new Animation(this.plt, ele.querySelector('ion-backdrop'));
        const wrapper = new Animation(this.plt, ele.querySelector('.modal-wrapper'));

        wrapper.fromTo('opacity', 0.01, 1).fromTo('scale', 1.1, 1);
        backdrop.fromTo('opacity', 0.01, 0.5);

        this
            .easing('ease-in-out')
            .duration(200)
            .add(backdrop)
            .add(wrapper);
    }
}

export class ModalAlertMdPopOut extends Transition {
    init() {
        super.init();

        const ele: HTMLElement = this.leavingView.pageRef().nativeElement;
        const backdrop = new Animation(this.plt, ele.querySelector('ion-backdrop'));
        const wrapper = new Animation(this.plt, ele.querySelector('.modal-wrapper'));

        wrapper.fromTo('opacity', 0.99, 0).fromTo('scale', 1, 0.9);
        backdrop.fromTo('opacity', 0.5, 0);

        this
            .easing('ease-in-out')
            .duration(200)
            .add(backdrop)
            .add(wrapper);
    }
}