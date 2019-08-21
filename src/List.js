import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {
  Datagrid,
  EditButton,
  List as BaseList,
  ShowButton,
  TextField,
} from 'react-admin';

import {
  Datagrid as MVT_Datagrid
} from '../../common/components/admin-grid';

import PropTypes               from 'prop-types';
import React from 'react';
import ListFilter              from './ListFilter';
import {isFieldSortable}       from './fieldFactory';

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
  const {
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

  return (
    <BaseList
      {...props}
      pagination={<React.Fragment />}
      filters={<ListFilter options={{parameterFactory, parameters}} />}
      className="mtv__list"
      classes={{
        content:'mtv__list--content',
        main: 'mtv__list--main',
        root: 'mtv__list--root'
      }}
    >
      {(configFactory.listOptions.listType === 'mvt') ?
        <MVT_Datagrid
            component="div"
            configFactory={configFactory}
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
        </MVT_Datagrid>
       :
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
      }
    </BaseList>
  );
};

List.defaultProps = {
  perPage: 30, // Default value in API Platform
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
