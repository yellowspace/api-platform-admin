import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {
  DisabledInput,
  TextInput,
  Edit as BaseEdit,
  SimpleForm
} from 'react-admin';
import PropTypes from 'prop-types';
import React from 'react';

import {
  Toolbar,
  SaveButton,
  DeleteButton,
  CloneButton
} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

const CustomToolbar = props => {

  return (
    <Toolbar
        {...props}
        className="mtv__editor--toolbar"
        classes={useStyles()}
    >
      <SaveButton />
      <DeleteButton undoable={false} label={null} />
      <CloneButton undoable="" label={null} />
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

const Edit_MVT = props => {
  let {
    options: {
      api,
      fields,
      inputFactory,
      configFactory,
      resource
    },
    addIdInput = false === hasIdentifier(fields),
  } = resolveProps(props);

  // if(typeof console === 'object') { console.log('EDIT props',props); }

  // let editType = null;
  // if(props.options.configFactory && props.options.configFactory.options && props.options.configFactory.options.editType) {
  //   editType = props.options.configFactory.options.editType;
  // }
  //
  // if(editType === 'drawer') {}

  addIdInput = false;


  let editields = fields;
  let validateForm = () => {};

  if(configFactory.conf) {
    editields = configFactory.conf.getFormFields(editields);
    validateForm = configFactory.conf.validateForm;
  }

  return (
      <BaseEdit
          {...props}
          classes={{
            card:'mtv__editor--card',
            main: 'mtv__editor--main',
            root: 'mtv__editor--root',
            noActions: 'mtv__editor--noActions',
          }}
      >
        <SimpleForm
            toolbar={<CustomToolbar />}
            validate={validateForm}
        >
          {addIdInput && <DisabledInput source="id" />}
          {addIdInput && <TextInput type="hidden" source="id" label={null} />}
          {editields.map(field =>
              inputFactory(field, {
                api,
                resource,
              }),
          )}
        </SimpleForm>
      </BaseEdit>
  );
};

Edit_MVT.propTypes = {
  addIdInput: PropTypes.bool,
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    inputFactory: PropTypes.func.isRequired,
    resource: PropTypes.instanceOf(Resource).isRequired,
  }),
};

export default Edit_MVT;
