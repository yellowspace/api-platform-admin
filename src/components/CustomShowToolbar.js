import React          from 'react';
import PropTypes      from 'prop-types';
// import RA_SaveButton  from '../../../common/components/react-admin/form/actions/RA_SaveButton';
import {
	// Toolbar,
	TopToolbar,
	EditButton,
	// SaveButton as RA_SaveButton,
}                     from 'react-admin';
import {
	makeStyles,
	// Toolbar,
} from '@material-ui/core';
// import { withTranslate } from 'react-admin';
// import { connect } from 'react-redux';
// import { withStyles } from '@material-ui/core/styles';

//useStyles = makeStyles(theme => ({
const useStyles = makeStyles(theme => ({
	// toolbar: {
	// 	display: 'flex',
	// 	justifyContent: 'space-between',
	// },
	root: {
		backgroundColor: theme.palette.type === 'light'
		                 ? theme.palette.grey[100]
		                 : theme.palette.grey[900],
	}
}));


const CustomShowToolbar = props => {

	// if(typeof console === 'object') { console.log('CustomToolbar.props',props); }

	let { data, basePath } = props;

	return (
		<TopToolbar
			className="mtv__show--toolbar"
			classes={useStyles()}
		>
			<EditButton
				basePath={basePath}
				record={data}
			/>
		</TopToolbar>
	)
};


CustomShowToolbar.defaultProps = {

};

CustomShowToolbar.propTypes = {
	options: PropTypes.object,
	redirect: PropTypes.any
};

export default CustomShowToolbar;
// export default withStyles(styles)(withTranslate(ComponentTemplate));
// export default withTranslate(ComponentTemplate);
// export default connect(null,null)(withTranslate(ComponentTemplate));
