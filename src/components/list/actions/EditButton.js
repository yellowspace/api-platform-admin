import React from 'react';
import PropTypes                           from 'prop-types';
import {
	EditButton as RA_EditButton
} from 'react-admin';
// import { withTranslate } from 'react-admin';
// import { connect } from 'react-redux';
// import { withStyles } from '@material-ui/core/styles';

function EditButton(props) {

	const {
		cellClassName,
		headerClassName,
		...rest
	} = props;

	return (
		<RA_EditButton
			{...rest}
		/>
	);
};

EditButton.defaultProps = {

};

EditButton.propTypes = {
	cellClassName: PropTypes.string,
	headerClassName: PropTypes.string,
};

export default EditButton;
// export default withStyles(styles)(withTranslate(ComponentTemplate));
// export default withTranslate(ComponentTemplate);
// export default connect(null,null)(withTranslate(ComponentTemplate));
