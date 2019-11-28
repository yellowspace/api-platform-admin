import {
  CREATE,
  DELETE,
  DELETE_MANY,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
}                    from 'react-admin';
import isPlainObject from 'lodash.isplainobject';
// import { isArray } from 'lodash';
import fetchHydra    from './fetchHydra';
import DateUtils     from '../../../common/utils/DateUtils';

const debug = true;

class ReactAdminDocument {
  constructor(obj) {
    Object.assign(this, obj, {
      originId: obj.id,
      id: obj['@id'],
    });
  }

  /**
   * @return {string}
   */
  toString() {
    return `[object ${this.id}]`;
  }
}

/**
 * Local cache containing embedded documents.
 * It will be used to prevent useless extra HTTP query if the relation is displayed.
 *
 * @type {Map}
 */
const reactAdminDocumentsCache = new Map();

/**
 * Added by Chris to resolve subresources as ReactAdmin Documents
 * @param obj
 * @returns {ReactAdminDocument}
 */
const resolveSubresources = (obj) => {

  // if(typeof console === 'object') { console.log('resolveSubresources',obj); }
  if (obj['@id']) {
    obj = new ReactAdminDocument(obj);
  }

  Object.keys(obj).forEach(key => {

    // to-one
    if (isPlainObject(obj[key]) && obj[key]['@id']) {
      // if(1===1 && debug && typeof console === 'object') { console.log('resolveSubresources,isPlainObject-document[key]',key,obj[key],isPlainObject(obj[key])); }
      obj[key] = obj[key]['@id'];

      return;
    }

    // to-many
    if (
        Array.isArray(obj[key]) &&
        obj[key].length &&
        isPlainObject(obj[key][0]) &&
        obj[key][0]['@id']
    ) {

      // if(typeof console === 'object') { console.log('resolveSubresources.isArray-document[key]',key,obj[key],isPlainObject(obj[key])); }

      obj[key] = obj[key].map(obj => {
        // added by chris
        return resolveSubresources(obj);
      });
    }
  });

  return obj
};

/**
 * Transforms a JSON-LD document to a react-admin compatible document.
 *
 * @param {Object} document
 * @param {bool} clone
 *
 * @return {ReactAdminDocument}
 */
export const transformJsonLdDocumentToReactAdminDocument = (
  document,
  clone = true,
  addToCache = true,
  getSubresources = false // added by chris
) => {

  if(1===2 && debug && typeof console === 'object') { console.log('transformJsonLdDocumentToReactAdminDocument',document); }

  if (clone) {
    // deep clone documents
    document = JSON.parse(JSON.stringify(document));
  }

  // The main document is a JSON-LD document, convert it and store it in the cache
  if (document['@id']) {
    document = new ReactAdminDocument(document);
  }

  // Replace embedded objects by their IRIs, and store the object itself in the cache to reuse without issuing new HTTP requests.
  Object.keys(document).forEach(key => {

    // to-one
    if (isPlainObject(document[key]) && document[key]['@id']) {

      if(1===2 && debug && typeof console === 'object') { console.log('isPlainObject-document[key]',key,document[key],isPlainObject(document[key])); }

      if (addToCache) {
        reactAdminDocumentsCache[
          document[key]['@id']
        ] = transformJsonLdDocumentToReactAdminDocument(
          document[key],
          false,
          false,
        );
      }

      // added by chris
      if(getSubresources) {
        return resolveSubresources(document);
      }

      document[key] = document[key]['@id'];

      return;
    }

    // to-many
    if (
      Array.isArray(document[key]) &&
      document[key].length &&
      isPlainObject(document[key][0]) &&
      document[key][0]['@id']
    ) {

      // if(typeof console === 'object') { console.log('isArray-document[key]',key,document[key],isPlainObject(document[key])); }

      document[key] = document[key].map(obj => {
        if (addToCache) {
          reactAdminDocumentsCache[
            obj['@id']
          ] = transformJsonLdDocumentToReactAdminDocument(obj, false, false);
        }

        // added by chris
        if(getSubresources) {
          return resolveSubresources(obj);
        }

        return obj['@id'];
      });
    }
  });

  return document;
};

