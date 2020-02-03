import {Filter}    from 'react-admin';
import React       from 'react';
import ObjectUtils from '../../common/utils/ObjectUtils';
import { withTranslate }          from 'react-admin';

const resolveProps = props => {
  const {options} = props;
  const {parameterFactory, parameters, configFactory} = options;
  return {
    ...props,
    parameterFactory: parameterFactory,
    parameters: parameters,
    conf: configFactory ? configFactory.conf : null
  };
};

const ListFilter = props => {
  const {parameters, parameterFactory, conf} = resolveProps(props);
  const { translate, ...rest } = props;
  const parameterAlwaysOn = parameters.length < 8;

  // if(typeof console === 'object') { console.log('ListFilter.parameters, parameterFactory, conf',parameters); }
  let defaultFilters = ['q']

  const getStandardFilter = () => {
    let f = [];

    if(parameters.length > 0) {
      parameters.forEach(parameter => {

        if ( ObjectUtils.inArray( defaultFilters, parameter.variable ) ) {
          // if ( typeof console === 'object' ) { console.log( 'getStandardFilter.parameter', parameter ); }

          let p = {...parameter,type: 'search'}

          let d = parameterFactory( p, {
              alwaysOn: true,
              label: translate('grid.search'),
              clearAlwaysVisible: true,
              resettable: true,
              fullWidth: true,
            } );

          f.push(d);
        }
      } );
    }



    return f.length ? f : null;

  };

  return (
    <Filter {...rest} variant="standard">
      {getStandardFilter()}
      {parameters.length > 0 &&
        parameters.map(parameter => {

          if ( ObjectUtils.inArray( defaultFilters, parameter.variable ) ) {
            return null;
          }
          // if ( typeof console === 'object' ) { console.log( 'Filter.parameter', parameter ); }

          return parameterFactory( parameter, {
            alwaysOn: parameterAlwaysOn,
          } );
        })}
      {conf && typeof conf.getGridFilter === 'function' &&
       conf.getGridFilter().map(parameter => {

             // if ( ObjectUtils.inArray( defaultFilters, parameter.variable ) ) {
             //   return null;
             // }

             return parameterFactory( parameter, {
               alwaysOn: parameterAlwaysOn,
             } );
           }
         )
      }
    </Filter>
  );
};

export default withTranslate(ListFilter);
