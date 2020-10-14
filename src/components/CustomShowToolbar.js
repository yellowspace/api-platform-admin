import React, {cloneElement, isValidElement} from 'react';
import PropTypes      from 'prop-types';
import {
	TopToolbar,
	EditButton,
} from 'react-admin';
import {
	makeStyles,
} from '@material-ui/core';
import ObjectUtils from "../../../common/utils/ObjectUtils";


const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: theme.palette.type === 'light'
		                 ? theme.palette.grey[100]
		                 : theme.palette.grey[900],
	}
}));


const CustomShowToolbar = props => {

	if(typeof console === 'object') { console.log('CustomToolbar.props',props); }

	let { data, basePath, editButton, children, options, resource } = props;

	let conf;
	if(options && options.configFactory && options.configFactory.conf) {
		conf = options.configFactory.conf;
	}

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
			{conf && conf.getShowActions(data).map((action) => {

				if(!isValidElement(action)) {
					return null;
				}

				return cloneElement(action, {
					basePath: basePath,
					resource: resource,
					data: data,
					conf: conf,
				});
			})
			}
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
	resource: PropTypes.string,
};

function areEqual(prevProps, nextProps) {

	let a = {
		basePath: prevProps.basePath,
		resource: prevProps.resource,
		editButton: prevProps.editButton,
		redirect: prevProps.redirect,
		data: prevProps.data,
	};

	let b = {
		// record: nextProps.record,
		basePath: nextProps.basePath,
		resource: nextProps.resource,
		editButton: nextProps.editButton,
		redirect: nextProps.redirect,
		data: nextProps.data,
	};

	let isEqualA = ObjectUtils.fastDeepEqual(a,b);
	if(isEqualA) {
		// if(typeof console === 'object') { console.log('areEqual',prevProps, nextProps); }
		// if(typeof console === 'object') { console.log('this.props.isEqualA',isEqualA,a,b); }
		return true;
	}

	/*
	 return true if passing nextProps to render would return
	 the same result as passing prevProps to render,
	 otherwise return false
	 */
}

export default React.memo(CustomShowToolbar,areEqual);
