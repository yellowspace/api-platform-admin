import React          from 'react';
import PropTypes      from 'prop-types';
import SaveButton     from '../../../common/components/react-admin/form/actions/SaveButton';
// import RA_SaveButton  from '../../../common/components/react-admin/form/actions/RA_SaveButton';
import {
	Toolbar,
	// SaveButton as RA_SaveButton,
	DeleteButton,
	CloneButton
}                     from 'react-admin';
import { makeStyles } from '@material-ui/core';
// import { withTranslate } from 'react-admin';
// import { connect } from 'react-redux';
// import { withStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
	toolbar: {
		display: 'flex',
		justifyContent: 'space-between',
	},
});


const CustomCreatorToolbar = props => {

	// if(typeof console === 'object') { console.log('CustomToolbar.props',props); }

	let { options } = props;
	options = options || {};

	return (
		<Toolbar
			{...props}
			className="mtv__editor--toolbar"
			classes={useStyles()}
			redirect={props.redirect}
		>
			<SaveButton redirect={props.redirect} actionType="create" options={options} />
		</Toolbar>
	)
};


CustomCreatorToolbar.defaultProps = {

};

CustomCreatorToolbar.propTypes = {
	options: PropTypes.object,
	redirect: PropTypes.any
};

export default CustomCreatorToolbar;
// export default withStyles(styles)(withTranslate(ComponentTemplate));
// export default withTranslate(ComponentTemplate);
// export default connect(null,null)(withTranslate(ComponentTemplate));
