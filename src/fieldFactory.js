import {
  BooleanField,
  ChipField,
  DateField,
  EmailField,
  NumberField,
  ReferenceField,
  ReferenceArrayField,
  SingleFieldList,
  TextField,
  UrlField,
} from 'react-admin';
import React from 'react';
import getReferenceNameField from './getReferenceNameField';

export const isFieldSortable = (field, resource) => {
  return (
    resource.parameters.filter(parameter => parameter.variable === field.name)
      .length > 0 &&
    resource.parameters.filter(
      parameter => parameter.variable === `order[${field.name}]`,
    ).length > 0
  );
};

export default (field, options) => {
  const props = {...field.fieldProps};
  if (field.field) {
    return (
      <field.field
        key={field.name}
        options={options}
        source={field.name}
        {...props}
      />
    );
  }

  if (null !== field.reference) {
    if (1 === field.maxCardinality) {
      // if(typeof console === 'object') { console.log('field',field); }
      return (
        <ReferenceField
          basePath={field.reference.name}
          source={field.name}
          reference={field.reference.name}
          key={field.name}
          sortable={isFieldSortable(field, options.resource)}
          {...props}
          allowEmpty>
          <ChipField source={getReferenceNameField(field.reference)} />
        </ReferenceField>
      );
    }

    const referenceNameField = getReferenceNameField(field.reference);
    return (
      <ReferenceArrayField
        source={field.name}
        reference={field.reference.name}
        key={field.name}
        sortable={isFieldSortable(field, options.resource)}
        {...props}>
        <SingleFieldList>
          <ChipField source={referenceNameField} key={referenceNameField} />
        </SingleFieldList>
      </ReferenceArrayField>
    );
  }

  switch (field.id) {
    case 'http://schema.org/email':
      return (
        <EmailField
          key={field.name}
          source={field.name}
          sortable={isFieldSortable(field, options.resource)}
          {...props}
        />
      );

    case 'http://schema.org/url':
      return (
        <UrlField
          key={field.name}
          source={field.name}
          sortable={isFieldSortable(field, options.resource)}
          {...props}
        />
      );

    default:
    // Do nothing
  }

  switch (field.range) {
    case 'http://www.w3.org/2001/XMLSchema#integer':
    case 'http://www.w3.org/2001/XMLSchema#float':
      return (
        <NumberField
          key={field.name}
          source={field.name}
          sortable={isFieldSortable(field, options.resource)}
          {...props}
        />
      );

    case 'http://www.w3.org/2001/XMLSchema#date':
    case 'http://www.w3.org/2001/XMLSchema#dateTime':
      return (
        <DateField
          key={field.name}
          source={field.name}
          sortable={isFieldSortable(field, options.resource)}
          {...props}
        />
      );

    case 'http://www.w3.org/2001/XMLSchema#boolean':
      return (
        <BooleanField
          key={field.name}
          source={field.name}
          sortable={isFieldSortable(field, options.resource)}
          {...props}
        />
      );

    default:
      return (
        <TextField
          key={field.name}
          source={field.name}
          sortable={isFieldSortable(field, options.resource)}
          {...props}
        />
      );
  }
};
