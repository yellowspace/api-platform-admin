import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {
	EditButton,
	List as BaseList,
	ShowButton,
	TextField,
	TopToolbar,
	CreateButton,
	RefreshButton,
	ExportButton,
	Button as RA_Button,
	// ResetViewsButton,
	BulkDeleteButton,
	// Responsive

} from 'react-admin';

import PropTypes                      from 'prop-types';
import React, { useEffect, useState } from 'react';
import ListFilter                     from './ListFilter';
import {isFieldSortable}              from './fieldFactory';
import { makeStyles, IconButton, Button }   from '@material-ui/core';
import { Clear }   from '@material-ui/icons';

import MuiDrawer        from '../../common/components/common/MuiDrawer';
import { Route }        from 'react-router-dom';
import History          from '../../src/admin-containers/History';
import Show             from './Show';
import MuiDrawerEditor  from '../../common/components/react-admin/form/MuiDrawerEditor';
import MuiDrawerCreator from '../../common/components/react-admin/form/MuiDrawerCreator';
import DataGridWrapper  from '../../common/components/grid/react-admin/DataGridWrapper';
import memoize          from "memoize-one";
import ObjectUtils      from '../../common/utils/ObjectUtils';


let useStyles = makeStyles(function (theme) {
	return ({
		drawerContent: {
			width: 300
		},
		w60: {
			width: 60
		}
		// toolbar: {
		// 	paddingLeft: theme.spacing(3),
		// 	paddingRight: theme.spacing(3),
		// 	[theme.breakpoints.down('xs')]: {
		// 		paddingLeft: theme.spacing(3),
		// 	},
		// 	[theme.breakpoints.up('xs')]: {
		// 		paddingLeft: theme.spacing(3),
		// 	},
		// 	[theme.breakpoints.up('sm')]: {
		// 		paddingLeft: theme.spacing(3),
		// 	},
		// }
	});
});

const TagListActions = ( props ) => {

	let {
		basePath,
		currentSort,
		displayedFilters,
		exporter,
		filters,
		filterValues,
		onUnselectItems,
		resource,
		selectedIds,
		showFilter,
		total,
		...rest
	} = props;

	// let styles = useStyles();

	// if(typeof console === 'object') { console.log('basePath,rest',basePath,rest); }

	return (
	   <TopToolbar
	    className="mtv__list--actiontoolbar"
	   >
		   <BulkActionButtons {...props} />
		   <RefreshButton label={null} />
		   {filters && React.cloneElement(filters, {
			   resource,
			   showFilter,
			   displayedFilters,
			   filterValues,
			   context: 'button',
		   })}
		   <CreateButton
			   basePath={basePath}
			   // basePath="/project"
		   />
		   <ExportButton
			   disabled={total === 0}
			   resource={resource}
			   sort={currentSort}
			   filter={filterValues}
			   exporter={exporter}
		   />
		   {/* Add your custom actions */}
		   {/*<Button color="primary" onClick={customAction}>Custom Action</Button>*/}
	   </TopToolbar>
	)
};

const BulkActionButtons = props => {

	const {
		basePath,
		selectedIds,
		resource,
		onSelect
	} = props;

	// let {
	// 	currentSort,
	// 	displayedFilters,
	// 	exporter,
	// 	filters,
	// 	filterValues,
	// 	onUnselectItems,
	// 	showFilter,
	// 	total,
	// 	...rest
	// } = props;

	if(1===2 && typeof console === 'object') { console.log('BulkActionButtons',props,basePath,
		selectedIds,
		resource); }

	return (
		<React.Fragment>
			{/*<ResetViewsButton label="Reset Views" {...props} />*/}
			{/* default bulk delete action */}
			{selectedIds && selectedIds.length > 0 && <BulkDeleteButton
				basePath={basePath}
				selectedIds={selectedIds}
				resource={resource}
				label={"(" + selectedIds.length +")"}
			/>}
			{selectedIds && selectedIds.length > 0 && <RA_Button
				size="small"
				color="primary"
				icon={<Clear />}
				label={"(" + selectedIds.length +")"}
				onClick={() => {
					onSelect([])
				}}>
				<Clear fontSize="small" />
			</RA_Button>
			}
		</React.Fragment>
	);
}

const hasIdentifier = fields => {
  return (
    undefined !== fields.find(({id}) => 'http://schema.org/identifier' === id)
  );
};


const resolveProps = props => {
  const {options} = props;
  const {
    fieldFactory: defaultFieldFactory,
    parameterFactory,
    listFieldFilter,
    resource,
  } = options;
  const {
    listFields: customFields,
    listProps = {},
    readableFields: defaultFields,
  } = resource;
  const {options: {fieldFactory: customFieldFactory} = {}} = listProps;

  return {
    ...props,
    ...listProps,
    options: {
      ...options,
      fields:
        customFields || defaultFields.filter(({deprecated}) => !deprecated),
      fieldFactory: customFieldFactory || defaultFieldFactory,
      parameterFactory: parameterFactory,
      parameters: resource.parameters,
      listFieldFilter: listFieldFilter,
    },
  };
};

