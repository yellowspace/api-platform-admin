import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {
	Datagrid,
	EditButton,
	List as BaseList,
	ShowButton,
	TextField,
} from 'react-admin';

// import List_MVT from './List_MVT';
import List_DG from './List_DG';

import PropTypes              from 'prop-types';
import React                  from 'react';
import ListFilter             from './ListFilter';
import {isFieldSortable}      from './fieldFactory';
// import { ProjectCreate } from '../../src/scenes/Projects/ProjectCreate';


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

const List = props => {

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

	/*if(configFactory.options.listType === 'mvt') {
		return <List_MVT {...props} />;
	} else */ if(configFactory.options.listType === 'dg') {
		return <List_DG {...props} />;
	}



	// if(typeof console === 'object') { console.log('LIST props',props); }

	return (
		<BaseList
		  {...props}
		  filters={<ListFilter options={{parameterFactory, parameters}} />}
		>
		      <Datagrid>
		      {addIdField && (
		        <TextField
		          source="id"
		          sortable={isFieldSortable({name: 'id'}, resource)}
		        />
		      )}
		      {fields
		        .filter(field => !listFieldFilter || listFieldFilter(resource, field))
		        .map(field =>
		          fieldFactory(field, {
		            api,
		            resource,
		          }),
		        )}
		      {hasShow && <ShowButton />}
		      {hasEdit && <EditButton />}
		    </Datagrid>
		</BaseList>
	);
};

List.defaultProps = {
  perPage: 50, // Default value in API Platform
};

List.propTypes = {
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

export default List;
