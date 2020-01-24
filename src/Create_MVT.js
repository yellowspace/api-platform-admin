import Api                                from '@api-platform/api-doc-parser/lib/Api';
import Resource                           from '@api-platform/api-doc-parser/lib/Resource';
import {Create as BaseCreate, SimpleForm} from 'react-admin';
import PropTypes                          from 'prop-types';
import React, { useEffect, useState }     from 'react';
import CustomCreatorToolbar               from './components/CustomCreatorToolbar';
import GridEditfields                     from './components/GridEditfields';
import ApiPlatformUtils                   from './utils/ApiPlatformUtils';
import authProvider                       from '../../src/admin-store/authProvider';
import DumpForm                           from '../../common/components/react-admin/form/fields/DumpForm';


const LocalForm = props => {

  const {
    renderFields,
    addIdInput,
    editields,
    inputFactory,
    record,
    initialValues,
    configFactory,
    ...simpleFormRest
  } = props;

  const {
    api,
    resource,
    ...rest
  } = props;

  const [ initialRecord, setInitialRecord ] = useState( initialValues );

  // if(typeof console === 'object') { console.log('propso',props); }

  let onBeforeFormRender = null;
  if ( configFactory && configFactory.conf ) {
    if ( typeof configFactory.conf.onBeforeFormRender === 'function' ) {
      onBeforeFormRender = configFactory.conf.onBeforeFormRender;
    }
  }

  useEffect( () => {
    if ( onBeforeFormRender ) {
      const { changedRecord } = onBeforeFormRender( initialRecord, { actionType: 'edit' } );
      if ( changedRecord ) {
        setInitialRecord( changedRecord );
      }
    }
  }, [ initialRecord ] );

    const isDeveloper = authProvider.isDeveloper();

  return (
      <SimpleForm
          {...simpleFormRest}
          initialValues={initialRecord}
      >
          {isDeveloper && <DumpForm />}
        {renderFields === 'editfields' && <GridEditfields
            {...rest}
            addIdInput={addIdInput}
            editields={editields}
            inputFactory={inputFactory}
            api={api}
            resource={resource}
        />}
        {renderFields === 'direct' && editields.map(field =>
            inputFactory(field, {
              api,
              resource,
            }),
        )}
      </SimpleForm>

  );

};

const Create_MVT = props => {
  // const {
  //   options: {
  //     api,
  //     fields,
  //     inputFactory,
  //     configFactory,
  //     resource
  //   },
  // } = resolveProps(props);

 const {
    options: {
      api,
      fields,
      inputFactory,
      configFactory,
      resource
    },
  } = ApiPlatformUtils.resolveCreatorProps(props);

  // if(typeof console === 'object') { console.log('CREATE.props',props); }

  let editields = fields;
  let validateForm = () => {};

  if(configFactory.conf) {
    editields = configFactory.conf.getCreateFormFields(editields);
    validateForm = configFactory.conf.validateForm;
  }

  let {
    formProps,
    renderFields,
    addIdInput,
    toolbar,
    ...rest
  } = props;

  if(typeof toolbar === 'undefined') {
    toolbar = <CustomCreatorToolbar options={props.options} />
  }

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
    </BaseCreate>
  );
};

Create_MVT.defaultProps = {
  renderFields: 'direct',
  // addIdInput: false
};

Create_MVT.propTypes = {
  renderFields: PropTypes.string,
  toolbar: PropTypes.any,
  formProps: PropTypes.object,
  options: PropTypes.shape({
    api: PropTypes.instanceOf(Api).isRequired,
    inputFactory: PropTypes.func.isRequired,
    resource: PropTypes.instanceOf(Resource).isRequired,
  }),
};

export default Create_MVT;
