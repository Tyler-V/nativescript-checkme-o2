import { Component, OnInit, NgZone } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { Bluetooth, Peripheral, Service } from 'nativescript-bluetooth';

@Component({
    selector: 'Home',
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
    private bluetooth = new Bluetooth();
    isBluetoothEnabled: boolean;
    isScanning: boolean;
    peripherals: Array<Peripheral> = [];

    constructor(private ngZone: NgZone, private routerExtensions: RouterExtensions) {}

    ngOnInit(): void {
        this.bluetooth.isBluetoothEnabled().then((enabled) => {
            console.log(`Bluetooth Enabled: ${enabled}`);
            this.isBluetoothEnabled = enabled;
        });
        this.bluetooth.requestCoarseLocationPermission().then((enabled) => {
            console.log(`Coarse Location Enabled: ${enabled}`);
        });
    }

    checkBluetoothEnabled(): void {
        this.bluetooth.isBluetoothEnabled().then((enabled) => {
            this.isBluetoothEnabled = enabled;
            console.log(`Bluetooth Enabled: ${this.isBluetoothEnabled}`);
        });
    }

    enableBluetooth(): void {
        this.bluetooth.enable().then((enabled) => {
            this.isBluetoothEnabled = enabled;
            console.log(`Bluetooth Enabled: ${this.isBluetoothEnabled}`);
        });
    }

    scan(): void {
        if (this.isScanning) {
            this.bluetooth.stopScanning().then((isStopped) => (this.isScanning = isStopped));
        } else {
            console.log(`Starting Scanning...`);
            this.isScanning = true;
            this.peripherals = [];
            this.bluetooth
                .startScanning({
                    seconds: 5,
                    skipPermissionCheck: false,
                    onDiscovered: (peripheral) => {
                        if (!this.peripherals.find((p) => p.UUID == peripheral.UUID)) {
                            console.log(`Peripheral`);
                            console.log(`name: ${peripheral.name}`);
                            console.log(`localName: ${peripheral.localName}`);
                            console.log(`UUID: ${peripheral.UUID}`);
                            console.log(`advertismentData: ${JSON.stringify(peripheral.advertismentData)}`);
                            console.log(`manufacturerId: ${peripheral.manufacturerId}`);
                            console.log(`Services: ${JSON.stringify(peripheral.services)}`);
                            console.log(``);
                            this.ngZone.run(() => {
                                if (peripheral.name) {
                                    this.peripherals.unshift(peripheral);
                                } else {
                                    this.peripherals.push(peripheral);
                                }
                            });
                        }
                    },
                })
                .then(
                    (success) => {
                        console.log('Scanning complete');
                        this.isScanning = false;
                    },
                    (error) => {
                        console.log('Error while scanning: ' + error);
                        this.isScanning = false;
                    }
                );
        }
    }

    connectToPeripheral(peripheralUUID: string) {
        console.log(peripheralUUID);
        this.bluetooth.stopScanning().then((isStopped) => (this.isScanning = isStopped));
        this.routerExtensions.navigate(['peripheral', peripheralUUID]);
    }
}
