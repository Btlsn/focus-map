import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.resolve(__dirname, '../../focus-map-protocols/src/grpc/rating.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = (grpc.loadPackageDefinition(packageDefinition) as any).rating;

export const getRatingClient = () => {
  return new proto.RatingService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );
};

export const calculateAverageRatings = (workspaceId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const client = getRatingClient();
    console.log('Calling gRPC service with workspaceId:', workspaceId);
    
    client.calculateAverageRatings({ workspaceId }, (error: any, response: any) => {
      if (error) {
        console.error('gRPC client error:', error);
        reject(error);
        return;
      }
      console.log('gRPC response received:', response);
      resolve(response);
    });
  });
}; 