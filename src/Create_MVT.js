import Api                                from '@api-platform/api-doc-parser/lib/Api';
import Resource                           from '@api-platform/api-doc-parser/lib/Resource';
import {Create as BaseCreate, SimpleForm} from 'react-admin';
import PropTypes                          from 'prop-types';
import React, { useEffect, useState }     from 'react';
// import { makeStyles } from '@material-ui/core/styles';
// import SaveButton from '../../common/components/react-admin/form/actions/SaveButton';
import CustomCreatorToolbar               from './components/CustomCreatorToolbar';
import GridEditfields                     from './components/GridEditfields';

// import {
//   Toolbar,
//   SaveButton as RA_SaveButton,
// }               from 'react-admin';
// import Edit_MVT from './Edit_MVT';

// const useStyles = makeStyles({
//   toolbar: {
//     display: 'flex',
//     justifyContent: 'space-between',
//   },
// });
//
// const CustomToolbar = props => {
//
//   // if(typeof console === 'object') { console.log('CustomToolbar.props',props.redirect); }
//   // let form = useForm();
//
//   return (
//       <Toolbar
//           {...props}
//           className="mtv__editor--toolbar"
//           classes={useStyles()}
//           redirect={props.redirect}
//       >
//         <SaveButton redirect={props.redirect} actionType="create" />
//         {/*<RA_SaveButton />*/}
//       </Toolbar>
//   )
// };




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


  return (
      <SimpleForm
          {...simpleFormRest}
          initialValues={initialRecord}
      >
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
