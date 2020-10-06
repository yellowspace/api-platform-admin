import Api                            from '@api-platform/api-doc-parser/lib/Api';
import Resource                       from '@api-platform/api-doc-parser/lib/Resource';
import {
    TextInput,
    Edit as BaseEdit,
    SimpleForm,
    TabbedForm,
    FormTab,
    TabbedFormTabs,
}                                     from 'react-admin';
import PropTypes                      from 'prop-types';
import React, { useEffect, useState } from 'react';
import CustomEditorToolbar            from './components/CustomEditorToolbar';
import GridEditfields                 from './components/GridEditfields';
import DumpForm                       from '../../common/components/react-admin/form/fields/DumpForm';
import ApiPlatformUtils               from './utils/ApiPlatformUtils';
import authProvider                   from '../../src/admin-store/authProvider';
import { makeStyles }                 from '@material-ui/core/styles';
import ObjectUtils from "../../common/utils/ObjectUtils";

/**
 * see @link node_modules/ra-ui-materialui/esm/form/SimpleForm.js
 * //  Children.map(children, function (input) { return (React.createElement(FormInput,
 * { basePath: basePath, input: input, record: record, resource: resource, variant: variant, margin: margin }));
 *
 * @param props
 * @returns {*}
 * @constructor
 */

let usetTabStyles = makeStyles(function (theme) {
    return (
        {
            contentClassName: {
                margin: '10px 0 0 10px',
            },
        }
    );
});

const LocalForm = props => {

    // if(typeof console === 'object') { console.log('LocalForm.props',props); }

      const {
        renderFields,
        addIdInput,
        editields,
        inputFactory,
        record,
        configFactory,
        formSettings,
        ...simpleFormRest
      } = props;

      const {
        api,
        resource,
        ...rest
      } = props;

      const [initialRecord, setInitialRecord] = useState(record);
    const classes = usetTabStyles();


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

    // if(typeof console === 'object') { console.log('EDIT_MVT',editields); }

      if(formSettings.tabbedForm) {
          return (
              <TabbedForm
                  //variant="fullWidth"
                  // centered
                  // indicatorColor="secondary"
                  // textColor="secondary"
                  {...simpleFormRest}
                  record={initialRecord}
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
                                  // record={initalRecord}
                                  formTabIdx={formTabIdx}
                                  addIdInput={addIdInput}
                                  editields={editields}
                                  inputFactory={inputFactory}
                                  api={api}
                                  resource={resource}
                              />}
                              {renderFields === 'direct' && addIdInput && <TextInput disabled source="id" />}
                              {renderFields === 'direct' && addIdInput && <TextInput type="hidden" source="id" label={null} />}
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
            {isDeveloper && <DumpForm />}
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
  } = ApiPlatformUtils.resolveEditorProps(props);

  let {
    formProps,
    renderFields,
    addIdInput,
    toolbar,
    ...rest
  } = props;


  // if(typeof console === 'object') { console.log('EDIT props',resource,props); }

  // let editType = null;
  // if(props.options.configFactory && props.options.configFactory.options && props.options.configFactory.options.editType) {
  //   editType = props.options.configFactory.options.editType;
  // }
  //
  // if(editType === 'drawer') {}


  let editields = fields;
  // let editields = ObjectUtils.clone(fields);
  // let editields = ObjectUtils.cloneDeep(fields);
  // if(typeof console === 'object') { console.log('editields,fields',editields===fields,editields,fields); }
  let validateForm = () => {};
  let formSettings = {};

  if(configFactory.conf) {
    editields = configFactory.conf.getFormFields(editields);
    validateForm = configFactory.conf.validateForm;
    formSettings = configFactory.conf.getFormSettings();
  }


    /**
     * tabbedForm needs to be rebuild by our own
     * 1. it depends on routing, which is difficult
     * 2. it is very slow...
     */
    formSettings.tabbedForm = false;

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

  // if(typeof console === 'object') { console.log('formProps',formProps,editields); }
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

              formSettings={formSettings}
              renderFields={getRenderFields()}
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
