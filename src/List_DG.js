import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {
	List as BaseList,
	TextField,
	TopToolbar,
	CreateButton,
	RefreshButton,
	ExportButton,
	Button as RaButton,
	BulkDeleteButton,
} from 'react-admin';

import PropTypes                      from 'prop-types';
import React from 'react';
import ListFilter                     from './ListFilter';
import {isFieldSortable}              from './fieldFactory';
import { makeStyles }   from '@material-ui/core';
import { Clear }   from '@material-ui/icons';
import { Route }        from 'react-router-dom';
import History          from '../../src/admin-containers/History';
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


let useStyles = makeStyles(function () {
	return ({
		drawerContent: {
			width: 300
		},
		w60: {
			width: 60,
			overflow: 'hidden',
		}
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
		resource,
		showFilter,
		total,
	} = props;

	// if(typeof console === 'object') { console.log('TagListActions.basePath,rest',basePath,props); }

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
		   {filters && React.cloneElement(filters, {
			   resource,
			   showFilter,
			   displayedFilters,
			   filterValues,
			   context: 'button',
		   })}
		   <CreateButton
			   basePath={basePath}
			   label={null}
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
			{selectedIds && selectedIds.length > 0 && <RaButton
				size="small"
				color="primary"
				icon={<Clear />}
				label={"(" + selectedIds.length +")"}
				onClick={() => {
					onSelect([])
				}}>
				<Clear fontSize="small" />
			</RaButton>
			}
		</React.Fragment>
	);
};

// const hasIdentifier = fields => {
//   return (
//     undefined !== fields.find(({id}) => 'http://schema.org/identifier' === id)
//   );
// };


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


function LocalList( props ) {

	let styles = useStyles();

	const {
		conf,
		isRowSelectable,
		getSort,
		rowClick,
		gridOptimized,
		addIdField,
		listFields,
		hasEdit,
		hasShow,
		resourceObj,
		api,
		listFieldFilter,
		fieldFactory,
		groupBy,

		...rest
	} = props;

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
			// if(typeof console === 'object') { console.log('memoFieldFactory',field,api,resource); }
			return fieldFactory( field, {
				api,
				resource,
				fieldFactory,
			} );
		}
	);

	const getRowClick = () => {
		// edit, show, expand, function
		return 'toggleSelection';
	};

	return (
		<BaseList
			{...rest}
			hasEdit={hasEdit}
			hasShow={hasShow}
		>
			<DataGridWrapper
				conf={conf}
				isRowSelectable={isRowSelectable}
				getSort={getSort}
				rowClick={getRowClick()}
				gridOptimized={gridOptimized}
				groupBy={groupBy}
			>
				{addIdField && (
					<TextField
						source="id"
						sortable={isFieldSortable({name: 'id'}, resourceObj)}
					/>
				)}
				{listFields
					.filter(field => !listFieldFilter || listFieldFilter(resourceObj, field))
					.map(field => {
						field = manipulateField(field);
						return memoFieldFactory(field,api,resourceObj);
					})}
				{hasShow && <ShowButton
					label={null}
					width={80}
					cellClassName={styles.w60}
				/>}
				{hasEdit && <EditButton
					cellClassName={styles.w60}
					label={null}
					width={80}
				/>}
			</DataGridWrapper>
		</BaseList>
	);

}


LocalList.defaultProps = {
};

LocalList.propTypes = {

};

