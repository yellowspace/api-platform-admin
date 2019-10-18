import {
  ArrayInput,
  BooleanInput,
  DateInput,
  DateTimeInput,
  NumberInput,
  ReferenceArrayInput,
  ReferenceInput,
  required,
  SelectArrayInput,
  AutocompleteInput,
  AutocompleteArrayInput,
  SelectInput,
  SimpleFormIterator,
  TextInput,
}                            from 'react-admin';
import React                 from 'react';
import getReferenceNameField from './getReferenceNameField';
import { makeStyles }        from '@material-ui/core';
import MVTInputField         from '../../common/components/react-admin/form/fields/MVTInputField';
import MVTReferenceInput     from '../../common/components/react-admin/form/fields/MVTReferenceInput';
import { isFieldSortable }   from './fieldFactory';
import MVTSelectField        from '../../common/components/react-admin/form/fields/MVTSelectField';
import MVTDateTimeInput      from '../../common/components/react-admin/form/fields/MVTDateTimeInput';

let useStyles = makeStyles(function (theme) {
  return ({
    resetIconFix: theme.custom.content.resetIconFix,
    autocompleteContainer: {
      fontSize: '5rem'
    }
  });
});

// const useAutocompleteArrayInputStyles = makeStyles({
//   root: {
//     flexGrow: 1,
//     height: 450,
//   },
//   container: {
//     flexGrow: 1,
//     position: 'relative',
//   },
// });

var useAutocompleteSugestionArrayInputStyles = makeStyles({
  suggestionsContainer: {
    zIndex: 2210,
  },
});

export default (field, options) => {
  const props = {...field.inputProps};
  let styles = useStyles();

  // if(typeof console === 'object') { console.log('field %o, options %o',field, options,props); }


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

  if (field.MVTSelectField) {
    return (
        <MVTSelectField
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

    if(field.MVTReferenceField && 1 === field.maxCardinality) {

      let refField = getReferenceNameField(field.reference);
      if(field.refField) {
        refField = field.refField;
      }
      // if(typeof console === 'object') { console.log('MVTReferenceField.field',field,field.reference,refField); }

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

      let refField = getReferenceNameField(field.reference);
      if(field.refField) {
        refField = field.refField;
      }

      // if(typeof console === 'object') { console.log('ReferenceInput.field',field,field.reference,refField); }

      //
      // return (
      //     <ReferenceInput
      //         fullWidth={true}
      //
      //         key={field.name}
      //         label={field.name}
      //         reference={field.reference.name}
      //         source={field.name}
      //         {...props}
      //         allowEmpty
      //     >
      //       <AutocompleteInput optionText={refField} />
      //     </ReferenceInput>
      // );

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

    // return (
    //     <AutocompleteInput
    //         label={field.name}
    //         // source={field.name}
    //         source={field.reference.name}
    //         key={field.name}
    //         optionText={getReferenceNameField(field.reference)}
    //         {...props}
    //         allowEmpty
    //     />
    // );
    // let autocompleteArrayInputStyles = useAutocompleteArrayInputStyles();

    if(field.AutocompleteArrayInput) {
      let autocompleteSugestionArrayInputStyles = useAutocompleteSugestionArrayInputStyles();

      return (
          <ReferenceArrayInput
              fullWidth={true}

              key={field.name}
              label={field.name}
              reference={field.reference.name}
              source={field.name}
              defaultValue={[]}
              {...props}
              allowEmpty
          >
            <AutocompleteArrayInput
                optionText={getReferenceNameField( field.reference )}
                className={styles.autocompleteContainer}
                options={{
                  suggestionsContainerProps: {
                    classes: autocompleteSugestionArrayInputStyles
                  }
                }}
            />
          </ReferenceArrayInput>
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
      return (
          <NumberInput
              fullWidth={true}

              key={field.name}
              source={field.name}
              {...props}
          />
      );

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
    // case 'http://www.w3.org/2001/XMLSchema#dateTime':

      return <DateInput
          fullWidth={true}
          key={field.name} source={field.name} {...props}
      />;


    case 'http://www.w3.org/2001/XMLSchema#dateTime':
      return <MVTDateTimeInput
          fullWidth={true}
          key={field.name}
          source={field.name}
          {...props}
          // variant="outlined"
      />;


    case 'http://www.w3.org/2001/XMLSchema#dateTime':
      return <DateTimeInput
          fullWidth={true}
          key={field.name}
          source={field.name}
          {...props}
      />;

    default:
      return <TextInput
          fullWidth={true}
          resettable={props.multiline ? false : true}
          clearAlwaysVisible={true}
          className={styles.resetIconFix}

          key={field.name} source={field.name} {...props}

          // options={{
          //   variant: 'outlined'
          // }}
          // variant="outlined"
          // defaultValue="Success"
          // onChange={(a) => {
          //   if(typeof console === 'object') { console.log('HELLOOOO',a); }
          // }}
      />;
  }
};
