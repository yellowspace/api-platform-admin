import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {
  TextInput,
  Edit as BaseEdit,
  SimpleForm
} from 'react-admin';
import PropTypes from 'prop-types';
import React from 'react';

import {
  Toolbar,
  // SaveButton as RA_SaveButton,
  DeleteButton,
  CloneButton
} from 'react-admin';
// import { useForm } from 'react-final-form';
import { makeStyles } from '@material-ui/core/styles';
import SaveButton from '../../common/components/react-admin/form/actions/SaveButton';
import RA_SaveButton from '../../common/components/react-admin/form/actions/RA_SaveButton';

import { FormInput } from 'react-admin';


const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

const CustomToolbar = props => {

  // if(typeof console === 'object') { console.log('CustomToolbar.props',props); }
  // let form = useForm();

  let { options } = props;
  options = options || {};

  let cloneButton = (typeof options.cloneButton !== 'undefined') ? options.cloneButton : true;
  let deleteButton = (typeof options.deleteButton !== 'undefined') ? options.deleteButton : true;

  // if(typeof console === 'object') { console.log('CustomToolbar.props',props,cloneButton,deleteButton); }

  return (
    <Toolbar
        {...props}
        className="mtv__editor--toolbar"
        classes={useStyles()}
    >
      <SaveButton undoable={false} redirect={props.redirect} />
      {/*<RA_SaveButton undoable={false} />*/}
      {deleteButton &&<DeleteButton undoable={false} label={null} />}
      {cloneButton && <CloneButton undoable="" label={null} />}
    </Toolbar>
  )
};


const hasIdentifier = fields => {
  return (
    undefined !== fields.find(({id}) => 'http://schema.org/identifier' === id)
  );
};

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
const Editfields = (props) => {

  const {inputFactory,addIdInput,editields,api} = props;
  const { basePath, record, resource, variant, margin } = props;
  // if(typeof console === 'object') { console.log('props',props); }

  return (
      <React.Fragment>
        {addIdInput && <TextInput disabled source="id" />}
        {addIdInput && <TextInput type="hidden" source="id" label={null} />}
        {editields.map(field => {

          let input = inputFactory( field, {
            api,
            resource,
          });

          // if(typeof console === 'object') { console.log('input',input,field,field.name); }

          return React.createElement( FormInput , {
            key: field.name,
            basePath: basePath,
            input   : input,
            record  : record,
            resource: resource,
            variant : variant,
            margin  : margin
          } )
        })}
      </React.Fragment>
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

  if(configFactory.conf) {
    editields = configFactory.conf.getFormFields(editields);
    validateForm = configFactory.conf.validateForm;
  }


  // if(typeof console === 'object') { console.log('formProps',formProps); }


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
          // save={(a) => {
          //   if(typeof console === 'object') { console.log('BaseEdit SAVE!',a); }
          // }}
          // saving={(a) => {
          //   if(typeof console === 'object') { console.log('BaseEdit SAVING!',a); }
          // }}
      >
        <SimpleForm
            toolbar={<CustomToolbar options={props.options} />}
            validate={validateForm}
            variant="standard"
            {...formProps}
            // save={(a) => {
            //   if(typeof console === 'object') { console.log('SimpleForm SAVE!',a); }
            // }}
            // handleSubmit={(a) => {
            //   if(typeof console === 'object') { console.log('SimpleForm handleSubmit!',a); }
            // }}
        >
          {renderFields === 'editfields' && <Editfields
              {...props}
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
      </BaseEdit>
  );
};

Edit_MVT.defaultProps = {
  renderFields: 'direct',
  addIdInput: false
};

Edit_MVT.propTypes = {
  renderFields: PropTypes.string,
  formProps: PropTypes.object,
  addIdInput: PropTypes.bool,
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    inputFactory: PropTypes.func.isRequired,
    resource: PropTypes.instanceOf(Resource).isRequired,
  }),
};

export default Edit_MVT;