function areEqualD(prevProps, nextProps) {

	// let isEqualAll = ObjectUtils.fastDeepEqual(prevProps, nextProps);
	// if(isEqualAll) {
	// 	if(typeof console === 'object') { console.log('isEqualAll',prevProps, nextProps); }
	// 	return true;
	// } else {
	// 	if(typeof console === 'object') { console.log('isNOTEqualAll',prevProps, nextProps); }
	// }

	let a = {
		// match: prevProps.match,
		basePath: prevProps.basePath,
		perPage: prevProps.perPage,
		sort: prevProps.sort,
		filter: prevProps.filter,
	};
	let b = {
		// match: nextProps.match,
		basePath: nextProps.basePath,
		perPage: nextProps.perPage,
		sort: nextProps.sort,
		filter: nextProps.filter,
	};

	let isEqualA = ObjectUtils.fastDeepEqual(a,b);
	if(isEqualA) {
		// if(typeof console === 'object') { console.log('LocalListMemo.areEqual',prevProps, nextProps); }
		// if(typeof console === 'object') { console.log('this.props.isEqualA',isEqualA,a,b); }
		return true;
	} else {
		// if(typeof console === 'object') { console.log('this.props.NOT isEqualA',isEqualA,a,b); }
		// if(typeof console === 'object') { console.log('isEqualA',prevProps, nextProps); }
	}

	/*
	 return true if passing nextProps to render would return
	 the same result as passing prevProps to render,
	 otherwise return false
	 */

	return false;
}


const LocalListMemo = React.memo(LocalList,areEqualD);


const List_DG = props => {

	const handleClose = () => {
		History.push( props.basePath);
	};

	// let addIdField = false;
	// let rowClick = 'toggleSelection';

	let {
		hasEdit,
		hasShow,
		rowClick,
		addIdField,
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
		//addIdField = false === hasIdentifier(fields),
	} = resolveProps(props);

	// addIdField = true;
	const { permanentFilter, initialValues, ...rest } = props;
	const { conf } = configFactory;
	let confDefaults = {};

	// if(typeof console === 'object') { console.log('LIST ',resource.name, resource); }

	  // if(typeof console === 'object') { console.log('LIST props %o configFactory %o',props,configFactory); }
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

	const getGroupBy = memoize(
		(conf) => {
			// const { conf } = configFactory;
			// if(typeof console === 'object') { console.log('getGroupBy',conf); }
			if(conf && typeof conf.getGridGroupByColumns === 'function') {
				let groupBy = conf.getGridGroupByColumns(conf);
				if(groupBy) {
					return groupBy;
				}
			}
		}
	);

	let { perPage, ...editProps} = props;
	let listFields = fields;
	if(conf) {
		listFields = conf.getGridColumns(listFields);
		hasEdit = conf._hasEdit(hasEdit,configFactory.options);
		hasShow = conf._hasShow(hasShow,configFactory.options);
		editProps.hasEdit = hasEdit;
		editProps.hasShow = hasShow;
	}

	const getRowClick = () => {
		// edit, show, expand, function
		return rowClick;
	};

	// if(typeof console === 'object') { console.log('configFactory.conf',configFactory.conf,listFields); }
	// if(typeof console === 'object') { console.log('configFactory.options.createType',configFactory.options); }
	// if(typeof console === 'object') { console.log('BaseList',rest,confDefaults); }

	const { filter, filterDefaultValues } = getFilterValues(permanentFilter, conf);

	return (
		<React.Fragment>
			<LocalListMemo
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
				// hasCreate={hasCreate}
				// hasList={hasList}

				conf={conf}
				isRowSelectable={true}
				getSort={getSort}
				rowClick={getRowClick()}
				gridOptimized={true}
				addIdField={addIdField}
				listFields={listFields}
				hasShow={hasShow}
				hasEdit={hasEdit}
				api={api}
				resourceObj={resource}
				listFieldFilter={listFieldFilter}
				fieldFactory={fieldFactory}
				groupBy={getGroupBy(conf)}
			/>
			{(configFactory.options.createType === 'drawer' || configFactory.options.createType === 'modal' )&&<Route
				path={props.basePath + '/create'}
			>
				{({ match }) => {


					if(!match) {
						return null;
					}


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
					} else {
						return null;
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
					} else {
						return null;
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
	addIdField: false,
	rowClick: 'toggleSelection',
};

List_DG.propTypes = {
	addIdField: PropTypes.bool,
	rowClick: PropTypes.any,
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
		permanentFilter: prevProps.permanentFilter
	};
	let b = {
		location: nextProps.location,
		match: nextProps.match,
		permanentFilter: nextProps.permanentFilter
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

	return false;
}
export default React.memo(List_DG,areEqual);
