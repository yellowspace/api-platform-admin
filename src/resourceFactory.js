import {Resource} from 'react-admin';
import React from 'react';
import Create from './Create';
import Edit from './Edit';
import List from './List';
import Show from './Show';
import defaultConfigFactory from './configFactory';

export default (
  resource,
  api,
  fieldFactory,
  inputFactory,
  parameterFactory,
  listFieldFilter,
  configFactory = defaultConfigFactory()
) => {
  const {
    create = Create,
    edit = Edit,
    list = List,
    icon,
    name,
    props,
    show = Show,
  } = resource;

  return (
    <Resource
      {...props}
      create={create}
      edit={edit}
      key={name}
      list={list}
      name={name}
      icon={icon}
      options={{
        api,
        fieldFactory,
        inputFactory,
        parameterFactory,
        listFieldFilter,
        resource,
        configFactory
      }}
      show={show}
    />
  );
};
