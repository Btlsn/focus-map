import { createClientAsync } from 'soap';

export const createSoapClient = async () => {
  try {
    const client = await createClientAsync('http://localhost:8000/commentservice?wsdl');
    return client;
  } catch (error) {
    console.error('SOAP client creation error:', error);
    throw error;
  }
};

export const getComments = async (workspaceId: string) => {
  try {
    const client = await createSoapClient();
    const result = await client.getCommentsAsync({ workspaceId });
    return result[0].comments;
  } catch (error) {
    console.error('SOAP getComments error:', error);
    throw error;
  }
};

export const addComment = async (workspaceId: string, userId: string, text: string) => {
  try {
    const client = await createSoapClient();
    const result = await client.addCommentAsync({ workspaceId, userId, text });
    return result[0].comment;
  } catch (error) {
    console.error('SOAP addComment error:', error);
    throw error;
  }
};