import Api                                             from '@api-platform/api-doc-parser/lib/Api';
import Resource                                        from '@api-platform/api-doc-parser/lib/Resource';
import {Show as BaseShow, SimpleShowLayout, TextField} from 'react-admin';
import PropTypes                                       from 'prop-types';
import React                                           from 'react';
import ApiPlatformUtils                                from './utils/ApiPlatformUtils';
// import authProvider                                    from '../../src/admin-store/authProvider';
// import DumpForm                                        from '../../common/components/react-admin/form/fields/DumpForm';
import GridEditfields                                  from './components/GridEditfields';
import CustomShowToolbar                             from './components/CustomShowToolbar';

// const hasIdentifier = fields => {
//   return (
//     undefined !== fields.find(({id}) => 'http://schema.org/identifier' === id)
//   );
// };

// const resolveProps = props => {
//   const {options} = props;
//   const {fieldFactory: defaultFieldFactory, resource} = options;
//   const {
//     showFields: customFields,
//     readableFields: defaultFields,
//     showProps = {},
//   } = resource;
//   const {options: {fieldFactory: customFieldFactory} = {}} = showProps;
//
//   return {
//     ...props,
//     ...showProps,
//     options: {
//       ...options,
//       fields:
//         customFields || defaultFields.filter(({deprecated}) => !deprecated),
//       fieldFactory: customFieldFactory || defaultFieldFactory,
//     },
//   };
// };

const Show_MVT = props => {
  const {
    options: {
      api,
      fieldFactory,
      fields,
      resource,
      configFactory
    },
    // addIdField = false === hasIdentifier(fields),
  } = ApiPlatformUtils.resolveShowProps(props);

  let {
    formProps,
    renderFields,
    addIdField,
    toolbar,
    ...rest
  } = props;

  const { conf } = configFactory;

  let showfields = fields;
  // let showSettings = {};

  if(conf) {
    showfields = conf.getShowFields(showfields);
    // showSettings = conf.getShowSettings();
  }

  // const isDeveloper = authProvider.isDeveloper();
  // if(typeof console === 'object') { console.log('Show_MVT.props',props,fields,showfields); }

  if(typeof toolbar === 'undefined') {
    toolbar = <CustomShowToolbar options={props.options} />
  }

  return (
    <BaseShow
        actions={toolbar}
        // hasEdit={true}
        {...rest}
        classes={{
          card:'mtv__show--card',
          main: 'mtv__show--main',
          root: 'mtv__show--root',
          noActions: 'mtv__show--noActions',
        }}
    >
      <SimpleShowLayout

      >
        {renderFields === 'showfields' && <GridEditfields
            {...rest}
            // record={initalRecord}
            addIdField={addIdField}
            showfields={showfields}
            fieldFactory={fieldFactory}
            api={api}
            resource={resource}
        />}
        {renderFields === 'direct' && addIdField && <TextField disabled source="id" />}
        {renderFields === 'direct' && addIdField && <TextField type="hidden" source="id" label={null} />}
        {renderFields === 'direct' && showfields.map(field => {

          // let f = {...field};

          let f = conf.sanitizeShowFieldOptions(field);

          // if(!f.fieldProps) {
          //   f.fieldProps = {};
          // }
          //
          // if(typeof f.fieldProps.addLabel === 'undefined') {
          //   f.fieldProps.addLabel = true;
          // }
          //
          // if(typeof f.fieldProps.header !== 'undefined') {
          //   f.fieldProps.label = f.fieldProps.header;
          // }
          //
          // f.InlineEditorField = false;

          // if(typeof console === 'object') { console.log('field',field,f); }

          return fieldFactory(f, {
            api,
            resource,
          });
        })}

      </SimpleShowLayout>
    </BaseShow>
  );
};

Show_MVT.defaultProps = {
  renderFields: 'direct',
  addIdField: false
};

Show_MVT.propTypes = {
  addIdField: PropTypes.bool,
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    fieldFactory: PropTypes.func.isRequired,
    resource: PropTypes.instanceOf(Resource).isRequired,
    showProps: PropTypes.object,
  }),
};

export default Show_MVT;
