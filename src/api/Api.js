
class Api {

	// static gridSettings = {};

	static mapFields(listFields,fields) {
		let lf = [];

		listFields.map((f) => {
			let name = f.name;
			if(fields[name]) {
				lf.push(Object.assign(f,fields[name]));
			} else if(fields[name] !== null) {
				lf.push(f);
			}
		});

		return lf;
	}


};

export default Api;
