import * as soap from 'soap';
import express from 'express';
import { commentService } from './soapService';
import fs from 'fs';
import path from 'path';

export function startSoapServer() {
  const app = express();
  const wsdlPath = path.join(__dirname, 'comment-service.wsdl');
  const xml = fs.readFileSync(wsdlPath, 'utf8');

  app.listen(8000, () => {
    soap.listen(app, '/commentservice', commentService, xml);
    console.log('SOAP server running on port 8000');
  });

  return app;
} 