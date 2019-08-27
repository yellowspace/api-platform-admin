import {
  ArrayInput,
  BooleanInput,
  DateInput,
  NumberInput,
  ReferenceArrayInput,
  ReferenceInput,
  required,
  SelectArrayInput,
  SelectInput,
  SimpleFormIterator,
  TextInput,
}                            from 'react-admin';
import React                 from 'react';
import getReferenceNameField from './getReferenceNameField';
import { makeStyles }        from '@material-ui/core';
import MVTInputField         from '../../common/components/react-admin/form/fields/MVTInputField';
import MVTReferenceInput         from '../../common/components/react-admin/form/fields/MVTReferenceInput';
import { isFieldSortable }   from './fieldFactory';

let useStyles = makeStyles(function (theme) {
  return ({
    resetIconFix: theme.custom.content.resetIconFix,
  });
});

export default (field, options) => {
  const props = {...field.inputProps};
  let styles = useStyles();


  if (field.MVTInputField) {
    return (
        <MVTInputField
            fullWidth={true}
            resettable={props.multiline ? false : true}
            clearAlwaysVisible={true}
            className={styles.resetIconFix}


            key={field.name} source={field.name} {...props}
        />
    );
  }

  if (field.input) {
    return (
      <field.input
        fullWidth={true}
        key={field.name}
        options={options}
        source={field.name}
        {...props}
      />
    );
  }

  if (!props.validate && field.required) props.validate = [required()];

  if (null !== field.reference) {

    if(field.MVTReferenceField) {

      let refField = getReferenceNameField(field.reference);
      if(field.refField) {
        refField = field.refField;
      }

      return (
          <MVTReferenceInput
              fullWidth={true}

              key={field.name}
              label={field.name}
              reference={field.reference}
              source={field.name}
              refField={refField}
              {...props}
              allowEmpty
          />
      );
    }

    if (1 === field.maxCardinality) {
      // if(typeof console === 'object') { console.log('field',field,field.reference); }

      let refField = getReferenceNameField(field.reference);
      if(field.refField) {
        refField = field.refField;
      }

      return (
        <ReferenceInput
          fullWidth={true}

          key={field.name}
          label={field.name}
          reference={field.reference.name}
          source={field.name}
          {...props}
          allowEmpty
        >
          <SelectInput optionText={refField} />
        </ReferenceInput>
      );
    }

    return (
      <ReferenceArrayInput
          fullWidth={true}

        key={field.name}
        label={field.name}
        reference={field.reference.name}
        source={field.name}
        {...props}
        allowEmpty
      >
        <SelectArrayInput optionText={getReferenceNameField(field.reference)} />
      </ReferenceArrayInput>
    );
  }

  if ('http://schema.org/identifier' === field.id) {
    const {
      resource: {name},
      prefix = `/${name}/`,
    } = options;

    props.format = value => {
      return 0 === value.indexOf(prefix) ? value.substr(prefix.length) : value;
    };

    props.parse = value => {
      return -1 !== value.indexOf(prefix) ? prefix + value : value;
    };
  }

  switch (field.range) {
    case 'http://www.w3.org/2001/XMLSchema#array':
      return (
        <ArrayInput key={field.name} source={field.name} {...props}>
          <SimpleFormIterator>
            <TextInput />
          </SimpleFormIterator>
        </ArrayInput>
      );

    case 'http://www.w3.org/2001/XMLSchema#integer':
      return <NumberInput key={field.name} source={field.name} {...props} />;

    case 'http://www.w3.org/2001/XMLSchema#decimal':
      return (
        <NumberInput
          fullWidth={true}
          key={field.name}
          source={field.name}
          step="0.1"
          {...props}
        />
      );

    case 'http://www.w3.org/2001/XMLSchema#boolean':
      return <BooleanInput key={field.name} source={field.name} {...props} />;

    case 'http://www.w3.org/2001/XMLSchema#date':
    case 'http://www.w3.org/2001/XMLSchema#dateTime':
      return <DateInput
          fullWidth={true}
          key={field.name} source={field.name} {...props}
      />;

    default:
      return <TextInput
          fullWidth={true}
          resettable={props.multiline ? false : true}
          clearAlwaysVisible={true}
          className={styles.resetIconFix}


          key={field.name} source={field.name} {...props}
      />;
  }
};
