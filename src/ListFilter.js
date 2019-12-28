import {Filter} from 'react-admin';
import React from 'react';

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

  const parameterAlwaysOn = parameters.length < 8;

  // if(typeof console === 'object') { console.log('ListFilter.parameters, parameterFactory, conf',parameters); }

  return (
    <Filter {...props}>
      {parameters.length > 0 &&
        parameters.map(parameter =>
          parameterFactory(parameter, {
            alwaysOn: parameterAlwaysOn,
          }),
        )}
      {conf && typeof conf.getGridFilter === 'function' &&
       conf.getGridFilter().map(parameter =>
             parameterFactory(parameter, {
               alwaysOn: parameterAlwaysOn,
             }),
         )
      }
    </Filter>
  );
};

export default ListFilter;
