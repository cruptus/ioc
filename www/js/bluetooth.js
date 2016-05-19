// (c) 2014 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global mainPage, deviceList, refreshButton */
/* global detailPage, resultDiv, messageInput, sendButton, disconnectButton, batterieButton, horlogeButton */
/* global ble  */
/* jshint browser: true , devel: true*/
'use strict';

// ASCII only
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

// this is Nordic's UART service
var bluefruit = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
};

var le = {
    initialize: function() {
        this.bindEvents();
        detailPage.hidden = true;
    },
    bindEvents: function() {

        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        batterieButton.addEventListener('click', this.sendDataBatterie, false);
        horlogeButton.addEventListener('click', this.sendDataHorloge, false);
        deviceList.addEventListener('touchstart', this.connect, false);
    },
    onDeviceReady: function() {
        le.refreshDeviceList();
    },
    refreshDeviceList: function() {
        deviceList.innerHTML = '';
        if (cordova.platformId === 'android') {
            ble.scan([], 5, le.onDiscoverDevice, le.onError);
        } else {
            ble.scan([bluefruit.serviceUUID], 5, le.onDiscoverDevice, le.onError);
        }
    },
    onDiscoverDevice: function(device) {
        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                device.id;

        listItem.dataset.deviceId = device.id;
        listItem.innerHTML = html;
        deviceList.appendChild(listItem);
    },
    connect: function(e) {
        var deviceId = e.target.dataset.deviceId,
            onConnect = function(peripheral) {
                le.determineWriteType(peripheral);

                // subscribe for incoming data
                ble.startNotification(deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic, le.onData, le.onError);
                //sendButton.dataset.deviceId = deviceId;
                disconnectButton.dataset.deviceId = deviceId;

                horlogeButton.dataset.deviceId = deviceId;
                batterieButton.dataset.deviceId = deviceId;
                le.showDetailPage();
            };

        ble.connect(deviceId, onConnect, le.onError);
    },
    determineWriteType: function(peripheral) {
        // Adafruit nRF8001 breakout uses WriteWithoutResponse for the TX characteristic
        // Newer Bluefruit devices use Write Request for the TX characteristic

        var characteristic = peripheral.characteristics.filter(function(element) {
            if (element.characteristic.toLowerCase() === bluefruit.txCharacteristic) {
                return element;
            }
        })[0];

        if (characteristic.properties.indexOf('WriteWithoutResponse') > -1) {
            le.writeWithoutResponse = true;
        } else {
            le.writeWithoutResponse = false;
        }

    },
    onData: function(data) { // data received from Arduino
        console.log(data);
        resultDiv.innerHTML = resultDiv.innerHTML + "Received: " + bytesToString(data) + "<br/>";
        resultDiv.scrollTop = resultDiv.scrollHeight;
    },
    sendDataHorloge: function(event) { // send data to Arduino

        var success = function() {
            console.log("success");
        };

        var failure = function() {
            alert("Failed writing data to the bluefruit le");
        };
        var ladate = new Date();
        var hour, minute, seconde;
        if(ladate.getHours() > 12) {
            hour = ladate.getHours() - 12;
            if (hour < 10)
                hour = '0' + hour;
        }else {
            if(ladate.getHours() < 10)
                hour = '0'+ladate.getHours();
            else
                hour = ladate.getHours();
        }

        if(ladate.getMinutes() < 10)
            minute = '0'+ladate.getMinutes();
        else
            minute = ladate.getMinutes();
        if(ladate.getSeconds() < 10)
            seconde = '0' + ladate.getSeconds();
        else
            seconde = ladate.getSeconds();
        var data = stringToBytes('t'+hour+minute+seconde+'!');
        var deviceId = event.target.dataset.deviceId;

        if (le.writeWithoutResponse) {
            ble.writeWithoutResponse(
                deviceId,
                bluefruit.serviceUUID,
                bluefruit.txCharacteristic,
                data, success, failure
            );
        } else {
            ble.write(
                deviceId,
                bluefruit.serviceUUID,
                bluefruit.txCharacteristic,
                data, success, failure
            );
        }

    },sendDataBatterie: function(event) { // send data to Arduino


        function checkbattery(){
            window.addEventListener("batterystatus", onBatteryStatus, false);
        }

        function onBatteryStatus(info) {
            var success = function() {
                console.log("success");
            };

            var failure = function() {
                alert("Failed writing data to the bluefruit le");
            };
            var data = stringToBytes('b'+info.level+'!');
            var deviceId = event.target.dataset.deviceId;

            if (le.writeWithoutResponse) {
                ble.writeWithoutResponse(
                    deviceId,
                    bluefruit.serviceUUID,
                    bluefruit.txCharacteristic,
                    data, success, failure
                );
            } else {
                ble.write(
                    deviceId,
                    bluefruit.serviceUUID,
                    bluefruit.txCharacteristic,
                    data, success, failure
                );
            }
        }
        checkbattery();

    },
    disconnect: function(event) {
        var deviceId = event.target.dataset.deviceId;
        ble.disconnect(deviceId, le.showMainPage, le.onError);
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    onError: function(reason) {
        alert("ERROR: " + reason); // real apps should use notification.alert
    }
};