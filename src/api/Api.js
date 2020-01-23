import ObjectUtils from '../../../common/utils/ObjectUtils';


class Api {

	// static gridSettings = {};

	static util_exportFields(fields) {

		let eF = [];
		let eS = "\n";

		fields.forEach((f) => {
			eF.push({[f.name] : true});

			eS += [f.name] + ': true,'+"\n";
		});

		if(typeof console === 'object') { console.log('eS',eS); }
	};

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


	static _hasEdit(hasEdit,configFactoryOptions) {
		if(typeof this.hasEdit !== 'undefined') {
			return this.hasEdit;
		}
		else if(configFactoryOptions.createType === 'drawer') {
			hasEdit = true;
		}
		else if(configFactoryOptions.createType === 'modal') {
			hasEdit = true;
		}

		return hasEdit;
	}

	static _hasShow(hasShow,configFactoryOptions) {

		if(typeof this.hasShow !== 'undefined') {
			return this.hasShow;
		}
		else if(configFactoryOptions.showType === 'drawer') {
			hasShow = true;
		}
		else if(configFactoryOptions.showType === 'modal') {
			hasShow = true;
		}

		return hasShow;
	}

};

export default Api;
