
class ApiPlatformUtils {

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
