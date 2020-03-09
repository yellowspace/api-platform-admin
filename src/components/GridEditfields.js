import React, { useState, useEffect, isValidElement, cloneElement  } from 'react';
import PropTypes                      from 'prop-types';
import { Grid, makeStyles }           from '@material-ui/core';
import { FormInput }                  from 'react-admin';
import {
	TextInput,
	Labeled,
	// Edit as BaseEdit,
	// SimpleForm
} from 'react-admin';
import classnames from 'classnames';
import { FontAwesomeIcon }            from '@fortawesome/react-fontawesome';
import { faProjectDiagram }           from '@fortawesome/free-solid-svg-icons';
// import Labeled from '../input/Labeled';
// import { withTranslate } from 'react-admin';
// import { connect } from 'react-redux';
// import { withStyles } from '@material-ui/core/styles';



let useStyles = makeStyles(function (theme) {
	return (
		{
			root: {
				// flexGrow: 1,
				// margin: '10px 0 0 10px',
				justify: 'flex-start',
				justifyContent: 'space-between',
				margin: 0,
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
	const {api,options} = props;
	const {inputFactory,addIdInput,editields} = props;
	const {fieldFactory,addIdField,showfields} = props;
	const {formTabIdx} = props;

	const { basePath, record, resource, variant, margin } = props;

	// if(typeof console === 'object') { console.log('props',props); }
	let gridCols = [{},{}];
	// let gridCollength = gridCols.length;
	let fieldLength = 0;
	if(editields && editields.length) {
		fieldLength = editields.length;
	} else if (showfields && showfields.length) {
		fieldLength = showfields.length;
	}

	let n2w = false;

	// if(typeof console === 'object') { console.log('editields',editields); }

	const checkFieldTab = (field,idx) => {

		if(
			field.formTab === idx ||
			(idx === 1 &&  (!field.formTab))
		) {
			return true;
		}


		return false;

	};

	const checkGridCol = (fieldIdx,idx,field) => {
		let r = false;

		// if(typeof console === 'object') { console.log('fieldIdx,idx,field',fieldIdx,idx,field); }

		if(formTabIdx) {
			if(!checkFieldTab(field,formTabIdx)) {
				return false;
			}
		}

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

							{showfields && showfields.map( ( field, fieldIdx ) => {

								if ( checkGridCol( fieldIdx, idx, field ) ) {
									// if(typeof console === 'object') { console.log('SHOW field',field); }
									let nf;

									if(options && options.configFactory && options.configFactory.conf) {
										nf = options.configFactory.conf.sanitizeShowFieldOptions(field);
									} else {
										nf = {...field};
										// nf.fieldProps.addLabel = true;
										nf.InlineEditorField = false;
									}

									let f = fieldFactory( nf, {
										api,
										resource,
									} );

									return f && isValidElement(f) ? (React.createElement("div", { key: f.props.source, className: classnames("ra-field ra-field-" + f.props.source, f.props.className) }, f.props.addLabel ? (React.createElement(Labeled, { record: record, resource: resource, basePath: basePath, label: f.props.label, source: f.props.source, disabled: false }, f)) : typeof f.type === 'string' ? (f) : (cloneElement(f, {
										record: record,
										resource: resource,
										basePath: basePath,
									})))) : null;

									// return React.createElement( input, {
									// 	key     : field.name,
									// 	basePath: basePath,
									// 	record  : record,
									// 	resource: resource,
									// 	variant : variant,
									// 	margin  : margin
									// } );

								}

								return null;
							} )}

							{editields && editields.map( ( field, fieldIdx ) => {

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
							} )}

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
