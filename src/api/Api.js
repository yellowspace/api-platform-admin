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
		// let listFields = ObjectUtils.clonelDeep(lFs);
		// let listFields = ObjectUtils.clone(lFs);
		// let listFields = lFs;

		listFields.forEach((f) => {
			let name = f.name;
			if(fields[name]) {
				// lf.push(Object.assign(f,fields[name]));
				// if(typeof console === 'object') { console.log('mapFields.f,fields[name]',f,fields[name]); }
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

	static sanitizeShowFieldOptions(field) {

		let f = {...field};

		if(field.fieldProps) {
			f.fieldProps = {...field.fieldProps};
		}

		if(!f.fieldProps) {
			f.fieldProps = {};
		}

		if(typeof f.fieldProps.addLabel === 'undefined') {
			f.fieldProps.addLabel = true;
		}

		f.InlineEditorField = false;

		// if(typeof console === 'object') { console.log('sanitizeShowField',f); }

		return f;
	}

	static sanitizeInputFieldOptions(field,o = {}) {

		let f = {...field};
		// let f = ObjectUtils.cloneDeep(field);
		if(field.inputProps) {
			f.inputProps = {...field.inputProps};
		}

		if(!f.inputProps) {
			f.inputProps = {};
		}

		f.inputProps.autoFocus = false;
		// if(typeof console === 'object') { console.log('sanitizeInputFieldOptions',f); }

		if(o.removeLabel && typeof f.inputProps.label !== 'undefined') {
			// if(typeof console === 'object') { console.log('sanitizeInputFieldOptions.removeLabel',f.name,f,o); }
			f.inputProps.label = false;
		}

		if(o.removeResettable) {
			if(typeof f.inputProps.resettable !== 'undefined') {
				// if(typeof console === 'object') { console.log('sanitizeInputFieldOptions.resettable',f.name,f,o); }
				delete(f.inputProps.resettable);
			}
			if(typeof f.inputProps.clearAlwaysVisible !== 'undefined') {
				delete(f.inputProps.clearAlwaysVisible);
			}
		}

		// if(typeof console === 'object') { console.log('sanitizeInputFieldOptions',f.name,f,o); }
		return f;
	}

	static _hasEdit(hasEdit,configFactoryOptions) {
		// if(typeof console === 'object') { console.log('_hasEdit',_hasEdit,configFactoryOptions); }

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
		// if(typeof console === 'object') { console.log('_hasShow',hasShow,configFactoryOptions); }

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
