import React          from 'react';
import PropTypes      from 'prop-types';
import {
	TopToolbar,
	EditButton,
} from 'react-admin';
import {
	makeStyles,
} from '@material-ui/core';


const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.type === 'light'
		                 ? theme.palette.grey[100]
		                 : theme.palette.grey[900],
	}
}));


const CustomShowToolbar = props => {

	// if(typeof console === 'object') { console.log('CustomToolbar.props',props); }

	let { data, basePath, editButton, children } = props;

	return (
		<TopToolbar
			className="mtv__show--toolbar"
			classes={useStyles()}
		>
			{editButton && <EditButton
				basePath={basePath}
				record={data}
			/>}
			{children}
		</TopToolbar>
	)
};


CustomShowToolbar.defaultProps = {
	editButton: true,
};

CustomShowToolbar.propTypes = {
	options: PropTypes.object,
	redirect: PropTypes.any,
	editButton: PropTypes.bool,
};

export default CustomShowToolbar;
