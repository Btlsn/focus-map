import * as soap from 'soap';
import express from 'express';
import { commentService } from './soapService';
import fs from 'fs';
import path from 'path';

export function startSoapServer() {
  const soapApp = express();
  const wsdlPath = path.join(__dirname, 'comment-service.wsdl');
  const xml = fs.readFileSync(wsdlPath, 'utf8');

  const server = soapApp.listen(8000, () => {
    console.log('SOAP server running on port 8000');
  });

  soap.listen(soapApp, '/wsdl', commentService, xml);

  return server;
} 