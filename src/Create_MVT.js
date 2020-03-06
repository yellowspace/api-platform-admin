import Api                                from '@api-platform/api-doc-parser/lib/Api';
import Resource                           from '@api-platform/api-doc-parser/lib/Resource';
import {
    Create as BaseCreate,
    SimpleForm,
    TabbedForm,
    TabbedFormTabs,
    FormTab
} from 'react-admin';
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
    formSettings,
    ...simpleFormRest
  } = props;

  const {
    api,
    resource,
    ...rest
  } = props;

  const getInitialValues = () => {
      let rd = record;
      let iv = initialValues;
      if(!rd) rd = {};
      if(!iv) iv = {};
      return Object.assign({}, rd, iv);
  };

  const [ initialRecord, setInitialRecord ] = useState( getInitialValues() );

  // if(typeof console === 'object') { console.log('create.props',props); }

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


    const checkFieldTab = (field,idx) => {

        if(
            field.formTab === idx ||
            (idx === 1 &&  (!field.formTab))
        ) {
            return true;
        }


        return false;

    };



    if(formSettings.tabbedForm) {
        return (
            <TabbedForm
                //variant="fullWidth"
                // centered
                // indicatorColor="secondary"
                // textColor="secondary"
                {...simpleFormRest}
                initialValues={initialRecord}
                className="mtv__editor--tabbedform"
                tabs={<TabbedFormTabs centered indicatorColor="secondary" variant="fullWidth" />}
            >
                {formSettings.tabbedForm.map((tab, idx) => {

                    let formTabIdx = idx +1;

                    return (
                        <FormTab
                            label={tab.label}
                            key={'formTab' + idx}
                            //contentClassName={classes.contentClassName}
                            contentClassName="mtv__editor--formTab"
                            //scrollable={true}
                        >
                            {isDeveloper && <DumpForm />}
                            {renderFields === 'editfields' && <GridEditfields
                                {...rest}
                                formTabIdx={formTabIdx}
                                addIdInput={addIdInput}
                                editields={editields}
                                inputFactory={inputFactory}
                                api={api}
                                resource={resource}
                            />}
                            {renderFields === 'direct' && editields.map(field => {

                                if(checkFieldTab(field,formTabIdx)) {
                                    return inputFactory( field, {
                                        api,
                                        resource,
                                    } );
                                }

                                return null;
                            })}
                        </FormTab>
                    );
                })}
            </TabbedForm>
        );
    }



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
  let formSettings = {};

  if(configFactory.conf) {
    editields = configFactory.conf.getCreateFormFields(editields);
    validateForm = configFactory.conf.validateForm;
    formSettings = configFactory.conf.getCreateFormSettings();
  }

    /**
     * tabbedForm needs to be rebuild by our own
     * 1. it depends on routing, which is difficult
     * 2. it is very slow...
     */
    formSettings.tabbedForm = false;

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

    const getRenderFields = () => {

        // if(typeof console === 'object') { console.log('editields',editields,editields.length,renderFields); }
        if(editields && editields.length === 1 && renderFields === 'editfields') {
            return 'direct';
        }

        if(formSettings.renderFields) {
           return formSettings.renderFields;
        }

        return renderFields;
    };

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

          formSettings={formSettings}
          renderFields={getRenderFields()}
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
