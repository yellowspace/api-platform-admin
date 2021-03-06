import React, {cloneElement, isValidElement} from 'react';
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


const CustomEditorToolbar = props => {

	// if(typeof console === 'object') { console.log('CustomToolbar.props',props); }
	let { record, basePath, options, resource } = props;

	options = options || {};

	let cloneButton = (typeof options.cloneButton !== 'undefined') ? options.cloneButton : true;
	let deleteButton = (typeof options.deleteButton !== 'undefined') ? options.deleteButton : true;

	// if(typeof console === 'object') { console.log('CustomToolbar.props',props,cloneButton,deleteButton); }
	let conf;
	if(options && options.configFactory && options.configFactory.conf) {
		conf = options.configFactory.conf;
	}

	return (
		<Toolbar
			{...props}
			className="mtv__editor--toolbar"
			classes={useStyles()}
		>
			<SaveButton undoable={false} redirect={props.redirect} options={options} />
			{/*<RA_SaveButton undoable={false} />*/}
			{deleteButton &&<DeleteButton undoable={false} label={null} />}
			{cloneButton && <CloneButton undoable="" label={null} />}
			{conf && conf.getEditActions(record).map((action) => {

				if(!isValidElement(action)) {
					return null;
				}

				return cloneElement(action, {
					basePath: basePath,
					resource: resource,
					data: record,
					conf: conf,
				});
			})
			}
		</Toolbar>
	)
};


CustomEditorToolbar.defaultProps = {

};

CustomEditorToolbar.propTypes = {
	options: PropTypes.object,
	redirect: PropTypes.any
};

export default CustomEditorToolbar;
// export default withStyles(styles)(withTranslate(ComponentTemplate));
// export default withTranslate(ComponentTemplate);
// export default connect(null,null)(withTranslate(ComponentTemplate));
