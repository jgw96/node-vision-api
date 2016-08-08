import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, LoadingController, ToastController } from 'ionic-angular';

import { Images } from '../../providers/images/images';

@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [Images]
})
export class HomePage {

  @ViewChild('videoElement') video: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  videoStream: any;
  confidence: string;
  pictureTaken: boolean;
  mood: string;
  labels: any[];

  constructor(private navCtrl: NavController,
    private imagesProvider: Images,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController) {
    this.videoStream = null;
    this.pictureTaken = false;
  }

  ionViewDidEnter() {
    (navigator as any).mediaDevices.getUserMedia({ audio: false, video: true }).then((mediaStream) => {
      this.video.nativeElement.src = window.URL.createObjectURL(mediaStream);
      this.videoStream = mediaStream;
    }).catch((err) => {
      console.error(err);
    })
  }

  takePicture() {
    let ctx = this.canvas.nativeElement.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    if (this.videoStream) {
      let loading = this.loadingCtrl.create({
        content: 'Analyzing...',
      });
      loading.present();

      ctx.drawImage(this.video.nativeElement, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      let data = this.canvas.nativeElement.toDataURL();
      this.imagesProvider.sendImage(data).subscribe(
        data => {
          loading.dismiss();

          console.log(data[1].labels);
          this.labels = data[1].labels;

          if (data[0].faces.length > 0) {
            this.pictureTaken = true;
            this.confidence = data[0].faces[0].confidence;

            if (data[0].faces[0].happy === true) {
              this.mood = 'happy';
              return;
            } else if (data[0].faces[0].mad === true) {
              this.mood = 'mad';
              return;
            } else if (data[0].faces[0].sad === true) {
              this.mood = 'sad';
              return;
            } else if (data[0].faces[0].suprised === true) {
              this.mood = 'suprised';
              return;
            } else {
              this.mood = 'neutral';
              return;
            }
          } else {
            loading.onDidDismiss(() => {
              let toast = this.toastCtrl.create({
                message: 'No faces detected, please try again',
                duration: 2000
              });
              toast.present();
            });
          }
        },
        err => {
          console.error(err);
          loading.dismiss();
        }
      );
    }
  }

}
