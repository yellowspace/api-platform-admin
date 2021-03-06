import {
  // BooleanField,
  ChipField,
  // DateField,
  // EmailField,
  // NumberField,
  ReferenceField,
  ReferenceArrayField,
  SingleFieldList,
  // TextField,
  // UrlField,
  FunctionField
}                             from 'react-admin';
import React                  from 'react';
import getReferenceNameField  from './getReferenceNameField';
import { MVTListField }       from '../../common/components/react-admin';
import MVTReferenceField      from '../../common/components/react-admin/grid/fields/MVTReferenceField';
import MVTReferenceArrayField from '../../common/components/react-admin/grid/fields/MVTReferenceArrayField';
import { makeStyles }         from '@material-ui/core';
import InlineEditorField      from '../../common/components/react-admin/form/fields/InlineEditorField';
import ReferenceFieldEditor from "../../common/components/react-admin/form/editors/ReferenceFieldEditor";
// import EmptyComponent        from '../../common/components/common/EmptyComponent';


var referenceStyles = makeStyles(function (theme) { return ({
  link: {
    textDecoration: 'none',
    color: theme.palette.textColors.link,
  },
}); });

export const isFieldSortable = (field, resource) => {
  // if(typeof console === 'object') { console.log('isFieldSortable',field, field.isSortable, resource); }
  if(field.isSortable === true) return true;
  // if(field.isSortable) return true;

  if(typeof resource.parameters !== 'object') {
    return false;
  }

  return (
      resource.parameters.filter(
          parameter => parameter.variable === `order[${field.name}]`,
      ).length > 0
  );

  // return (
  //   resource.parameters.filter(parameter => parameter.variable === field.name)
  //     .length > 0 &&
  //   resource.parameters.filter(
  //     parameter => parameter.variable === `order[${field.name}]`,
  //   ).length > 0
  // );
};

export default (field, options) => {
  const props = {...field.fieldProps};


  // if (field.JSX) {
  //   return (
  //       React.cloneElement( field.JSX, {key: field.name,options:options,source: field.name,...props} )
  //   );
  // }


  if(field.InlineEditorField) {
    return (
        <InlineEditorField
            // field={field}

            key={field.name}
            options={options}
            source={field.name}
            schemaId={field.id}
            schemaRange={field.range}
            sortable={isFieldSortable(field, options.resource)}
            {...props}

        />
    );
  }


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

  if (null !== field.reference && field.reference !== undefined) {
    // if(typeof console === 'object') { console.log('fieldFactory.field.reference',field,field.reference); }
    let refStyles = referenceStyles();
    const referenceNameField = getReferenceNameField(field.reference);

    if(field.ReferenceFieldEditor) {
      return (
          <ReferenceFieldEditor
              childSource={getReferenceNameField(field.reference)}
              basePath={field.reference.name}
              source={field.name}
              reference={field.reference}
              maxCardinality={field.maxCardinality}
              key={field.name}
              sortable={isFieldSortable(field, options.resource)}
              {...props}
              allowEmpty
          />
      );
    }


    if(field.MVTReferenceField) {
      return (
          <MVTReferenceField
              childSource={getReferenceNameField(field.reference)}
              basePath={field.reference.name}
              source={field.name}
              reference={field.reference}
              maxCardinality={field.maxCardinality}
              key={field.name}
              sortable={isFieldSortable(field, options.resource)}
              {...props}
              allowEmpty
          />
      );
    }

    if (1 === field.maxCardinality) {
      // if(typeof console === 'object') { console.log('field',field); }
      return (
        <ReferenceField
          classes={refStyles}
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

    if(field.MVTReferenceArrayField) {
      return (
          <MVTReferenceArrayField
              childSource={getReferenceNameField(field.reference)}
              basePath={field.reference.name}
              source={field.name}
              reference={field.reference}
              maxCardinality={field.maxCardinality}
              key={field.name}
              sortable={isFieldSortable(field, options.resource)}
              {...props}
              allowEmpty
          />
      );
    }

    return (
      <ReferenceArrayField
        source={field.name}
        reference={field.reference.name}
        key={field.name}
        sortable={isFieldSortable(field, options.resource)}
        {...props}>
        <SingleFieldList
            // classes={refStyles}
        >
          <ChipField source={referenceNameField} key={referenceNameField} />
        </SingleFieldList>
      </ReferenceArrayField>
    );
  }


  if(field.FunctionField) {
    return (<FunctionField
        key={field.name}
        options={options}
        source={field.name}
        {...props}
    />);
  }


  return (
      <MVTListField
          key={field.name}
          options={options}
          source={field.name}
          schemaId={field.id}
          schemaRange={field.range}
          sortable={isFieldSortable(field, options.resource)}
          {...props}
      />
  );
  //
  // switch (field.id) {
  //   case 'http://schema.org/email':
  //     return (
  //       <EmailField
  //         key={field.name}
  //         source={field.name}
  //         sortable={isFieldSortable(field, options.resource)}
  //         {...props}
  //       />
  //     );
  //
  //   case 'http://schema.org/url':
  //     return (
  //       <UrlField
  //         key={field.name}
  //         source={field.name}
  //         sortable={isFieldSortable(field, options.resource)}
  //         {...props}
  //       />
  //     );
  //
  //   default:
  //   // Do nothing
  // }
  //
  // switch (field.range) {
  //   case 'http://www.w3.org/2001/XMLSchema#integer':
  //   case 'http://www.w3.org/2001/XMLSchema#float':
  //     return (
  //       <NumberField
  //         key={field.name}
  //         source={field.name}
  //         sortable={isFieldSortable(field, options.resource)}
  //         {...props}
  //       />
  //     );
  //
  //   case 'http://www.w3.org/2001/XMLSchema#date':
  //   case 'http://www.w3.org/2001/XMLSchema#dateTime':
  //     return (
  //       <DateField
  //         key={field.name}
  //         source={field.name}
  //         sortable={isFieldSortable(field, options.resource)}
  //         {...props}
  //       />
  //     );
  //
  //   case 'http://www.w3.org/2001/XMLSchema#boolean':
  //     return (
  //       <BooleanField
  //         key={field.name}
  //         source={field.name}
  //         sortable={isFieldSortable(field, options.resource)}
  //         {...props}
  //       />
  //     );
  //
  //   default:
  //     return (
  //       <TextField
  //         key={field.name}
  //         source={field.name}
  //         sortable={isFieldSortable(field, options.resource)}
  //         {...props}
  //       />
  //     );
  // }
};
