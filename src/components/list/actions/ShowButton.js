import React from 'react';
import PropTypes                           from 'prop-types';
import {
	ShowButton as RA_ShowButton
} from 'react-admin';
// import { withTranslate } from 'react-admin';
// import { connect } from 'react-redux';
// import { withStyles } from '@material-ui/core/styles';

function ShowButton(props) {

	const {
		cellClassName,
		headerClassName,
		...rest
	} = props;

	return (
		<RA_ShowButton
			{...rest}
		/>
	);
};

ShowButton.defaultProps = {

};

ShowButton.propTypes = {
	cellClassName: PropTypes.string,
	headerClassName: PropTypes.string,
};

export default ShowButton;
// export default withStyles(styles)(withTranslate(ComponentTemplate));
// export default withTranslate(ComponentTemplate);
// export default connect(null,null)(withTranslate(ComponentTemplate));
