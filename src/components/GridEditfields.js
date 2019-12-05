import React, { useState, useEffect } from 'react';
import PropTypes                      from 'prop-types';
import { Grid, makeStyles }           from '@material-ui/core';
import { FormInput }                  from 'react-admin';
import {
	TextInput,
	// Edit as BaseEdit,
	// SimpleForm
}                                     from 'react-admin';
import { FontAwesomeIcon }            from '@fortawesome/react-fontawesome';
import { faProjectDiagram }           from '@fortawesome/free-solid-svg-icons';
// import { withTranslate } from 'react-admin';
// import { connect } from 'react-redux';
// import { withStyles } from '@material-ui/core/styles';



let useStyles = makeStyles(function (theme) {
	return (
		{
			root: {
				// flexGrow: 1,
				margin: '10px 0 0 10px',
				justify: 'flex-start',
				justifyContent: 'space-between',
			},
			rowroot: {
				// flexGrow: 1,
				margin: '3px 0 0 3px',
				justify: 'flex-start',
				justifyContent: 'space-between',
			},
			item: {
				// marginRight: '20px',
				marginBottom: '10px',
				whiteSpace: 'nowrap',
			},
		}
	);
});


/**
 * see @link node_modules/ra-ui-materialui/esm/form/SimpleForm.js
 * //  Children.map(children, function (input) { return (React.createElement(FormInput,
 * { basePath: basePath, input: input, record: record, resource: resource, variant: variant, margin: margin }));
 *
 * @param props
 * @returns {*}
 * @constructor
 */
const GridEditfields = (props) => {

	// if(typeof console === 'object') { console.log('GridEditfields',props); }

	const classes = useStyles();
	const {inputFactory,addIdInput,editields,api} = props;
	const { basePath, record, resource, variant, margin } = props;

	// if(typeof console === 'object') { console.log('props',props); }
	let gridCols = [{},{}];
	// let gridCollength = gridCols.length;
	let fieldLength = editields.length;
	let n2w = false;

	const checkGridCol = (fieldIdx,idx,field) => {
		let r = false;


		if(field.col === idx) {
			return true;
		}

		if(n2w) {
			if ( typeof field.col === 'undefined' && fieldIdx % 2 === idx ) {
				return true;
			}
		}
		else {

			// if(typeof console === 'object') { console.log('idx',field.col,idx,fieldIdx,fieldLength,fieldLength /2); }

			if(typeof field.col === 'undefined' && idx === 0 && fieldIdx < fieldLength /2) {
				return true;
			}
			else if(typeof field.col === 'undefined' && idx === 1 && fieldIdx >= fieldLength /2) {
				return true;
			}
		}

		return r;
	};

	return (
		<React.Fragment>
			{1===2 && addIdInput && <TextInput disabled source="id" />}
			{1===2 && addIdInput && <TextInput type="hidden" source="id" label={null} />}
			<Grid
				container
				spacing={2}
				direction="row"
				style={{
					margin: 0
				}}
				className={classes.root}
			>

				{gridCols.map((col, idx) => {
					return (
						<Grid
							key={'col'+idx}
							item
							className={classes.item}

							{...col}
							xs
						>
							{editields.map( ( field, fieldIdx ) => {

								let input = inputFactory( field, {
									api,
									resource,
								} );

								if ( checkGridCol( fieldIdx, idx, field ) ) {

									return React.createElement( FormInput, {
										key     : field.name,
										basePath: basePath,
										input   : input,
										record  : record,
										resource: resource,
										variant : variant,
										margin  : margin
									} );

								}

								return null;
							} )
							}

						</Grid>
					)
				})}
			</Grid>
		</React.Fragment>
	);
};


GridEditfields.defaultProps = {

};

GridEditfields.propTypes = {
	// classes: PropTypes.object,
	// translate: PropTypes.func
};

export default GridEditfields;
// export default withStyles(styles)(withTranslate(ComponentTemplate));
// export default withTranslate(ComponentTemplate);
// export default connect(null,null)(withTranslate(ComponentTemplate));
