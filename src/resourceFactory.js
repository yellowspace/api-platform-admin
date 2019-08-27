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

    // if(typeof console === 'object') { console.log('icon',icon); }

    let editResource = null;
    if(configFactory.options.editResource) {
        editResource = configFactory.options.editResource;
    } else if(configFactory.options.editType === 'page') {
        editResource = edit;
    }

    let createResource = null;
    if(configFactory.options.createResource) {
        createResource = configFactory.options.createResource;
    } else if(configFactory.options.createType === 'page') {
        createResource = create;
    }

    let showResource = null;
    if(configFactory.options.showResource) {
        showResource = configFactory.options.showResource;
    } else if(configFactory.options.showType === 'page') {
        showResource = show;
    }

    return (
        <Resource
            {...props}
            create={createResource}
            edit={editResource}
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
            show={showResource}
        />
    );
    };
