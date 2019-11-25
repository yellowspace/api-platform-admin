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
	Responsive
} from 'react-admin';

import {
  Datagrid as MVT_Datagrid
} from '../../common/components/react-admin';

import PropTypes                      from 'prop-types';
import React, { useEffect, useState } from 'react';
import ListFilter                     from './ListFilter';
import {isFieldSortable}              from './fieldFactory';
import { makeStyles }   from '@material-ui/core';
import MuiDrawer        from '../../common/components/common/MuiDrawer';
import { Route, Redirect }        from 'react-router-dom';
import History          from '../../src/admin-containers/History';
import Create           from './Create';
import Edit             from './Edit_MVT';
import Show             from './Show';
import MuiDrawerEditor  from '../../common/components/react-admin/form/MuiDrawerEditor';
import MuiDrawerCreator from '../../common/components/react-admin/form/MuiDrawerCreator';
import ProjectList      from '../../src/scenes/Projects/ProjectList';


let useStyles = makeStyles(function (theme) {
	return ({
		drawerContent: {
			width: 300
		},
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

const TagListActions = (
	{
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
	} ) => {

	// let styles = useStyles();

	// if(typeof console === 'object') { console.log('basePath,rest',basePath,rest); }

	return (
	   <TopToolbar
	    className="mtv__list--actiontoolbar"
	   >
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

const List_MVT = props => {

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

	  // if(typeof console === 'object') { console.log('LIST props %o configFactory %o',props,configFactory); }
	let confDefaults = {};

	const [sort, setSort] = useState({});
	const [filter, setFilter] = useState(null);
	const [filterDefaultValues, setFilterDefaultValues] = useState(null);

	const getFilterValues = () => {
		// filter=Component
		// filters={<PostFilter />} // <-- always on
		// filterDefaultValues={{ is_published: true }}
		// confDefaults.filter = <TextInput label="Search" source="q" alwaysOn />;
		const { conf } = configFactory;

		if(conf && typeof conf.getGridPermanentFilter === 'function') {
			let filter = conf.getGridPermanentFilter(null);
			let filterDefaultValues = conf.getGridFilterDefaults(null);

			if(filter) {
				setFilter(filter);
			}

			if(filterDefaultValues) {
				setFilterDefaultValues(filterDefaultValues);
			}

			//filters={<PostFilter />} filterDefaultValues={{ is_published: true }}
			// if(sort) {
			// 	confDefaults.sort = sort;
			// }
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
	},[]);

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

	return (
		<React.Fragment>
			<BaseList
				{...props}
				{...confDefaults}
				sort={sort}
				filter={filter}
				filterDefaultValues={filterDefaultValues}
				pagination={<React.Fragment />}
				actions={<TagListActions />}
				filters={<ListFilter options={{parameterFactory, parameters, configFactory}} />}
				className="mtv__list"
				classes={{
					content:'mtv__list--content',
					main: 'mtv__list--main',
					root: 'mtv__list--root',
					// toolbar:'mtv__list--toolbar',
					// actions: 'mtv__list--toolbar--actions',
				}}
			>
				<MVT_Datagrid
					component="div"
					// configFactory={configFactory}
					conf={configFactory.conf}
					paginationComponent={true}
					toolbar={true}
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
						.map(field =>
							fieldFactory(field, {
								api,
								resource,
							}),
						)}
					{hasShow && <ShowButton label={null} width={80} />}
					{hasEdit && <EditButton
						// basePath="/project"
						label={null}
						width={80}
					/>}
				</MVT_Datagrid>
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

List_MVT.defaultProps = {
  perPage: 30, // Default value in API Platform
};

List_MVT.propTypes = {
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
};

export default List_MVT;
