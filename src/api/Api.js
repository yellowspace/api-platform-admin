import ObjectUtils from '../../../common/utils/ObjectUtils';


class Api {

	// static gridSettings = {};

	static mapFields(listFields,fields,reOrder=true) {
		let lf = [];

		listFields.forEach((f) => {
			let name = f.name;
			if(fields[name]) {
				// lf.push(Object.assign(f,fields[name]));
				lf.push(ObjectUtils.merge(f,fields[name]));
			} else if(fields[name] !== null) {
				lf.push(f);
			}
		});

		if(reOrder) {
			let ordered = [];
			for(let idx in fields) {

				let r = ObjectUtils.findRecord(lf,{name: idx});

				// if(typeof console === 'object') { console.log('idx',idx,r); }

				if(r) {
					ordered.push(r);
					ObjectUtils.remove(lf,(n) => {
						return n.name === idx;
					});

					// if(typeof console === 'object') { console.log('REMOVE FROM ? ',lf); }
				}
			}

			lf = ordered.concat(lf);
		}

		return lf;
	}


};

export default Api;
