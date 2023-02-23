import { Component, VERSION, OnInit, ViewChild } from '@angular/core';

import { ZXingScannerComponent } from '@zxing/ngx-scanner';

import { Result } from '@zxing/library';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  ngVersion = VERSION.full;

  @ViewChild('scanner')
  scanner: ZXingScannerComponent;

  hasDevices: boolean;
  hasPermission: boolean;
  qrResultString: string;
  qrResult: Result;

  availableDevices: MediaDeviceInfo[];
  currentDevice: MediaDeviceInfo;
  got: any;
  public lat: any;
  public lng: any;
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
      this.hasDevices = true;
      this.availableDevices = devices;

      // selects the devices's back camera by default
      // for (const device of devices) {
      //     if (/back|rear|environment/gi.test(device.label)) {
      //         this.scanner.changeDevice(device);
      //         this.currentDevice = device;
      //         break;
      //     }
      // }
    });

    this.scanner.camerasNotFound.subscribe(() => (this.hasDevices = false));
    this.scanner.scanComplete.subscribe(
      (result: Result) => (this.qrResult = result)
    );
    this.scanner.permissionResponse.subscribe(
      (perm: boolean) => (this.hasPermission = perm)
    );
  }

  displayCameras(cameras: MediaDeviceInfo[]) {
    console.debug('Devices: ', cameras);
    this.availableDevices = cameras;
  }

  handleQrCodeResult(resultString: string) {
    console.debug('Result: ', resultString);
    this.qrResultString = resultString;

    if (resultString == 'Your trip has started😀') {
      this.PunchIn();
    } else {
      this.PunchOut();
    }
  }

  onDeviceSelectChange(selectedValue: string) {
    console.debug('Selection changed: ', selectedValue);
    this.currentDevice = this.scanner.getDeviceById(selectedValue);
  }

  stateToEmoji(state: boolean): string {
    const states = {
      // not checked
      undefined: '❔',
      // failed to check
      null: '⭕',
      // success
      true: '✔',
      // can't touch that
      false: '❌',
    };

    return states['' + state];
  }

  PunchOut() {
    let price = sessionStorage.getItem('price');
    let Destination = sessionStorage.getItem('Destination');
    alert(
      'Thanks for using easy ticket app ' +
        price +
        ' Points has been deducted from your wallet'
    );
    sessionStorage.clear();
  }

  PunchIn() {
    let addressCurrentDB =
      'Owl Street, Cottesloe, Johannesburg, 2001, South Africa';
    let addressToDB =
      'Milpark Bus Station (T3, C4, C5), Empire Road, Cottesloe, Johannesburg Ward 60, Johannesburg, City of Johannesburg Metropolitan Municipality, Gauteng, 2001, South Africa';
    let selectedAddressToDB =
      'Milpark Bus Station (T3, C4, C5), Empire Road, Cottesloe, Johannesburg Ward 60, Johannesburg, City of Johannesburg Metropolitan Municipality, Gauteng, 2001, South Africa';
    let priceTrip = 15.5;
    let wallet = 21.5;

    console.log(wallet.toFixed(2), priceTrip.toFixed(2));
    //find my current location
    navigator.geolocation.getCurrentPosition((position) => {
      if (position) {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;

        let currentLat = this.lat;
        let currentLng = this.lng;

        let currentCod = currentLat + ',' + currentLng;

        this.getAddress(currentCod).subscribe((data: any) => {
          if (
            data.results[0].formatted == addressCurrentDB &&
            selectedAddressToDB == addressToDB
          ) {
            if (priceTrip < wallet) {
              sessionStorage.setItem('CordinatesCurrent', currentCod);
              sessionStorage.setItem('price', priceTrip.toFixed(2));
              sessionStorage.setItem('wallet', wallet.toFixed(2));
              sessionStorage.setItem('Destination', selectedAddressToDB);

              alert('Trip started.');
            } else if (priceTrip === wallet) {
              sessionStorage.setItem('CordinatesCurrent', currentCod);
              sessionStorage.setItem('price', priceTrip.toFixed(2));
              sessionStorage.setItem('wallet', wallet.toFixed(2));
              sessionStorage.setItem('Destination', selectedAddressToDB);

              alert('Your balance is running low. After trip recharge');
            } else {
              alert('Your balance is low please reacharge.');
            }
          } else {
            alert('No match');
          }
        });
      }
    });
  }
  getAddress(coord: any) {
    return this.http.get(
      'https://api.opencagedata.com/geocode/v1/json?q=' +
        coord +
        '&key=a2580d3bbb4940d9bfa47c349d3cac3a&language=en&pretty=1'
    );
  }
}
