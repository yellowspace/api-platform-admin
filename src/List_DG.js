import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {
	List as BaseList,
	TextField,
	TopToolbar,
	CreateButton,
	RefreshButton,
	ExportButton,
	Button as RA_Button,
	BulkDeleteButton,
} from 'react-admin';

import PropTypes                      from 'prop-types';
import React, { useEffect, useState } from 'react';
import ListFilter                     from './ListFilter';
import {isFieldSortable}              from './fieldFactory';
import { makeStyles }   from '@material-ui/core';
import { Clear }   from '@material-ui/icons';

import MuiDrawer        from '../../common/components/common/MuiDrawer';
import { Route }        from 'react-router-dom';
import History          from '../../src/admin-containers/History';
import Show             from './Show';
import MuiDrawerEditor        from '../../common/components/react-admin/form/MuiDrawerEditor';
import MuiDrawerCreator       from '../../common/components/react-admin/form/MuiDrawerCreator';
import DataGridWrapper        from '../../common/components/grid/react-admin/DataGridWrapper';
import memoize                from "memoize-one";
import ObjectUtils            from '../../common/utils/ObjectUtils';
import EditButton             from './components/list/actions/EditButton';
import ShowButton             from './components/list/actions/ShowButton';
import GlobalLoadingIndicator from '../../common/components/react-admin/components/GlobalLoadingIndicator';
import MuiModalEditor         from '../../common/components/react-admin/form/MuiModalEditor';
import MuiModalCreator        from '../../common/components/react-admin/form/MuiModalCreator';
import MuiDrawerShow          from '../../common/components/react-admin/form/MuiDrawerShow';
import MuiModalShow           from '../../common/components/react-admin/form/MuiModalShow';


