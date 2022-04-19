require('dotenv').config();
const { v4: uuid } = require('uuid');

const measuredPower = -59;

const HciSocket = require('@abandonware/bluetooth-hci-socket');
const NodeBleHost = require('ble-host');

const BleManager = NodeBleHost.BleManager;
const AdvertisingDataBuilder = NodeBleHost.AdvertisingDataBuilder;

var transport = new HciSocket(); // connects to the first hci device on the computer, for example hci0

var options = {
	// optional properties go here
};

BleManager.create(transport, options, function (err, manager) {
	if (err) {
		console.error(err);
		return;
	}

	manager.gattDb.setDeviceName(process.env.NAME);

	const advDataBuffer = new AdvertisingDataBuilder()
		.addFlags(['leGeneralDiscoverableMode', 'brEdrNotSupported'])
		.addLocalName(/*isComplete*/ true, process.env.NAME)
		.add128BitServiceUUIDs(/*isComplete*/ true, [uuid()])
		.addAdvertisingInterval(1)
		.build();

	manager.setAdvertisingData(advDataBuffer);

	manager.startAdvertising({
		intervalMin: 32,
		intervalMin: 64,
	}, () => console.log('connected'));
});