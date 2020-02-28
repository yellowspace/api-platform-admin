import ObjectUtils from "../../../common/utils/ObjectUtils";
import ApiPlatformResources from "../api/ApiPlatformResources";
import fieldFactory from '../fieldFactory';
import inputFactory from '../inputFactory';

class ApiPlatformUtils {

	static getFieldFactory() {
		return fieldFactory;
	};

	static getInputFactory() {
		return inputFactory;
	};

	static findField(reference,source) {

		let options = ApiPlatformResources.getResourceOptions(reference);

		const {
			options: {
				api,
				fieldFactory,
				fields,
				resource,
				configFactory
			},
		} = ApiPlatformUtils.resolveShowProps( {options: options} );

		let showfields = fields;

		if(configFactory && configFactory.conf) {
			showfields = configFactory.conf.getShowFields(showfields);
		}

		return  {
			api,
			fieldFactory,
			fields,
			resource,
			configFactory,
			field: ObjectUtils.findRecord(showfields,{name: source})
		}
	};

	static findInputField(reference,source) {

		let options = ApiPlatformResources.getResourceOptions(reference);

		let {
			options: {
				api,
				fields,
				inputFactory,
				configFactory,
				resource
			},
		} = ApiPlatformUtils.resolveEditorProps({options: options});

		let editfields = fields;

		if(configFactory && configFactory.conf) {
			editfields = configFactory.conf.getFormFields(editfields);
		}

		return  {
			api,
			inputFactory,
			fields,
			resource,
			configFactory,
			field: ObjectUtils.findRecord(editfields,{name: source})
		}
	};

	static resolveShowProps(props) {
		const {options} = props;
		const {fieldFactory: defaultFieldFactory, resource} = options;
		const {
			showFields: customFields,
			readableFields: defaultFields,
			showProps = {},
		} = resource;
		const {options: {fieldFactory: customFieldFactory} = {}} = showProps;

		return {
			...props,
			...showProps,
			options: {
				...options,
				fields:
					customFields || defaultFields.filter(({deprecated}) => !deprecated),
				fieldFactory: customFieldFactory || defaultFieldFactory,
			},
		};
	};

	static resolveEditorProps(props) {
		const {options} = props;
		const {inputFactory: defaultInputFactory, resource} = options;
		const {
			editFields: customFields,
			editProps = {},
			writableFields: defaultFields,
		} = resource;
		const {options: {inputFactory: customInputFactory} = {}} = editProps;

		return {
			...props,
			...editProps,
			options: {
				...options,
				fields:
					customFields || defaultFields.filter(({deprecated}) => !deprecated),
				inputFactory: customInputFactory || defaultInputFactory,
			},
		};
	};

	static resolveCreatorProps(props) {
		const {options} = props;
		const {inputFactory: defaultInputFactory, resource} = options;
		const {
			createFields: customFields,
			createProps = {},
			writableFields: defaultFields,
		} = resource;
		const {options: {inputFactory: customInputFactory} = {}} = createProps;

		return {
			...props,
			...createProps,
			options: {
				...options,
				fields:
					customFields || defaultFields.filter(({deprecated}) => !deprecated),
				inputFactory: customInputFactory || defaultInputFactory,
			},
		};
	};

}

export default ApiPlatformUtils;
