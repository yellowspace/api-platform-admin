import Api from '@api-platform/api-doc-parser/lib/Api';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {Create as BaseCreate, SimpleForm} from 'react-admin';
import PropTypes from 'prop-types';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SaveButton from '../../common/components/react-admin/form/actions/SaveButton';

import {
  Toolbar,
  SaveButton as RA_SaveButton,
} from 'react-admin';

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

const CustomToolbar = props => {

  // if(typeof console === 'object') { console.log('CustomToolbar.props',props.redirect); }
  // let form = useForm();

  return (
      <Toolbar
          {...props}
          className="mtv__editor--toolbar"
          classes={useStyles()}
          redirect={props.redirect}
      >
        <SaveButton redirect={props.redirect} actionType="create" />
        {/*<RA_SaveButton />*/}
      </Toolbar>
  )
};




const resolveProps = props => {
  const {options} = props;
  const {inputFactory: defaultInputFactory, resource} = options;
  const {
    createFields: customFields,
    createProps = {},
    writableFields: defaultFields,
  } = resource;
  const {options: {inputFactory: customInputFactory} = {}} = createProps;

  return {
    ...props,
    ...createProps,
    options: {
      ...options,
      fields:
        customFields || defaultFields.filter(({deprecated}) => !deprecated),
      inputFactory: customInputFactory || defaultInputFactory,
    },
  };
};

const Create_MVT = props => {
  const {
    options: {
      api,
      fields,
      inputFactory,
      configFactory,
      resource
    },
  } = resolveProps(props);

  // if(typeof console === 'object') { console.log('CREATE.props',props); }

  let editields = fields;
  let validateForm = () => {};

  if(configFactory.conf) {
    editields = configFactory.conf.getFormFields(editields);
    validateForm = configFactory.conf.validateForm;
  }

  const { formProps, ...rest } = props;

  return (
    <BaseCreate
        {...rest}
        classes={{
          card:'mtv__editor--card',
          main: 'mtv__editor--main',
          root: 'mtv__editor--root',
          noActions: 'mtv__editor--noActions',
        }}
    >
      <SimpleForm
          toolbar={<CustomToolbar options={props.options}  />}
          validate={validateForm}
          variant="standard"
          {...formProps}
      >
        {editields.map(field =>
          inputFactory(field, {
            api,
            resource,
          }),
        )}
      </SimpleForm>
    </BaseCreate>
  );
};

Create_MVT.propTypes = {
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    inputFactory: PropTypes.func.isRequired,
    resource: PropTypes.instanceOf(Resource).isRequired,
  }),
};

export default Create_MVT;
