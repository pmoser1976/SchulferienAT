//"use strict";

/*
 * Created with @iobroker/create-adapter v2.6.3
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter

const utils = require("@iobroker/adapter-core");


// Load your modules here, e.g.:
// const fs = require("fs");

//const ferienurl = "https://openholidaysapi.org/SchoolHolidays?countryIsoCode=AT&subdivisionCode=AT-KA&languageIsoCode=DE&validFrom=2024-01-01&validTo=2024-12-31";
const BASE_API_ENDPOINT =  `https://openholidaysapi.org/SchoolHolidays?countryIsoCode=AT&languageIsoCode=DE`;

async function getHolidayDates(){
	//const API_ENDPOINT = `${BASE_API_ENDPOINT}&subdivisionCode=${this.config?.bundeslandauswahl || "AT-KÄ"}&validFrom=${(new Date()).toISOString().slice(0, 10)}&validTo=${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)}`;
	const API_ENDPOINT = `${BASE_API_ENDPOINT}&subdivisionCode=${this.config?.bundeslandauswahl || "AT-KÄ"}&validFrom=${(new Date()).toISOString().slice(0, 10)}&validTo=${new Date(new Date().setDate(new Date().getDay() + this.config.anzeigetage)).toISOString().slice(0, 10)}`;
	this.log.info(API_ENDPOINT);
	const response = await fetch(API_ENDPOINT);
	const ferien_typen= await response.json();

	// objekt variablen zuerst anlegen

	/*	await this.setObjectNotExistsAsync("testVariable", {
			type: "state",
			common: {name: "testVariable", type: "boolean",	role: "indicator", read: true, write: true,},
			native: {},
		}); */

	//this.log.info("ferien_typen.length: " + ferien_typen.length); // => 6 :)


	await this.setObjectNotExistsAsync("isHolidayToday", {
		type: "state",
		common: {name: "isHolidayToday", type: "boolean",	role: "indicator", read: true, write: false,},
		native: {},
	});
	await this.setObjectNotExistsAsync("isHolidayTomorrw", {
		type: "state",
		common: {name: "isHolidayTomorrw", type: "boolean",	role: "indicator", read: true, write: false,},
		native: {},
	});

	const date_today = new Date();
	const days=1;
	const date_tomorrow = new Date(Date.now()+days*24*60*60*1000);
	//const date_tomorrow = new Date(new Date().setDate(new Date().getDate() + days));
	const date_begin = new Date(ferien_typen[0].startDate);
	const date_end = new Date(ferien_typen[0].endDate);

	this.log.info("Dates: " + date_today + " "  + date_tomorrow + " "  + date_begin + " "  + date_end)

	const isHolidayToday = (date_today >= date_begin && date_today <= date_end);
	await this.setState("isHolidayToday", {val: Boolean(`${isHolidayToday}`), ack: true});

	const isHolidayTomorrw = (date_tomorrow >= date_begin && date_today <= date_end);
	await this.setState("isHolidayTomorrw", {val: Boolean(`${isHolidayTomorrw}`), ack: true});

	for (let i=0;i<ferien_typen.length;i++) {
		await this.setObjectNotExistsAsync("nextHolidays."+i+".name", {
			type: "state",
			common: {name: "nextHolidays."+i+".name", type: "string",	role: "indicator", read: true, write: false,},
			native: {},
		});
		await this.setObjectNotExistsAsync("nextHolidays."+i+".beginDate", {
			type: "state",
			common: {name: "nextHolidays."+i+".beginDate", type: "string",	role: "indicator", read: true, write: false,},
			native: {},
		});
		await this.setObjectNotExistsAsync("nextHolidays."+i+".endDate", {
			type: "state",
			common: {name: "nextHolidays."+i+".endDate", type: "string",	role: "indicator", read: true, write: false,},
			native: {},
		});

		//this.log.info("ferientyp: " + ferien_typen[i].name[0].text);
		//this.log.info("begin: " + ferien_typen[i].startDate);
		//this.log.info("end: " +ferien_typen[i].endDate);

		//await this.setState("nextHolidays."+i+".name", ferien_typen[i].name[0].text);
		await this.setState("nextHolidays."+i+".name", {val: `${ferien_typen[i].name[0].text}`, ack: true});
		//await this.setState("nextHolidays."+i+".begin", ferien_typen[i].startDate);
		await this.setState("nextHolidays."+i+".beginDate", {val: `${ferien_typen[i].startDate}`, ack: true});
		//await this.setState("nextHolidays."+i+".end", ferien_typen[i].endDate);
		await this.setState("nextHolidays."+i+".endDate", {val: `${ferien_typen[i].endDate}`, ack: true});
	}

	//const object_set_begin_promises = ferien_typen.map(ferien_typ => this.setObjectNotExistsAsync(`${ferien_typ.name[0].text}.Ende`, {
	//	type: "state",common: {name: `${ferien_typ.name[0].text}.Ende`,type: "string",role: "indicator",read: true,write: false,},native: {},
	//}));
	//const object_set_end_promises =ferien_typen.map(ferien_typ => this.setObjectNotExistsAsync(`${ferien_typ.name[0].text}.Beginn`, {
	//	type: "state",common: {name: `${ferien_typ.name[0].text}.Beginn`,type: "string",role: "indicator",read: true,write: false,},native: {},
	//}));
	//await Promise.all([object_set_begin_promises,object_set_end_promises]);

	//ferien_typen.map(ferien_typ => this.setState(`${ferien_typ.name[0].text}.Beginn`, ferien_typ.startDate));
	//ferien_typen.map(ferien_typ => this.setState(`${ferien_typ.name[0].text}.Beginn, {val: ${ferien_typ.startDate}, ack: true}`));

	//ferien_typen.map(ferien_typ => this.setState(`${ferien_typ.name[0].text}.Ende`, ferien_typ.endDate));
	//ferien_typen.map(ferien_typ => this.setState(`${ferien_typ.name[0].text}.Ende, {val: "${ferien_typ.endDate}", ack: true}`));

	//ferien_typen.map(ferien_typ => this.log.info(`"${ferien_typ.name[0].text}.Beginn", {val: "${ferien_typ.startDate}", ack: true}`));
	//ferien_typen.map(ferien_typ => this.log.info(`${ferien_typ.name[0].text}.Beginn`, ferien_typ.startDate));
	// "Sommerferien.Ende", {val: "11.9.2024", ack: true}
}

