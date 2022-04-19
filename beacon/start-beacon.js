'dotenv/config';
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const uuid = uuidv4().replace('-', '');
const major = 0;
const minor = 0;
const measuredPower = -59;

const onReady = () => {
	bleno.startAdvertisingIBeacon(uuid, major, minor, measuredPower);
};

bleno.on('stateChange', state => {
	if (state === 'poweredOn') {
		onReady();
	}
});
