import * as soap from 'soap';

const SOAP_URL = 'http://localhost:8000/wsdl?wsdl';

export const createSoapClient = async () => {
  return new Promise((resolve, reject) => {
    soap.createClient(SOAP_URL, (err, client) => {
      if (err) reject(err);
      else resolve(client);
    });
  });
}; 