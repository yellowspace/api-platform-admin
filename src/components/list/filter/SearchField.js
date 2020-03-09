import React from 'react';
// import PropTypes                           from 'prop-types';
import {
	TextInput,
} from 'react-admin';
// import { withTranslate } from 'react-admin';
// import { connect } from 'react-redux';
// import { withStyles } from '@material-ui/core/styles';

function SearchField(props) {
	// if(typeof console === 'object') { console.log('SearchField.props',props); }
	return (
		<TextInput
			{...props}
		/>
	);
};

SearchField.defaultProps = {

};

SearchField.propTypes = {
	// classes: PropTypes.object,
	// translate: PropTypes.func
};

export default SearchField;
// export default withStyles(styles)(withTranslate(ComponentTemplate));
// export default withTranslate(ComponentTemplate);
// export default connect(null,null)(withTranslate(ComponentTemplate));