const List_DG = props => {

	let styles = useStyles();

	const handleClose = () => {
		// if(typeof console === 'object') { console.log('handleClose',true); }
		History.push( props.basePath);
		// props.push('/tags');
	};

	let {
		hasEdit,
		hasShow,
		options: {
			api,
			fieldFactory,
			fields,
			parameterFactory,
			parameters,
			listFieldFilter,
			resource,
			configFactory
		},
		addIdField = false === hasIdentifier(fields),
	} = resolveProps(props);

	const {permanentFilter,...rest} = props;

	  // if(typeof console === 'object') { console.log('LIST props %o configFactory %o',props,configFactory); }
	let confDefaults = {};

	const [sort, setSort] = useState({});
	const [filter, setFilter] = useState(permanentFilter);
	const [filterDefaultValues, setFilterDefaultValues] = useState(null);

	const getFilterValues = () => {
		// filter=Component
		// filters={<PostFilter />} // <-- always on
		// filterDefaultValues={{ is_published: true }}
		// confDefaults.filter = <TextInput label="Search" source="q" alwaysOn />;
		const { conf } = configFactory;
		// const { permanentFilter } = props;
		let filter = permanentFilter,
			filterDefaultValues = {};

		if(conf && typeof conf.getGridPermanentFilter === 'function') {
			filter = conf.getGridPermanentFilter(filter);
			filterDefaultValues = conf.getGridFilterDefaults(null);
		}

		if(filter) {
			setFilter(filter);
		}

		if(filterDefaultValues) {
			setFilterDefaultValues(filterDefaultValues);
		}
	};

	const getSort = () => {
		// confDefaults.sort={ field: 'title', order: 'DESC' };

		const { conf } = configFactory;

		if(conf && typeof conf.getGridSorting === 'function') {
			let sort = conf.getGridSorting(conf);
			if(sort) {
				// confDefaults.sort = sort;
				setSort(sort);
			}
		}
	};


	useEffect(() => {
		getFilterValues();
		getSort();
		// console.log('ComponentDidMount: sort,filter,filterDefaultValue',sort,filter,filterDefaultValues);
	},[permanentFilter]);

	let { perPage, ...editProps} = props;
	let listFields = fields;
	if(configFactory.conf) {
		listFields = configFactory.conf.getGridColumns(listFields);
		hasEdit = configFactory.conf._hasEdit(hasEdit,configFactory.options);
		hasShow = configFactory.conf._hasShow(hasShow,configFactory.options);
		editProps.hasEdit = hasEdit;
		editProps.hasShow = hasShow;
	}

	addIdField = false;


	const manipulateField = memoize(
		(field) => {

			if(
				field.fieldProps
				&& field.fieldProps.cellAndHeaderClassName
			) {
				// if(typeof console === 'object') { console.log('MEMO manipulateField',field,typeof field.fieldProps.headerClassName); }

				field.fieldProps.cellClassName = field.fieldProps.cellAndHeaderClassName;
				field.fieldProps.headerClassName = field.fieldProps.cellAndHeaderClassName;
			}


			return field;
		}
	);

	const memoFieldFactory = memoize(
		(field,api,resource) => {

			return fieldFactory( field, {
				api,
				resource,
			} );
		}
	);

	// if(typeof console === 'object') { console.log('configFactory.conf',configFactory.conf,listFields); }
	// if(typeof console === 'object') { console.log('configFactory.options.createType',configFactory.options); }
	// if(typeof console === 'object') { console.log('BaseList',rest,confDefaults); }

	return (
		<React.Fragment>
			<BaseList
				{...rest}
				{...confDefaults}
				sort={sort}
				filter={filter}
				filterDefaultValues={filterDefaultValues}
				pagination={<React.Fragment />}
				actions={<TagListActions />}
				filters={<ListFilter options={{parameterFactory, parameters, configFactory}} />}
				bulkActionButtons={false}
				className="mtv__list"
				classes={{
					content:'mtv__list--content',
					main: 'mtv__list--main',
					root: 'mtv__list--root',
					// toolbar:'mtv__list--toolbar',
					// actions: 'mtv__list--toolbar--actions',
				}}
			>
				<DataGridWrapper
					conf={configFactory.conf}
					isRowSelectable={true}
					// optimized={true}
					// rowClick={}
					// expand={<Component />}
					// isRowSelectable=={ record => record.id > 300 }

					// hasBulkActions={true}
					// paginationComponent={true}
					// toolbar={true}
					// toolbarComponent={true}
				>
					{addIdField && (
						<TextField
							source="id"
							sortable={isFieldSortable({name: 'id'}, resource)}
						/>
					)}
					{listFields
						.filter(field => !listFieldFilter || listFieldFilter(resource, field))
						.map(field => {
							field = manipulateField(field);
							return memoFieldFactory(field,api,resource);

							// return fieldFactory( field, {
							// 	api,
							// 	resource,
							// } );
						})}
					{hasShow && <ShowButton
						label={null}
						width={80}
						// cellClassName={styles.w60}
					/>}
					{hasEdit && <EditButton
						// cellClassName={styles.w60}
						// basePath="/project"
						label={null}
						width={80}
					/>}
				</DataGridWrapper>
			</BaseList>
			{configFactory.options.createType === 'drawer' &&<Route
				path={props.basePath + '/create'}
			>
				{({ match }) => {

					// if(typeof console === 'object') { console.log('CREATE MATCH',match); }

					return (
						<MuiDrawerCreator
							isOpen={!!match}
							{...editProps}
							handleEditorClose={handleClose}
							// initialValues={initialValues}
							// options={props.options}
							// location={props.location}
							// redirect={(redirect,id,record) => {
							// 	// if(typeof console === 'object') { console.log('FORM redirect',redirect,id,record); }
							// 	handleEditorSave(redirect,id,record);
							// }}

						/>
					);
				}}
			</Route>}
			{configFactory.options.editType === 'drawer' && <Route
				path={props.basePath + '/:id'}
			>
				{({ match }) => {

					const isMatch = match && match.params && match.params.id !== 'create' ? true : false;
					// if(isMatch && typeof console === 'object') { console.log('EDIT ROUTE match,isMatch',decodeURIComponent(match.params.id),encodeURIComponent(match.params.id),match,isMatch); }

					let id = null;
					if(isMatch) {
						id = match.params.id;
						if(typeof id === 'string') {
							id = decodeURIComponent(id);
						}
					}

					// if(typeof console === 'object') { console.log('editProps',editProps); }

					return (<MuiDrawerEditor
						resource={props.name}
						isOpen={isMatch}
						id={isMatch ? id : null}
						{...editProps}
						// options={Object.assign({},editProps.options,{cloneButton: false})}
						handleEditorClose={handleClose}
						// redirect={(redirect,id,record) => {
						// 	// if(typeof console === 'object') { console.log('FORM redirect',redirect,id,record); }
						// 	handleEditorSave(redirect,id,record);
						// }}
					/>);
				}}
			</Route>}
			{configFactory.options.showType === 'drawer' && <Route
				path={props.basePath + '/:id/show'}
			>
				{({ match }) => {

					const isMatch = match && match.params && match.params.id !== 'create' ? true : false;
					// if(isMatch && typeof console === 'object') { console.log('EDIT ROUTE match,isMatch',decodeURIComponent(match.params.id),encodeURIComponent(match.params.id),match,isMatch); }

					let id = null;
					if(isMatch) {
						id = match.params.id;
						if(typeof id === 'string') {
							id = decodeURIComponent(id);
						}
					}

					return (
						<MuiDrawer
							open={isMatch}
							anchor="right"
							onClose={handleClose}
						>
							{isMatch ? (
								<Show
									className={styles.drawerContent}
									id={isMatch ? id : null}
									onCancel={handleClose}
									{...editProps}
								/>
							) : (
								 <div className={styles.drawerContent} />
							 )}
						</MuiDrawer>
					);
				}}
			</Route>}
		</React.Fragment>
	);
};