async function delete_all_states() {
	// deletes all states of this instance
	//this.deleteState("schulferien_at.0","listener",)
	//this.delObject("listener");

	//geht:
	//this.delObject("St. Martin.Beginn");

	// todo: StateCount korrekt ermitteln!!
	const StateCount = 100;

	this.delObject("isHolidayToday");
	this.delObject("isHolidayTomorrw");

	for (let i=0;i<StateCount;i++) {
		/*if (this.getObject("nextHolidays." + i + ".beginDate")) {
			this.log.info("IF getObject: " + "nextHolidays." + i + ".beginDate");
		}*/
		this.delObject("nextHolidays." + i + ".beginDate");
		this.delObject("nextHolidays." + i + ".endDate");
		this.delObject("nextHolidays." + i + ".name");
	}
}

class SchulferienAt extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "schulferien_at",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:

		// this.log.info("config option1: " + this.config.option1);
		// this.log.info("config option2: " + this.config.option2);
		this.log.info("schulferien_at startet :)");
		this.log.info("Gewähltes Bundesland: " + this.config.bundeslandauswahl);
		this.log.info("Gewähltes Ferienanzahl: " + this.config.anzeigetage);

		// lösche alte Einträge
		const _delete_all_states = delete_all_states.bind(this);
		await _delete_all_states();


		// "this" wird an die funktion weitergerreicht damit in der Funktion this zugreifbar ist
		const _getHolidayDates = getHolidayDates.bind(this);
		_getHolidayDates();

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/

		/*	await this.setObjectNotExistsAsync("testVariable", {
			type: "state",
			common: {
				name: "testVariable",
				type: "boolean",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});
*/
		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		// this.subscribeStates("testVariable");
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates("lights.*");
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates("*");

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		//		await this.setState("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		//		await this.setState("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		//		await this.setState("testVariable", { val: true, ack: true, expire: 30 });

		/* await this.setObjectNotExistsAsync("listener", {
			type: "state",
			common: {
				name: "listener",
				type: "string",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		}); */

		// await this.setState("listener", "changeme..");
		//		await this.setState("Sommerferien.Ende", {val: "11.9.2024", ack: true});

		// this.subscribeStates("listener");

		// examples for the checkPassword/checkGroup functions
		/*		let result = await this.checkPasswordAsync("admin", "iobroker");
		this.log.info("check user admin pw iobroker: " + result);

		result = await this.checkGroupAsync("admin", "admin");
		this.log.info("check group user admin group admin: " + result);
		*/

		this.stop;

	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
			const _getHolidayDates = getHolidayDates.bind(this);
			_getHolidayDates();
			/* if (id=="schulferien_at.0.listener") {

			} */
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new SchulferienAt(options);
} else {
	// otherwise start the instance directly
	new SchulferienAt();
}