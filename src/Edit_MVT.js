import Api                            from '@api-platform/api-doc-parser/lib/Api';
import Resource                       from '@api-platform/api-doc-parser/lib/Resource';
import {
  TextInput,
  Edit as BaseEdit,
  SimpleForm
}                                     from 'react-admin';
import PropTypes                      from 'prop-types';
import React, { useEffect, useState } from 'react';

import {
  // Toolbar,
  // SaveButton as RA_SaveButton,
  // DeleteButton,
  // CloneButton
}                          from 'react-admin';
// import { useForm } from 'react-final-form';
// import { makeStyles } from '@material-ui/core/styles';
// import SaveButton from '../../common/components/react-admin/form/actions/SaveButton';
// import RA_SaveButton from '../../common/components/react-admin/form/actions/RA_SaveButton';
import CustomEditorToolbar from './components/CustomEditorToolbar';
import GridEditfields      from './components/GridEditfields';


// const hasIdentifier = fields => {
//   return (
//     undefined !== fields.find(({id}) => 'http://schema.org/identifier' === id)
//   );
// };

const resolveProps = props => {
  const {options} = props;
  const {inputFactory: defaultInputFactory, resource} = options;
  const {
    editFields: customFields,
    editProps = {},
    writableFields: defaultFields,
  } = resource;
  const {options: {inputFactory: customInputFactory} = {}} = editProps;

  return {
    ...props,
    ...editProps,
    options: {
      ...options,
      fields:
        customFields || defaultFields.filter(({deprecated}) => !deprecated),
      inputFactory: customInputFactory || defaultInputFactory,
    },
  };
};

/**
 * see @link node_modules/ra-ui-materialui/esm/form/SimpleForm.js
 * //  Children.map(children, function (input) { return (React.createElement(FormInput,
 * { basePath: basePath, input: input, record: record, resource: resource, variant: variant, margin: margin }));
 *
 * @param props
 * @returns {*}
 * @constructor
 */
// const Editfields = (props) => {
//
//   const {inputFactory,addIdInput,editields,api} = props;
//   const { basePath, record, resource, variant, margin } = props;
//   // if(typeof console === 'object') { console.log('props',props); }
//
//   return (
//       <React.Fragment>
//         {addIdInput && <TextInput disabled source="id" />}
//         {addIdInput && <TextInput type="hidden" source="id" label={null} />}
//         {editields.map(field => {
//
//           let input = inputFactory( field, {
//             api,
//             resource,
//           });
//
//           // if(typeof console === 'object') { console.log('input',input,field,field.name); }
//
//           return React.createElement( FormInput , {
//             key: field.name,
//             basePath: basePath,
//             input   : input,
//             record  : record,
//             resource: resource,
//             variant : variant,
//             margin  : margin
//           } )
//         })}
//       </React.Fragment>
//   );
// };


const LocalForm = props => {

      const {
        renderFields,
        addIdInput,
        editields,
        inputFactory,
        record,
        configFactory,
        ...simpleFormRest
      } = props;

      const {
        api,
        resource,
        ...rest
      } = props;

      const [initialRecord, setInitialRecord] = useState(record);

      let onBeforeFormRender = null;
      if(configFactory && configFactory.conf) {
        if(typeof configFactory.conf.onBeforeFormRender === 'function') {
          onBeforeFormRender = configFactory.conf.onBeforeFormRender;
        }
      }

      useEffect(() => {
        if(onBeforeFormRender) {
          const { changedRecord } = onBeforeFormRender( initialRecord, { actionType: 'edit' });
          if(changedRecord) {
            setInitialRecord(changedRecord);
          }
        }
      },[initialRecord]);

      return (
          <SimpleForm
              {...simpleFormRest}
              record={initialRecord}
          >
            {renderFields === 'editfields' && <GridEditfields
                {...rest}
                // record={initalRecord}
                addIdInput={addIdInput}
                editields={editields}
                inputFactory={inputFactory}
                api={api}
                resource={resource}
            />}
            {renderFields === 'direct' && addIdInput && <TextInput disabled source="id" />}
            {renderFields === 'direct' && addIdInput && <TextInput type="hidden" source="id" label={null} />}
            {renderFields === 'direct' && editields.map(field =>
                inputFactory(field, {
                  api,
                  resource,
                }),
            )}
          </SimpleForm>
      );
};


const Edit_MVT = props => {
  let {
    options: {
      api,
      fields,
      inputFactory,
      configFactory,
      resource
    },
    // addIdInput = false === hasIdentifier(fields),
  } = resolveProps(props);

  let {
    formProps,
    renderFields,
    addIdInput,
    toolbar,
    ...rest
  } = props;


  // if(typeof console === 'object') { console.log('EDIT props',props); }

  // let editType = null;
  // if(props.options.configFactory && props.options.configFactory.options && props.options.configFactory.options.editType) {
  //   editType = props.options.configFactory.options.editType;
  // }
  //
  // if(editType === 'drawer') {}


  let editields = fields;
  let validateForm = () => {};
  let formSettings = {};

  if(configFactory.conf) {
    editields = configFactory.conf.getFormFields(editields);
    validateForm = configFactory.conf.validateForm;
    formSettings = configFactory.conf.getFormSettings();
  }


  // if(typeof console === 'object') { console.log('formProps',formProps); }
  if(typeof toolbar === 'undefined') {
    toolbar = <CustomEditorToolbar options={props.options} />
  }

  return (
      <BaseEdit
          undoable={false}
          {...rest}
          classes={{
            card:'mtv__editor--card',
            main: 'mtv__editor--main',
            root: 'mtv__editor--root',
            noActions: 'mtv__editor--noActions',
          }}
      >
        <LocalForm
            toolbar={toolbar}
            validate={validateForm}
            variant="standard"
            {...formProps}

            renderFields={renderFields}
            addIdInput={addIdInput}
            editields={editields}
            inputFactory={inputFactory}
            configFactory={configFactory}
            api={api}
            resource={resource}

        />
      </BaseEdit>
  );
};

Edit_MVT.defaultProps = {
  renderFields: 'direct',
  addIdInput: false
};

Edit_MVT.propTypes = {
  renderFields: PropTypes.string,
  toolbar: PropTypes.any,
  formProps: PropTypes.object,
  addIdInput: PropTypes.bool,
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    inputFactory: PropTypes.func.isRequired,
    resource: PropTypes.instanceOf(Resource).isRequired,
  }),
};

export default Edit_MVT;