let useStyles = makeStyles(function (theme) {
	return ({
		drawerContent: {
			width: 300
		},
		w60: {
			width: 60,
			overflow: 'hidden',
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
		   {1===2 &&<RefreshButton label={null} />}
		   <GlobalLoadingIndicator
			   showRefresh={true}
			   refreshButtonType="button"
			   refreshButtonProps={{label: null}}
			   circularProgressProps={{
			   	style: {
				    margin  : '8px 24px',
				    width: '14px',
				    height: '14px',
				    fontSize: '0.8125rem',
				    color   : '#e8eaf6'
			    }
			   }}
		   />
		   {1===1 && filters && React.cloneElement(filters, {
			   resource,
			   showFilter,
			   displayedFilters,
			   filterValues,
			   context: 'button',
		   })}
		   <CreateButton
			   basePath={basePath}
			   label={null}
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

	// if(typeof console === 'object') { console.log('List_DG',props); }

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
	const { conf } = configFactory;
	  // if(typeof console === 'object') { console.log('LIST props %o configFactory %o',props,configFactory); }
	let confDefaults = {};

	// const [sort, setSort] = useState({});
	// const [filter, setFilter] = useState(permanentFilter);
	// const [filterDefaultValues, setFilterDefaultValues] = useState(null);

	const getFilterValues = memoize(
		(permanentFilter, conf) => {
			// filter=Component
			// filters={<PostFilter />} // <-- always on
			// filterDefaultValues={{ is_published: true }}
			// confDefaults.filter = <TextInput label="Search" source="q" alwaysOn />;

			// const { permanentFilter } = props;
			let filter = permanentFilter,
				filterDefaultValues = {};

			if ( conf && typeof conf.getGridPermanentFilter === 'function' ) {
				filter = conf.getGridPermanentFilter( filter );
				filterDefaultValues = conf.getGridFilterDefaults( null );
			}

			// if ( filter ) {
			// 	setFilter( filter );
			// }
			//
			// if ( filterDefaultValues ) {
			// 	setFilterDefaultValues( filterDefaultValues );
			// }

			return {
				filter: filter,
				filterDefaultValues: filterDefaultValues
			}
		}
	);

	const getSort = memoize(
		(conf) => {

			// const { conf } = configFactory;
			// if(typeof console === 'object') { console.log('getSort',conf); }
			if(conf && typeof conf.getGridSorting === 'function') {
				let sort = conf.getGridSorting(conf);
				if(sort) {
					// confDefaults.sort = sort;
					return sort;
				}
			}


		}
	);

	// useEffect(() => {
	// 	getFilterValues();
	// 	// getSort();
	// 	// console.log('ComponentDidMount: sort,filter,filterDefaultValue',sort,filter,filterDefaultValues);
	// },[permanentFilter]);

	let { perPage, ...editProps} = props;
	let listFields = fields;
	if(conf) {
		listFields = conf.getGridColumns(listFields);
		hasEdit = conf._hasEdit(hasEdit,configFactory.options);
		hasShow = conf._hasShow(hasShow,configFactory.options);
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

	const getRowClick = () => {
		// edit, show, expand, function
		return 'toggleSelection';
	};

	// if(typeof console === 'object') { console.log('configFactory.conf',configFactory.conf,listFields); }
	// if(typeof console === 'object') { console.log('configFactory.options.createType',configFactory.options); }
	// if(typeof console === 'object') { console.log('BaseList',rest,confDefaults); }

	const { filter, filterDefaultValues } = getFilterValues(permanentFilter, conf);

	return (
		<React.Fragment>
			<BaseList
				{...rest}
				{...confDefaults}
				sort={getSort(conf)}
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
					conf={conf}
					isRowSelectable={true}
					getSort={getSort}
					rowClick={getRowClick()}
					gridOptimized={true}
					// setSort={setSort}
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
						cellClassName={styles.w60}
					/>}
					{hasEdit && <EditButton
						cellClassName={styles.w60}
						// basePath="/project"
						label={null}
						width={80}
					/>}
				</DataGridWrapper>
			</BaseList>
			{(configFactory.options.createType === 'drawer' || configFactory.options.createType === 'modal' )&&<Route
				path={props.basePath + '/create'}
			>
				{({ match }) => {

					// if(typeof console === 'object') { console.log('CREATE MATCH',match); }


					if(configFactory.options.createType === 'modal') {
						return (
							<MuiModalCreator
								isOpen={!!match}
								contentWidth="90vh"
								maxWidth={false}
								dialogContentStyle={{
									width: '90vh',
									maxWidth: '800px',
								}}
								title={resource.title}
								closeButton={true}
								disableBackdropClick={true}
								handleEditorClose={handleClose}
								{...editProps}
							/>
						);
					}

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
			{(configFactory.options.editType === 'drawer' || configFactory.options.editType === 'modal') && <Route
				path={props.basePath + '/:id'}
			>
				{({ match, location }) => {

					const isMatch = match && match.params && match.params.id !== 'create' && location.pathname.indexOf('/show') === -1 ? true : false;
					// if(isMatch && typeof console === 'object') { console.log('EDIT ROUTE match,isMatch',decodeURIComponent(match.params.id),encodeURIComponent(match.params.id),match,isMatch,rest); }
					// if(typeof console === 'object') { console.log('editor',props.name,props,resource,editProps); }
					let id = null;
					if(isMatch) {
						id = match.params.id;
						if(typeof id === 'string') {
							id = decodeURIComponent(id);
						}
					}

					// if(typeof console === 'object') { console.log('editProps',editProps); }
					if(configFactory.options.editType === 'modal') {
						return (
							<MuiModalEditor
								contentWidth="90vh"
								maxWidth={false}
								dialogContentStyle={{
									width   : '90vh',
									maxWidth: '800px',
								}}
								title={resource.title}
								closeButton={true}
								disableBackdropClick={true}
								isOpen={isMatch}
								id={isMatch ? id : null}
								// options={Object.assign( {}, props.options, { cloneButton: false } )}
								handleEditorClose={handleClose}
								{...editProps}
							/>
						);
					}

					return (<MuiDrawerEditor
						// resource={props.name}
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
			{(configFactory.options.showType === 'drawer' || configFactory.options.showType === 'modal') && <Route
				path={props.basePath + '/:id/show'}
			>
				{({ match }) => {

					const isMatch = match && match.params && match.params.id !== 'create' ? true : false;
					// if(isMatch && typeof console === 'object') { console.log('Show ROUTE match,isMatch',decodeURIComponent(match.params.id),encodeURIComponent(match.params.id),match,isMatch); }

					let id = null;
					if(isMatch) {
						id = match.params.id;
						if(typeof id === 'string') {
							id = decodeURIComponent(id);
						}
					}

					if(configFactory.options.showType === 'modal') {
						return (
							<MuiModalShow
								contentWidth="90vh"
								maxWidth={false}
								dialogContentStyle={{
									width   : '90vh',
									maxWidth: '800px',
								}}
								title={resource.title}
								closeButton={true}
								disableBackdropClick={true}
								isOpen={isMatch}
								id={isMatch ? id : null}
								// options={Object.assign( {}, props.options, { cloneButton: false } )}
								handleEditorClose={handleClose}
								{...editProps}
							/>
						);
					}

					return (
						<MuiDrawerShow
							isOpen={isMatch}
							id={isMatch ? id : null}
							{...editProps}
							// options={Object.assign({},editProps.options,{cloneButton: false})}
							handleEditorClose={handleClose}
						/>
					);

					// return (
					// 	<MuiDrawer
					// 		open={isMatch}
					// 		anchor="right"
					// 		onClose={handleClose}
					// 	>
					// 		{isMatch ? (
					// 			<Show
					// 				className={styles.drawerContent}
					// 				id={isMatch ? id : null}
					// 				onCancel={handleClose}
					// 				{...editProps}
					// 			/>
					// 		) : (
					// 			 <div className={styles.drawerContent} />
					// 		 )}
					// 	</MuiDrawer>
					// );
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
		location: prevProps.location,
		match: prevProps.match,
	};
	let b = {
		location: nextProps.location,
		match: nextProps.match,
	};

	let isEqualA = ObjectUtils.isEqual(a,b);
	if(isEqualA) {
		// if(typeof console === 'object') { console.log('LIST_DG _ IsEqual - DO NOT UPDATE',prevProps, nextProps); }
		// if(typeof console === 'object') { console.log('this.props.isEqualA',isEqualA,a,b); }
		return true;
	}

	/*
	 return true if passing nextProps to render would return
	 the same result as passing prevProps to render,
	 otherwise return false
	 */
}
export default React.memo(List_DG,areEqual);
