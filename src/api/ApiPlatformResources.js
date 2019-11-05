import Api from './Api';


class ApiPlatformResources extends Api {

	static resources = {};

	static setResources(resources) {
		resources.map((r,i) => {
			this.resources[r.key] = r.props;
			return r;
		});

		if(typeof process.env.NODE_ENV !== 'undefined' && process.env.NODE_ENV === `development`) {
			if ( typeof console === 'object' ) { console.log( 'this.resources', this.resources ); }
		}
	}


	static getResourceOptions(key) {
		return this.resources[key].options;
	}

	static getResource(key) {
		return this.resources[key].options.resource;
	}

}

export default ApiPlatformResources;