/**
 * Maps react-admin queries to a Hydra powered REST API
 *
 * @see http://www.hydra-cg.com/
 *
 * @example
 * CREATE   => POST http://my.api.url/posts/123
 * DELETE   => DELETE http://my.api.url/posts/123
 * GET_LIST => GET http://my.api.url/posts
 * GET_MANY => GET http://my.api.url/posts/123, GET http://my.api.url/posts/456, GET http://my.api.url/posts/789
 * GET_ONE  => GET http://my.api.url/posts/123
 * UPDATE   => PUT http://my.api.url/posts/123
 */
export default ({entrypoint, resources = []}, httpClient = fetchHydra) => {


  /**
   * Generell normalizer
   * @param field
   * @param name
   * @param reference
   * @param data
   * @returns {string}
   */
  const generellNormalizeData = (field, name, reference, data) => {

    switch(field.range) {
      // because json.stringify, makes strange things with GMT Dates
      // we convert all dates of our datetime input to isoDate b4 submitting!
      case 'http://www.w3.org/2001/XMLSchema#dateTime':
        let isDate = DateUtils.isDate(data);
        if(isDate) {
          return DateUtils.formatIso(data);
        }
        break;
      default:
        return null;
    }
  };

  /**
   * @param {Object} resource
   * @param {Object} data
   *
   * @returns {Promise}
   */
  const convertReactAdminDataToHydraData = (resource, data = {}) => {

    // if(typeof console === 'object') { console.log('convertReactAdminDataToHydraData',resource, data); }

    const fieldData = [];
    resource.fields.forEach(({name, reference, normalizeData, ...rest}) => {

      // if(typeof console === 'object') { console.log('convertReactAdminDataToHydraData',name,data,normalizeData,data[name]); }


      if (!(name in data)) {
        return;
      }

      if (reference && data[name] === '') {
        data[name] = null;
        return;
      }

      let gFD = generellNormalizeData(rest, name, reference, data[name]);
      if(gFD) {
        fieldData[name] = gFD;
      }

      if (undefined === normalizeData) {
        return;
      }

      fieldData[name] = normalizeData(data[name]);
    });

    const fieldDataKeys = Object.keys(fieldData);
    const fieldDataValues = Object.values(fieldData);

    // if(debug && typeof console === 'object') { console.log('convertReactAdminDataToHydraData',resource, data); }

    return Promise.all(fieldDataValues).then(fieldData => {
      const object = {};
      for (let i = 0; i < fieldDataKeys.length; i++) {
        object[fieldDataKeys[i]] = fieldData[i];
      }

      return {...data, ...object};
    });
  };

  /**
   * @param {Object} resource
   * @param {Object} data
   *
   * @returns {Promise}
   */
  const transformReactAdminDataToRequestBody = (resource, data = {}) => {
    // if(typeof console === 'object') { console.log('transformReactAdminDataToRequestBodyx '+resource+': %o',data); }
    resource = resources.find(({name}) => resource === name);
    if (undefined === resource) {
      return Promise.resolve(data);
    }

    return convertReactAdminDataToHydraData(resource, data).then(data => {
      if(1===2 && typeof console === 'object') { console.log('convertReactAdminDataToHydraData',resource,resource.encodeData,data,JSON.stringify(data),undefined === resource.encodeData
                                                                                                ? JSON.stringify(data)
                                                                                                : resource.encodeData(data)); }



      return undefined === resource.encodeData
        ? JSON.stringify(data)
        : resource.encodeData(data);
    });
  };

  /**
   * @param {string} type
   * @param {string} resource
   * @param {Object} params
   *
   * @returns {Object}
   */
  const convertReactAdminRequestToHydraRequest = (type, resource, params) => {
    const entrypointUrl = new URL(entrypoint, window.location.href);
    const collectionUrl = new URL(`${entrypoint}/${resource}`, entrypointUrl);
    const itemUrl = new URL(params.id, entrypointUrl);

    // if(1===1 && debug && typeof console === 'object') { console.log('convertReactAdminRequestToHydraRequest',type, resource, params); }

    switch (type) {
      case CREATE:
        return transformReactAdminDataToRequestBody(resource, params.data).then(
          body => ({
            options: {
              body,
              method: 'POST',
            },
            url: collectionUrl,
          }),
        );

      case DELETE:
        return Promise.resolve({
          options: {
            method: 'DELETE',
          },
          url: itemUrl,
        });

      case GET_LIST:
      case GET_MANY_REFERENCE: {
        const {
          pagination: {page, perPage},
          sort: {field, order},
        } = params;

        if (order) collectionUrl.searchParams.set(`order[${field}]`, order);
        if (page) collectionUrl.searchParams.set('page', page);
        if (perPage) collectionUrl.searchParams.set('perPage', perPage);
        if (params.filter) {
          Object.keys(params.filter).forEach(key => {
            const filterValue = params.filter[key];
            if (!isPlainObject(filterValue)) {

              // if(typeof console === 'object') { console.log('!!isPlainObject',filterValue); }
              // added by chris, in order to send array values as array like
              // filter{project: ['/api/projects/1','/api/projects/3']};
              if(
                  Array.isArray(filterValue)
              ) {
                filterValue.forEach((item, index) => {
                  collectionUrl.searchParams.set(
                      `${key}[${index}]`,
                      item,
                  );
                });
                return;
              }

              collectionUrl.searchParams.set(key, params.filter[key]);
              return;
            }

            Object.keys(filterValue).forEach(subKey => {
              // added by chris, in order to send array values as array like
              // filter{project: {id: ['/api/projects/1','/api/projects/3']}};
              if(
                  Array.isArray(filterValue[subKey])
              ) {
                filterValue[subKey].forEach((item, index) => {
                  collectionUrl.searchParams.set(
                      `${key}.${subKey}[${index}]`,
                      item,
                  );
                });
                return;
              }

              collectionUrl.searchParams.set(
                `${key}[${subKey}]`,
                filterValue[subKey],
              );
            });
          });
        }

        // added by chris
        if(params.appParams) {
          collectionUrl.searchParams.set('appParams', JSON.stringify(params.appParams));
        }

        // send groups[]=related:read
        // added by chris
        // if(typeof console === 'object') { console.log('params.groups',resource,params,params.groups); }

        if(params.groups && params.groups.length) {
          params.groups.forEach((item,index) => {
            collectionUrl.searchParams.set( `groups[${index}]`, item);

          });
        }

        if (type === GET_MANY_REFERENCE && params.target) {
          collectionUrl.searchParams.set(params.target, params.id);
        }
        // if(typeof console === 'object') { console.log('collectionUrl',resource,collectionUrl); }
        return Promise.resolve({
          options: {},
          url: collectionUrl,
        });
      }

      case GET_ONE:

        // send groups[]=related:read
        // added by chris
        if(params.groups && params.groups.length) {
          params.groups.forEach((item,index) => {
            itemUrl.searchParams.set( `groups[${index}]`, item);
          });
        }

        // if(typeof console === 'object') { console.log('itemUrl',params,itemUrl,collectionUrl); }

        return Promise.resolve({
          options: {},
          url: itemUrl,
        });

      case UPDATE:
        return transformReactAdminDataToRequestBody(resource, params.data).then(
          body => ({
            options: {
              body,
              method: 'PUT',
            },
            url: itemUrl,
          }),
        );

      default:
        throw new Error(`Unsupported fetch action type ${type}`);
    }
  };

  /**
   * @param {string} resource
   * @param {Object} data
   *
   * @returns {Promise}
   */
  const convertHydraDataToReactAdminData = (resource, data = {}) => {
    resource = resources.find(({name}) => resource === name);
    if (undefined === resource) {
      return Promise.resolve(data);
    }

    // if(debug && typeof console === 'object') { console.log('convertHydraDataToReactAdminData',resource, data ); }

    const fieldData = {};
    resource.fields.forEach(({name, denormalizeData}) => {
      if (!(name in data) || undefined === denormalizeData) {
        return;
      }

      fieldData[name] = denormalizeData(data[name]);
    });

    const fieldDataKeys = Object.keys(fieldData);
    const fieldDataValues = Object.values(fieldData);

    return Promise.all(fieldDataValues).then(fieldData => {
      const object = {};
      for (let i = 0; i < fieldDataKeys.length; i++) {
        object[fieldDataKeys[i]] = fieldData[i];
      }

      return {...data, ...object};
    });
  };

  /**
   * @param {Object} response
   * @param {string} resource
   * @param {string} type
   *
   * @returns {Promise}
   */
  const convertHydraResponseToReactAdminResponse = (
    type,
    resource,
    response,
  ) => {

    if(1===2 && debug && typeof console === 'object') { console.log('convertHydraResponseToReactAdminResponse',    type,
        resource,
        response,); }

    let getSubresources = false;

    switch (type) {
      case GET_LIST:
      case GET_MANY_REFERENCE:
        // TODO: support other prefixes than "hydra:"
          // added by chris send appParams (in progress here)
         if(response.json && response.json['hydra:view'] && response.json['hydra:view']['@id']) {
           let hydraView = decodeURIComponent(response.json['hydra:view']['@id']);
           // getSubresources = hydraView.indexOf('getSubresources') > 0 ? true : false;
           if(hydraView.indexOf('groups[]=related:read') > 0) {
             getSubresources = true;
           }
         }
        // changed by chris, added getSubresources to keep getSubresources in array
        return Promise.resolve(
          // response.json['hydra:member'].map(
          //   transformJsonLdDocumentToReactAdminDocument,
          // ),
            response.json['hydra:member'].map((d) => {
              return transformJsonLdDocumentToReactAdminDocument(d,true,true, getSubresources);
            }),
        )
          .then(data =>
            Promise.all(
              data.map(data =>
                convertHydraDataToReactAdminData(resource, data),
              ),
            ),
          )
          .then(data => ({data, total: response.json['hydra:totalItems']}));

      case DELETE:
        return Promise.resolve({data: {id: null}});

      default:

        let addToCache = true;
        // added by chris send appParams (in progress here)
        if(response.json && response.json['@localMetadata']) {
          let hydraView = response.json['@localMetadata'];
          // if(typeof console === 'object') { console.log('xhydraViewo',hydraView); }
          if(hydraView && typeof hydraView === 'object' && hydraView.relationsRequested === true) {
            getSubresources = true;
          }
        }

        return Promise.resolve(
          transformJsonLdDocumentToReactAdminDocument(response.json,true,addToCache, getSubresources),
        )
          .then(data => convertHydraDataToReactAdminData(resource, data))
          .then(data => ({data}));
    }
  };

  /**
   * @param {string} type
   * @param {string} resource
   * @param {Object} params
   *
   * @returns {Promise}
   */
  const fetchApi = (type, resource, params) => {
    // if(typeof console === 'object') { console.log('fetchApi',type, resource, params); }

    // Hydra doesn't handle MANY requests, so we fallback to calling the ONE request n times instead
    switch (type) {
      case GET_MANY:
        return Promise.all(
          params.ids.map(id =>
            reactAdminDocumentsCache[id]
              ? Promise.resolve({data: reactAdminDocumentsCache[id]})
              : fetchApi(GET_ONE, resource, {id}),
          ),
        ).then(responses => ({data: responses.map(({data}) => data)}));

      case DELETE_MANY:
        return Promise.all(
          params.ids.map(id => fetchApi(DELETE, resource, {id})),
        ).then(responses => ({data: []}));

      default:
        return convertReactAdminRequestToHydraRequest(type, resource, params)
          .then(({url, options}) => httpClient(url, options))
          .then(response =>
            convertHydraResponseToReactAdminResponse(type, resource, response),
          );
    }
  };

  return fetchApi;
};