List_DG.defaultProps = {
  perPage: 50, // Default value in API Platform
};

List_DG.propTypes = {
	addIdField: PropTypes.bool,
	options: PropTypes.shape({
		api: PropTypes.instanceOf(Api).isRequired,
		fieldFactory: PropTypes.func.isRequired,
		parameterFactory: PropTypes.func.isRequired,
		listProps: PropTypes.object,
		resource: PropTypes.instanceOf(Resource).isRequired,
	}),
	perPage: PropTypes.number,
	hasEdit: PropTypes.bool.isRequired,
	hasShow: PropTypes.bool.isRequired,
	permanentFilter: PropTypes.object,
};

function areEqual(prevProps, nextProps) {
		// if(typeof console === 'object') { console.log('List_DG.isEqualAll',prevProps, nextProps); }

	// let isEqualAll = ObjectUtils.fastDeepEqual(prevProps, nextProps);
	// if(isEqualAll) {
	// 	if(typeof console === 'object') { console.log('isEqualAll',prevProps, nextProps); }
	// 	return true;
	// } else {
	// 	if(typeof console === 'object') { console.log('isNOTEqualAll',prevProps, nextProps); }
	//
	// }

	let a = {
		ids: prevProps.ids,
	};
	let b = {
		ids: nextProps.ids,
	};

	let isEqualA = ObjectUtils.isEqual(a,b);
	if(isEqualA) {
		// if(typeof console === 'object') { console.log('areEqual',prevProps, nextProps); }
		// if(typeof console === 'object') { console.log('this.props.isEqualA',isEqualA,a,b); }
		// return true;
	}

	/*
	 return true if passing nextProps to render would return
	 the same result as passing prevProps to render,
	 otherwise return false
	 */
}
export default React.memo(List_DG,areEqual);
